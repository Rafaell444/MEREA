import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy. Shopify Storefront API is called server-side only,
// so the browser never needs to talk to Shopify directly except for checkout redirects.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://mc.yandex.ru https://top-fwz1.mail.ru`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://cdn.shopify.com https://*.shopify.com https://media.clz.ru https://merea.ru https://mc.yandex.ru",
  "media-src 'self' https://cdn.shopify.com https://media.clz.ru",
  "connect-src 'self' https://mc.yandex.ru https://top-fwz1.mail.ru",
  "frame-src 'self' https://*.shopify.com https://mc.yandex.ru https://yandex.ru",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.myshopify.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // The legacy brand CDN (media.clz.ru) refuses server-side fetches, so the optimizer is bypassed
    // in mock mode. With Shopify connected, cdn.shopify.com images are optimized normally.
    unoptimized: !process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "media.clz.ru" },
      { protocol: "https", hostname: "merea.ru" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
