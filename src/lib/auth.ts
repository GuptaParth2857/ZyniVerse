import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
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
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        const email = profile?.email as string;
        if (!email) return false;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          // Generate a unique username
          let baseName = profile?.name || (profile as any)?.login || email.split("@")[0];
          // Sanitize: keep only alphanumeric and underscores, max 20 chars
          baseName = baseName.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) || "user";
          let username = baseName;
          let suffix = 1;
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseName}${suffix++}`;
          }
          await prisma.user.create({
            data: { email, username, password: "", provider: account.provider },
          });
          const newUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
          if (newUser) {
            await prisma.userPoints.upsert({ where: { userId: newUser.id }, update: {}, create: { userId: newUser.id, points: 0, level: 1 } });
          }
        }
      }
      return true;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.dbId as string) || "";
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
