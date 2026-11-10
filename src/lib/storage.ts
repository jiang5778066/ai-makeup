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

// 新媒体只用服务端对象读取与条件写入，不改变旧上传与美妆12MiB政策。
export async function privateObjectStream(bucket:string,key:string):Promise<AsyncIterable<Uint8Array>> {
  const result=await getClient().send(new GetObjectCommand({Bucket:bucket,Key:key}),{abortSignal:AbortSignal.timeout(30000)});
  if(!result.Body||!(Symbol.asyncIterator in result.Body))throw new Error('media_object_unavailable');
  return result.Body as AsyncIterable<Uint8Array>;
}
export async function putPrivateObjectOnce(bucket:string,key:string,bytes:Buffer,mime:string):Promise<void> {
  try{await getClient().send(new PutObjectCommand({Bucket:bucket,Key:key,Body:bytes,ContentType:mime,IfNoneMatch:'*'}),{abortSignal:AbortSignal.timeout(30000)})}
  catch(error){
    if((error as {$metadata?:{httpStatusCode?:number}})?.$metadata?.httpStatusCode!==412)throw error;
    // 同一内容地址的重放只接受逐字节一致，不能覆写旧结果。
    const chunks:Buffer[]=[];let size=0;
    for await(const chunk of await privateObjectStream(bucket,key)){size+=chunk.length;if(size>bytes.length)throw new Error('media_object_conflict');chunks.push(Buffer.from(chunk))}
    if(!Buffer.concat(chunks).equals(bytes))throw new Error('media_object_conflict');
  }
}
