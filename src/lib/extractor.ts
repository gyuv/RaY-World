import { headers } from "next/headers";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export async function extractStreamUrl(embedUrl: string): Promise<string | null> {
  try {
    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        // Mask origin as the target provider's own origin
        Referer: new URL(embedUrl).origin,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Regex matchers for raw .m3u8 URLs or common stream source patterns inside script tags
    const m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/);
    if (m3u8Match) return m3u8Match[1];

    // Fallback: Check for unpacked iframe source variables
    const iframeMatch = html.match(/src=["'](https?:\/\/[^"']+)["']/);
    if (iframeMatch) return iframeMatch[1];

    return null;
  } catch (error) {
    console.error("Extraction error:", error);
    return null;
  }
}
