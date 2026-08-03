import { ImageResponse } from "next/og";

export const alt = "AI Makeup Studio — virtual makeup try-on and beauty advisor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f4efe7",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          fontFamily: "system-ui, sans-serif",
          color: "#11100e"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              background: "#9d1f32",
              color: "#fbf7ef",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700
            }}
          >
            M
          </div>
          <div style={{ fontSize: 26, color: "#25211e", letterSpacing: -0.4 }}>AI Makeup Studio</div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6
          }}
        >
          <div style={{ fontSize: 92, fontWeight: 600, lineHeight: 1.02, letterSpacing: -1.8 }}>
            Try makeup ideas
          </div>
          <div
            style={{
              fontSize: 92,
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: -1.8,
              color: "#9d1f32"
            }}
          >
            before they touch your face.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#25211e",
            fontSize: 22
          }}
        >
          <span>AI generator · Virtual try-on · Beauty advisor</span>
          <span style={{ color: "#b7aa9a" }}>aimakeup.studio</span>
        </div>
      </div>
    ),
    size
  );
}
