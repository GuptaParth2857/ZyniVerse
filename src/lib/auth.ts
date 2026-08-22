import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { isDefaultAvatar } from "./avatar";

const providers = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string;
      const password = credentials?.password as string;
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      const hashed = user?.password;
      if (!user || !hashed) return null;

      const match = await bcrypt.compare(password, hashed);
      if (!match) return null;

      return { id: user.id, email: user.email, name: user.username };
    },
  }),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ? [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })]
    : []),
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ? [GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET })]
    : []),
  ...(process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET
    ? [Discord({ clientId: process.env.AUTH_DISCORD_ID, clientSecret: process.env.AUTH_DISCORD_SECRET })]
    : []),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers,
  cookies: {
    pkceCodeVerifier: {
      name: "authjs.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" || account?.provider === "github" || account?.provider === "discord") {
        const email = profile?.email as string;
        if (!email) return false;
        const picture = (profile?.picture as string) || (profile?.avatar_url as string) || null;
        const cleanPicture = picture && !isDefaultAvatar(picture) ? picture : null;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          // Generate a unique username
          let baseName = profile?.name || (profile as { login?: string } | undefined)?.login || email.split("@")[0];
          // Sanitize: keep only alphanumeric and underscores, max 20 chars
          baseName = baseName.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) || "user";
          let username = baseName;
          let suffix = 1;
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseName}${suffix++}`;
          }
          const code = baseName.toLowerCase() + Math.random().toString(36).slice(2, 6);
          await prisma.user.create({
            data: {
              email,
              username,
              password: "",
              provider: account.provider,
              referralCode: code,
              avatar: cleanPicture,
            },
          });
          const newUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
          if (newUser) {
            await prisma.userPoints.upsert({ where: { userId: newUser.id }, update: {}, create: { userId: newUser.id, points: 0, level: 1 } });
          }
        } else if (!existing.avatar && cleanPicture) {
          await prisma.user.update({ where: { id: existing.id }, data: { avatar: cleanPicture } });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        const dbId = (token.dbId as string) || "";
        session.user.id = dbId;
        let avatar: string | null = null;
        if (dbId) {
          const dbUser = await prisma.user.findUnique({
            where: { id: dbId },
            select: { avatar: true },
          });
          avatar = dbUser?.avatar && !isDefaultAvatar(dbUser.avatar) ? dbUser.avatar : null;
        }
        session.user.image = avatar;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "credentials") {
          token.dbId = user.id;
        } else if (account?.provider && user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true },
          });
          token.dbId = dbUser?.id || user.id;
        } else {
          token.dbId = user.id;
        }
      }

      // Always ensure dbId is set for existing sessions (handles stale tokens)
      if (!token.dbId && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true },
        });
        if (dbUser) token.dbId = dbUser.id;
      }

      if (account) token.provider = account.provider;
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
