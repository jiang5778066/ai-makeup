import { ImageResponse } from "next/og";
import { PictoWinkMark } from "@/components/platform-brand";
export const alt = "PictoWink — Your ideas. A wink away. AI image and video creation.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpengraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 76px", background: "#f6f4ee", color: "#232027", fontFamily: "sans-serif" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}><div style={{ display: "flex", width: 58, height: 58 }}><PictoWinkMark size={58} /></div><span style={{ fontSize: 38, fontWeight: 700 }}>PictoWink</span></div>
    <div style={{ display: "flex", flexDirection: "column", fontSize: 86, fontWeight: 700, letterSpacing: -3, lineHeight: 1.08 }}><span>Your ideas.</span><span style={{ color: "#6d4aff" }}>A wink away.</span></div>
    <div style={{ display: "flex", fontSize: 26 }}>AI image &amp; video creation</div>
  </div>, size);
}
