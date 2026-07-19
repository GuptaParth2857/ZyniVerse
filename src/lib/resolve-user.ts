import { prisma } from "./prisma";
import { auth } from "./auth";

export async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  if (userId) {
    const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (exists) return userId;
  }

  if (session.user.email) {
    const byEmail = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (byEmail) return byEmail.id;
  }

  return null;
}
