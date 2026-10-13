import crypto from "crypto";

/**
 * Encrypts sensitive tokens (Simkl OAuth access/refresh tokens stored on
 * `ExternalAccount`) at rest using AES-256-GCM.
 *
 * The key is derived from ENCRYPTION_KEY (or AUTH_SECRET when unset) so no new
 * secret is required on any deployment. Stored format: `enc:v1:<iv>:<tag>:<data>`
 * (all base64). Values that do not carry the `enc:v1:` prefix are legacy
 * plaintext rows and are returned as-is — run
 * `scripts/encrypt-external-account-tokens.ts --commit` to migrate them.
 */

const ALGO = "aes-256-gcm";
const PREFIX = "enc:v1:";
const KEY_SALT = "zyniverse:token-encryption:v1";

function deriveKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!secret) throw new Error("Token encryption key missing (set ENCRYPTION_KEY or AUTH_SECRET)");
  return crypto.scryptSync(secret, KEY_SALT, 32);
}

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(stored: string | null | undefined): string | null {
  if (!stored) return null;

  // Legacy plaintext row (written before this guard existed).
  if (!stored.startsWith(PREFIX)) return stored;

  const parts = stored.slice(PREFIX.length).split(":");
  if (parts.length !== 3) return null;

  const [ivB64, tagB64, dataB64] = parts;
  try {
    const decipher = crypto.createDecipheriv(ALGO, deriveKey(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
  } catch {
    // Wrong key, tampered data, or corrupted row — treat as unusable.
    return null;
  }
}