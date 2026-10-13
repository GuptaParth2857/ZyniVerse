import { describe, it, expect, beforeEach } from "vitest";
import { encryptSecret, decryptSecret } from "@/lib/token-encryption";

beforeEach(() => {
  process.env.ENCRYPTION_KEY = "";
  delete process.env.ENCRYPTION_KEY;
  process.env.AUTH_SECRET = "test-auth-secret-0123456789abcdef";
});

describe("token-encryption", () => {
  it("round-trips a token", () => {
    const plain = "simkl-token-abc123";
    const stored = encryptSecret(plain);
    expect(stored).toMatch(/^enc:v1:/);
    expect(stored).not.toContain(plain);
    expect(decryptSecret(stored)).toBe(plain);
  });

  it("returns legacy plaintext rows untouched", () => {
    expect(decryptSecret("legacy-plain-token")).toBe("legacy-plain-token");
  });

  it("returns null for missing values", () => {
    expect(decryptSecret(null)).toBeNull();
    expect(decryptSecret(undefined)).toBeNull();
  });

  it("returns null for tampered ciphertext", () => {
    const stored = encryptSecret("secret-token");
    const tampered = stored.slice(0, -4) + "AAAA";
    expect(decryptSecret(tampered)).toBeNull();
  });

  it("fails to decrypt with a different key", () => {
    const stored = encryptSecret("secret-token");
    process.env.AUTH_SECRET = "a-completely-different-key";
    expect(decryptSecret(stored)).toBeNull();
  });

  it("produces unique ciphertexts for the same input (random IV)", () => {
    const a = encryptSecret("same-token");
    const b = encryptSecret("same-token");
    expect(a).not.toBe(b);
    expect(decryptSecret(a)).toBe("same-token");
    expect(decryptSecret(b)).toBe("same-token");
  });

  it("throws when no encryption key is configured", () => {
    process.env.AUTH_SECRET = "";
    delete process.env.AUTH_SECRET;
    expect(() => encryptSecret("x")).toThrow(/key/i);
  });
});