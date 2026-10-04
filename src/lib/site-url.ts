/**
 * Public origin of the site (no trailing slash), used for canonical / hreflang / sitemap URLs.
 * NEXT_PUBLIC_SITE_URL wins; on Vercel a missing or localhost value falls back to the production domain.
 */
export function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel && (!env || env.includes("localhost"))) return `https://${vercel}`;
  return env || "http://localhost:3000";
}
