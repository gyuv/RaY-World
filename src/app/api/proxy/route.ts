import { NextRequest, NextResponse } from "next/server";
import { extractStreamUrl } from "@/lib/extractor";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing stream URL parameter" }, { status: 400 });
  }

  try {
    // 1. Resolve source if target URL is a provider embed page rather than direct stream
    let mediaUrl = targetUrl;
    if (!targetUrl.includes(".m3u8") && !targetUrl.includes(".ts")) {
      const extracted = await extractStreamUrl(targetUrl);
      if (!extracted) {
        return NextResponse.json({ error: "Failed to extract media source" }, { status: 502 });
      }
      mediaUrl = extracted;
    }

    // 2. Fetch stream payload on the server side
    const upstreamResponse = await fetch(mediaUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: new URL(mediaUrl).origin,
      },
      cache: "no-store",
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json({ error: "Upstream server returned an error" }, { status: upstreamResponse.status });
    }

    // 3. Clone body and overwrite response security headers
    const contentType = upstreamResponse.headers.get("content-type") || "application/x-mpegURL";
    const body = upstreamResponse.body;

    const responseHeaders = new Headers({
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "public, max-age=3600",
    });

    return new NextResponse(body as ReadableStream, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json({ error: "Proxy execution failed" }, { status: 500 });
  }
}
