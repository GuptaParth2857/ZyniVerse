import { auth } from "@/lib/auth";

/**
 * Cookie names Auth.js/next-auth v5 uses for the session JWT. If none of these
 * are present the request is anonymous and `auth()` cannot return a user, so
 * there is no reason to pay for the next-auth round trip (cookie parse, decode,
 * and in `lib/auth.ts` a `prisma.user.findUnique` in the session callback).
 *
 * Beacon traffic — analytics sessions, activity tracking, ad impressions — is
 * overwhelmingly anonymous, so this short-circuit removes a large amount of
 * per-pageview server work.
 */
const SESSION_COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export function hasSessionCookie(headers: Headers): boolean {
  const cookie = headers.get("cookie");
  if (!cookie) return false;
  return SESSION_COOKIE_NAMES.some((name) => cookie.includes(`${name}=`));
}

/**
 * Resolve the signed-in user id, or null for anonymous requests — without
 * invoking `auth()` when there is no session cookie to decode.
 *
 * Returns null rather than throwing; callers that need to distinguish
 * "anonymous" from "auth failed" should not rely on that distinction here.
 */
export async function getSessionUserId(headers: Headers): Promise<string | null> {
  if (!hasSessionCookie(headers)) return null;
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
