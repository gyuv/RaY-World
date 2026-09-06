import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Generates the RaY-World app icon as a PNG at the requested size, so the PWA
 * manifest / Android wrapper has real icons without shipping binary assets.
 * e.g. /api/icon?size=512
 */
export function GET(req: NextRequest) {
  const raw = Number(req.nextUrl.searchParams.get("size") ?? "512");
  const size = Math.max(48, Math.min(1024, Number.isFinite(raw) ? raw : 512));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a4fe0 0%, #1f6bff 45%, #ffd75e 100%)",
        }}
      >
        <div
          style={{
            width: "64%",
            height: "64%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: size * 0.2,
            background: "linear-gradient(135deg, #15151f 0%, #02060f 100%)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: size * 0.34,
              fontWeight: 900,
              letterSpacing: -2,
            }}
          >
            <span style={{ color: "#e7e9f2" }}>R</span>
            <span style={{ color: "#ec4899" }}>Y</span>
          </div>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
