import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

declare global {
  var __r2Client: S3Client | undefined;
}

export const R2_BUCKET_ORIGINALS = process.env.R2_BUCKET_ORIGINALS ?? "makeup-originals";
export const R2_BUCKET_RESULTS = process.env.R2_BUCKET_RESULTS ?? "makeup-results";

function getClient() {
  if (global.__r2Client) return global.__r2Client;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials are not configured. See .env.example for required keys.");
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey }
  });

  if (process.env.NODE_ENV !== "production") global.__r2Client = client;
  return client;
}

export function isStorageConfigured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
  );
}

export async function presignPutUrl(args: {
  bucket: string;
  key: string;
  contentType: string;
  contentLengthMax?: number;
  expiresIn?: number;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: args.bucket,
    Key: args.key,
    ContentType: args.contentType
  });
  return getSignedUrl(getClient(), command, { expiresIn: args.expiresIn ?? 60 * 5 });
}

export async function presignGetUrl(args: {
  bucket: string;
  key: string;
  expiresIn?: number;
}): Promise<string> {
  const command = new GetObjectCommand({ Bucket: args.bucket, Key: args.key });
  return getSignedUrl(getClient(), command, { expiresIn: args.expiresIn ?? 60 * 15 });
}

export async function deleteObject(bucket: string, key: string): Promise<void> {
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export function buildUploadKey(userId: string, ext: string): string {
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  const stamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  return `${userId}/${stamp}-${random}.${safeExt}`;
}

export const ALLOWED_UPLOAD_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
export const UPLOAD_MAX_BYTES = 12 * 1024 * 1024;
