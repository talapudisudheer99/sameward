import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(155deg, #0a1526 0%, #0b1424 55%, #070d18 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* Simplified LogoMark geometry — two tapered wings, satori-safe (no gradients-on-stroke) */}
          <svg width={96} height={96} viewBox="0 0 32 32" fill="none">
            <path
              d="M12.6 5.4 29.4 16 12.6 26.6 18.2 16Z"
              fill="#0EA5E9"
            />
            <path
              d="M2.6 8.7 13.3 16 2.6 23.3 6.6 16Z"
              fill="#22D3EE"
              opacity={0.55}
            />
          </svg>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: "0.02em",
              display: "flex",
            }}
          >
            <span style={{ color: "#FFFFFF" }}>Same</span>
            <span style={{ color: "#0EA5E9" }}>ward</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "#94A3B8",
          }}
        >
          Team chat, files, and AI — in one place.
        </div>
      </div>
    ),
    { ...size }
  )
}