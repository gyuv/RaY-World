/**
 * Content-Security-Policy for RaY-World.
 *
 * This is genuine, server-enforced hardening (unlike client-side right-click
 * blocking). It constrains where scripts, styles, images, frames and
 * connections may come from, and forbids other sites from framing yours.
 *
 * Notes / where to extend:
 *   - `frame-src` must list every host you embed in an <iframe>. YouTube (for
 *     trailers) is allowed. When you add a licensed streaming embed in
 *     getStreamSources(kind:"embed"), ADD its host here or the iframe is blocked.
 *   - `media-src` / `connect-src` allow direct video files + HLS from your own
 *     origin; add your CDN/Mux/Cloudflare Stream hosts there when you use them.
 *   - Next.js needs 'unsafe-inline' for its hydration/bootstrap scripts and for
 *     Tailwind's injected styles (nonce-based CSP would force every page to be
 *     dynamically rendered, losing static/ISR — not worth it here).
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://image.tmdb.org https://i.ytimg.com data: blob:",
  "media-src 'self' blob: https:",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://peachify.top https://2embed.cc https://vidsrc.sbs",
  // The native HLS player (hls.js) fetches .m3u8 manifests + .ts/.m4s segments
  // over HTTPS from whatever authorized CDN a source points at, so connect-src
  // allows https:. Google Cast also talks to gstatic. blob: covers hls.js worker.
  "connect-src 'self' https: blob: data:",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Belt-and-braces clickjacking protection (older browsers).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Legacy / convenience redirects can be added here.
    ];
  },
};

export default nextConfig;
