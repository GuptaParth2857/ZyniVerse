import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const CACHE_IMMUTABLE = "max-age=31536000, immutable";

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_BASE
  );
}

let _client: S3Client | null = null;

function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

export function r2PublicUrl(key: string): string {
  const base = (process.env.R2_PUBLIC_BASE || "").replace(/\/+$/, "");
  return `${base}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function r2Put(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: CACHE_IMMUTABLE,
    })
  );
}

export async function r2PresignedPutUrl(
  key: string,
  contentType: string,
  expiresIn = 900
): Promise<string> {
  return getSignedUrl(
    client(),
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: contentType,
      CacheControl: CACHE_IMMUTABLE,
    }),
    { expiresIn }
  );
}
