import { getToken } from "next-auth/jwt";
import type { IncomingMessage } from "http";

/**
 * Authenticates an incoming Socket.IO handshake against the Auth.js session
 * JWT (the same cookie the browser sends to the Next.js app).
 *
 * Returns the DB user id from the token, or null when there is no valid
 * session. The custom Node server (`server.ts`) has no Next.js request
 * context, so we decode the cookie JWT directly with the shared AUTH_SECRET.
 */
export async function getSocketUserId(req: IncomingMessage): Promise<string | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  // Try the __Secure- (https) cookie name first, then the plain (http/dev)
  // name. Each flavour derives its key from a different salt (the cookie name).
  for (const secureCookie of [true, false]) {
    try {
      const token = await getToken({
        req: { headers: req.headers as Record<string, string> },
        secret,
        secureCookie,
      });
      const userId = (token?.dbId as string | undefined) || (token?.sub as string | undefined);
      if (userId) return userId;
    } catch {
      // Invalid token for this cookie flavour — try the other one.
    }
  }
  return null;
}