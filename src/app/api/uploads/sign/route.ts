import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import {
  ALLOWED_UPLOAD_MIME,
  R2_BUCKET_ORIGINALS,
  UPLOAD_MAX_BYTES,
  buildUploadKey,
  isStorageConfigured,
  presignPutUrl
} from "@/lib/storage";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { isJsonObject, isSameOriginRequest } from "@/lib/request-security";

type SignRequest = {
  contentType?: string;
  contentLength?: number;
  filename?: string;
};

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ code: "invalid_origin" }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json({ code: "storage_unconfigured" }, { status: 503 });
  }

  const limited = await rateLimit(`upload:${user.id}:${requestIp(request)}`, 20, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ code: "rate_limited" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }
  if (!isJsonObject(payload)) {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }
  const body = payload as SignRequest;
  const contentType = body.contentType ?? "";
  const contentLength = body.contentLength ?? 0;

  if (!ALLOWED_UPLOAD_MIME.has(contentType)) {
    return NextResponse.json(
      { code: "invalid_content_type", allowed: Array.from(ALLOWED_UPLOAD_MIME) },
      { status: 400 }
    );
  }

  if (!contentLength || contentLength > UPLOAD_MAX_BYTES) {
    return NextResponse.json(
      { code: "invalid_content_length", maxBytes: UPLOAD_MAX_BYTES },
      { status: 400 }
    );
  }

  const ext = contentType.split("/")[1] ?? "jpg";
  const uploadKey = buildUploadKey(user.id, ext);

  const url = await presignPutUrl({
    bucket: R2_BUCKET_ORIGINALS,
    key: uploadKey,
    contentType,
    contentLength,
    expiresIn: 60 * 5
  });

  return NextResponse.json({ uploadUrl: url, uploadKey, expiresInSeconds: 300 });
}
