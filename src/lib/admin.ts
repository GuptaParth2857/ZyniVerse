import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-identity";

export { isAdminEmail, ADMIN_EMAILS } from "@/lib/admin-identity";

export async function getAdminSession() {
  const session = await auth();
  return { session, isAdmin: isAdminEmail(session?.user?.email) };
}

export interface AdminSession extends Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
}

/**
 * Returns the session (narrowed to a non-optional id/email) if the requester
 * is an admin, otherwise null. Callers should return 401/403 when this is null.
 */
export async function requireAdmin(): Promise<AdminSession | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (!isAdminEmail(session.user.email)) return null;
  return session as AdminSession;
}
