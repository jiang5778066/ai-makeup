import { ImageResponse } from "next/og";
import { FrameKoiMark } from "@/components/platform-brand";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex" }}><FrameKoiMark size={180} /></div>, size);
}
