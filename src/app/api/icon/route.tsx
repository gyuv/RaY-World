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
            width: "62%",
            height: "62%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: size * 0.18,
            background:
              "linear-gradient(135deg, #ffe58a 0%, #ffc933 50%, #d99406 100%)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              fontSize: size * 0.3,
              fontWeight: 900,
              color: "#02060f",
              letterSpacing: -2,
            }}
          >
            RaY
          </div>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
