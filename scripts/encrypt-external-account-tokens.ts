/**
 * Encrypts `ExternalAccount.accessToken` rows that were stored as plaintext
 * before the token-encryption guard (`src/lib/token-encryption.ts`) existed.
 *
 *   npx tsx scripts/encrypt-external-account-tokens.ts          # dry run
 *   npx tsx scripts/encrypt-external-account-tokens.ts --commit  # applies
 *
 * Tokens that already carry the `enc:v1:` prefix are skipped. Requires
 * ENCRYPTION_KEY or AUTH_SECRET (the same key the app will use to decrypt).
 */
import { PrismaClient } from "@prisma/client";
import { encryptSecret, decryptSecret } from "../src/lib/token-encryption";

const prisma = new PrismaClient();

async function main() {
  const commit = process.argv.includes("--commit");

  const accounts = await prisma.externalAccount.findMany({
    select: { id: true, userId: true, provider: true, accessToken: true, refreshToken: true },
  });

  // Fail fast if the encryption key is missing or rows can't be re-decrypted.
  try {
    const probe = encryptSecret("probe");
    if (decryptSecret(probe) !== "probe") throw new Error("round-trip check failed");
  } catch (err) {
    console.error("!! Token encryption key missing or broken (ENCRYPTION_KEY / AUTH_SECRET):", err);
    process.exit(1);
  }

  let toMigrate = 0;
  let skipped = 0;
  for (const a of accounts) {
    const updates: { accessToken?: string; refreshToken?: string } = {};
    if (a.accessToken && !a.accessToken.startsWith("enc:v1:")) {
      updates.accessToken = encryptSecret(a.accessToken);
      toMigrate++;
    } else {
      skipped++;
    }
    if (a.refreshToken && !a.refreshToken.startsWith("enc:v1:")) {
      updates.refreshToken = encryptSecret(a.refreshToken);
    }

    if (Object.keys(updates).length === 0) continue;

    // Verify the freshly-encrypted value decrypts before writing anything.
    const verify = decryptSecret(updates.accessToken || updates.refreshToken!);
    if (verify === null) {
      console.error(`!! Refusing to encrypt row ${a.id} (${a.userId}/${a.provider}) — decrypt verification failed`);
      process.exit(1);
    }

    if (commit) {
      await prisma.externalAccount.update({ where: { id: a.id }, data: updates });
      console.log(`encrypted ${a.userId}/${a.provider} (${a.id})`);
    } else {
      console.log(`[dry-run] would encrypt ${a.userId}/${a.provider} (${a.id})`);
    }
  }

  console.log(`Done. Plaintext rows found: ${toMigrate}, already-encrypted/skipped: ${skipped}. Mode: ${commit ? "commit" : "dry-run"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());