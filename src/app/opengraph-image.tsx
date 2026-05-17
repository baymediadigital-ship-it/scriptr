import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Scriptr — YouTube AI Script Writer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#08080f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Bottom glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            position: "relative",
            zIndex: 1,
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "999px",
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#a78bfa",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            ⚡ $5 trial for 7 days
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            Write better YouTube{" "}
            <span style={{ color: "#a78bfa" }}>scripts</span>{" "}
            in minutes.
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "24px",
              color: "rgba(255,255,255,0.45)",
              maxWidth: "700px",
              lineHeight: 1.5,
            }}
          >
            Find outlier videos, generate AI scripts, track competitors — one toolkit for serious creators.
          </div>

          {/* Domain */}
          <div
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.25)",
              marginTop: "8px",
              letterSpacing: "1px",
            }}
          >
            getscriptr.io
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
