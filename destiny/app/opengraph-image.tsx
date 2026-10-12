import { ImageResponse } from "next/og";
import { APP_DESCRIPTION, APP_NAME, SITE_URL } from "@/lib/site";

export const alt = `${APP_NAME} — track your monthly spending in naira`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#09090b",
          color: "#fafafa",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "#fafafa",
              color: "#09090b",
              fontSize: "40px",
              fontWeight: 700,
            }}
          >
            D
          </div>
          <div style={{ fontSize: "28px", color: "#a1a1aa" }}>
            Track every naira
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ fontSize: "76px", fontWeight: 700, lineHeight: 1.1 }}>
            {APP_NAME}
          </div>
          <div
            style={{
              fontSize: "30px",
              color: "#a1a1aa",
              lineHeight: 1.4,
              maxWidth: "900px",
            }}
          >
            {APP_DESCRIPTION}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "26px", color: "#71717a" }}>
          {SITE_URL.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    { ...size }
  );
}
