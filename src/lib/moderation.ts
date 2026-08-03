import { DetectFacesCommand, DetectModerationLabelsCommand, RekognitionClient } from "@aws-sdk/client-rekognition";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { R2_BUCKET_ORIGINALS } from "@/lib/storage";

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: "nsfw" | "minor" | "no_face" | "multiple_faces"; details?: string };

declare global {
  var __rekognitionClient: RekognitionClient | undefined;
  var __r2DownloadClient: S3Client | undefined;
}

const MIN_ADULT_AGE = 18;
const NSFW_LABEL_CONFIDENCE = 80;

function isAwsConfigured() {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION
  );
}

function getRekognition() {
  if (global.__rekognitionClient) return global.__rekognitionClient;
  const client = new RekognitionClient({ region: process.env.AWS_REGION! });
  if (process.env.NODE_ENV !== "production") global.__rekognitionClient = client;
  return client;
}

function getR2Download() {
  if (global.__r2DownloadClient) return global.__r2DownloadClient;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
    }
  });
  if (process.env.NODE_ENV !== "production") global.__r2DownloadClient = client;
  return client;
}

async function fetchObjectBytes(uploadKey: string): Promise<Uint8Array> {
  const response = await getR2Download().send(
    new GetObjectCommand({ Bucket: R2_BUCKET_ORIGINALS, Key: uploadKey })
  );
  if (!response.Body) throw new Error("storage_get_failed");
  return response.Body.transformToByteArray();
}

const BLOCKED_TOP_LEVEL = new Set(["Explicit Nudity", "Sexual Activity", "Violence", "Hate Symbols"]);

export async function moderateImage(uploadKey: string): Promise<ModerationResult> {
  if (!isAwsConfigured()) throw new Error("moderation_unconfigured");

  const bytes = await fetchObjectBytes(uploadKey);
  const rekognition = getRekognition();

  const [labels, faces] = await Promise.all([
    rekognition.send(
      new DetectModerationLabelsCommand({ Image: { Bytes: bytes }, MinConfidence: NSFW_LABEL_CONFIDENCE })
    ),
    rekognition.send(new DetectFacesCommand({ Image: { Bytes: bytes }, Attributes: ["AGE_RANGE"] }))
  ]);

  const blocked = labels.ModerationLabels?.find((label) =>
    label.ParentName ? BLOCKED_TOP_LEVEL.has(label.ParentName) : BLOCKED_TOP_LEVEL.has(label.Name ?? "")
  );
  if (blocked) {
    return { ok: false, reason: "nsfw", details: blocked.Name ?? undefined };
  }

  const detectedFaces = faces.FaceDetails ?? [];
  if (detectedFaces.length === 0) return { ok: false, reason: "no_face" };
  if (detectedFaces.length > 1) return { ok: false, reason: "multiple_faces" };

  const ageHigh = detectedFaces[0].AgeRange?.High ?? 0;
  const ageLow = detectedFaces[0].AgeRange?.Low ?? 0;
  if (ageHigh < MIN_ADULT_AGE || ageLow < MIN_ADULT_AGE - 4) {
    return { ok: false, reason: "minor", details: `ageRange=${ageLow}-${ageHigh}` };
  }

  return { ok: true };
}
