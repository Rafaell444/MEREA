/**
 * Creates a Storefront API access token using the Admin API token (for apps created in the Dev Dashboard
 * where the storefront token is not shown). Requires SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN in .env.
 *   npm run shopify:storefront-token
 * Prints the new token once — paste it into .env as SHOPIFY_STOREFRONT_ACCESS_TOKEN.
 */
import { readFileSync, existsSync } from "fs";

if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
}
const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
const admin = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "";
const version = process.env.SHOPIFY_API_VERSION ?? "2026-10";
if (!domain || !admin) {
  console.error("✖ Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN in .env first");
  process.exit(1);
}

const r = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": admin },
  body: JSON.stringify({
    query: `mutation { storefrontAccessTokenCreate(input: { title: "Merea headless storefront" }) { storefrontAccessToken { accessToken title } userErrors { field message } } }`,
  }),
});
const j = await r.json();
if (j.errors) { console.error("✖", j.errors.map((e) => e.message).join("; ")); process.exit(1); }
const res = j.data?.storefrontAccessTokenCreate;
if (!res?.storefrontAccessToken) { console.error("✖", res?.userErrors?.map((e) => e.message).join("; ") ?? "unknown error"); process.exit(1); }
console.log("✔ Storefront API access token created. Add to .env:\n");
console.log(`SHOPIFY_STOREFRONT_ACCESS_TOKEN=${res.storefrontAccessToken.accessToken}`);
