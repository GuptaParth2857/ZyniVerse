import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

/**
 * SSRF guard for user-supplied webhook URLs.
 *
 * A webhook URL is only dispatchable when:
 *  - the scheme is http: or https:
 *  - the host is NOT a local/private/reserved address, whether given as an
 *    IP literal or resolved from DNS (loopback, RFC1918, link-local including
 *    cloud metadata 169.254.169.254, CGNAT, TEST-NET, multicast/reserved,
 *    IPv6 ULA / link-local / documentation / unspecified).
 *
 * Fail-closed: malformed addresses, DNS failures and empty resolutions are
 * all treated as blocked. Apply this both when a webhook is created and at
 * dispatch time, so rows that pre-date the guard are still protected.
 */

export function expandIPv6(addr: string): number[] | null {
  const raw = addr.split("%")[0].toLowerCase();
  if (!raw.includes(":")) return null;

  // Split off an embedded IPv4 tail: "::ffff:127.0.0.1"
  let rest = raw;
  let embedded: number[] | null = null;
  const v4Match = raw.match(/:((?:\d{1,3}\.){3}\d{1,3})$/);
  if (v4Match) {
    const octets = v4Match[1].split(".").map(Number);
    if (octets.some((n) => n > 255)) return null;
    embedded = [(octets[0] << 8) | octets[1], (octets[2] << 8) | octets[3]];
    rest = raw.slice(0, raw.length - v4Match[1].length);
  }

  const dc = rest.indexOf("::");
  // Only one "::" compression is legal in an IPv6 address.
  if (dc !== -1 && rest.indexOf("::", dc + 2) !== -1) return null;
  let left: string[] = [];
  let right: string[] = [];
  const compressed = dc !== -1;

  if (compressed) {
    left = rest.slice(0, dc).split(":").filter(Boolean);
    right = rest.slice(dc + 2).split(":").filter(Boolean);
  } else {
    left = rest.split(":").filter(Boolean);
  }

  const parseGroup = (g: string): number | null => {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    return parseInt(g, 16);
  };

  const leftNums: number[] = [];
  for (const g of left) {
    const n = parseGroup(g);
    if (n === null) return null;
    leftNums.push(n);
  }
  const rightNums: number[] = [];
  for (const g of right) {
    const n = parseGroup(g);
    if (n === null) return null;
    rightNums.push(n);
  }

  // The embedded IPv4 tail always occupies the final two hextets.
  const tail = embedded ?? [];
  const parts: number[] = [...leftNums, ...rightNums, ...tail];
  if (parts.length > 8) return null;
  if (!compressed && parts.length !== 8) return null;

  while (parts.length < 8) {
    parts.splice(leftNums.length, 0, 0);
  }
  return parts;
}

export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => n < 0 || n > 255)) return true; // malformed -> block
  const [a, b, c] = parts;

  if (a === 0) return true; // 0.0.0.0/8 "this network"
  if (a === 10) return true; // 10.0.0.0/8 RFC1918
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local (incl. cloud metadata 169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 RFC1918
  if (a === 192 && b === 168) return true; // 192.168.0.0/16 RFC1918
  if (a === 192 && b === 0) return true; // 192.0.0.0/24 IETF assignments (incl. TEST-NET-1 192.0.2.0/24)
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15 benchmarking
  if (a === 198 && b === 51 && c === 100) return true; // 198.51.100.0/24 TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return true; // 203.0.113.0/24 TEST-NET-3
  if (a >= 224) return true; // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved
  return false;
}

export function isPrivateIPv6(groups: number[]): boolean {
  if (groups.length !== 8) return true;
  if (groups.every((g) => g === 0)) return true; // "::" unspecified
  if (groups.slice(0, 7).every((g) => g === 0) && groups[7] === 1) return true; // "::1" loopback
  if ((groups[0] & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((groups[0] & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((groups[0] & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  if (groups[0] === 0x2001 && groups[1] === 0x0db8) return true; // 2001:db8::/32 documentation
  if (groups[0] === 0 && groups[1] === 0) return true; // remaining 0::/16 territory (IPv4-compatible etc.)
  return false;
}

/**
 * Returns true when `ip` is a local/private/reserved address that the server
 * must never be allowed to reach. Invalid IP strings are treated as blocked.
 */
export function isBlockedIp(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return isPrivateIPv4(ip);
  if (kind === 6) {
    const groups = expandIPv6(ip);
    if (!groups) return true;
    return isPrivateIPv6(groups);
  }
  return true; // not a parseable IP -> fail closed
}

export type WebhookUrlCheck = { ok: true } | { ok: false; reason: string };

export async function validateWebhookUrl(rawUrl: string): Promise<WebhookUrlCheck> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "Invalid URL format" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "Only http and https URLs are allowed" };
  }

  const hostname = parsed.hostname;
  const stripped = hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;
  const ipKind = isIP(stripped);

  if (ipKind === 4) {
    return isPrivateIPv4(stripped)
      ? { ok: false, reason: "Local or private addresses are not allowed" }
      : { ok: true };
  }
  if (ipKind === 6) {
    const groups = expandIPv6(stripped);
    const blocked = !groups || isPrivateIPv6(groups);
    return blocked
      ? { ok: false, reason: "Local or private addresses are not allowed" }
      : { ok: true };
  }

  // Domain hostname: resolve every address and validate each (fail closed).
  try {
    const addresses = await lookup(stripped, { all: true, verbatim: true });
    if (addresses.length === 0) {
      return { ok: false, reason: "Hostname did not resolve to any address" };
    }
    const bad = addresses.find(({ address }) => isBlockedIp(address));
    if (bad) {
      return { ok: false, reason: `Hostname resolves to a local or private address (${bad.address})` };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "Hostname could not be resolved" };
  }
}