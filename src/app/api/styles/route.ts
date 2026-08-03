import { NextResponse } from "next/server";
import { getStyleLibrary } from "@/lib/content";
import { toLocale } from "@/lib/i18n";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = toLocale(searchParams.get("locale"));

  return NextResponse.json({ styles: getStyleLibrary(locale) });
}
