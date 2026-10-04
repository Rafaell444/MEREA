/**
 * Server-only Shopify Storefront API client.
 * The token never reaches the browser: every storefront call goes through
 * server components, server actions or /api route handlers.
 */
import "server-only";

export const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "") ?? "";
export const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "";
/** Private Storefront token from the Shopify "Headless" app (server-to-server). Preferred over the public token when set. */
export const SHOPIFY_PRIVATE_TOKEN = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ?? "";
export const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-10";

export function isShopifyConfigured() {
  return Boolean(SHOPIFY_DOMAIN && (SHOPIFY_TOKEN || SHOPIFY_PRIVATE_TOKEN) && !SHOPIFY_DOMAIN.startsWith("your-store"));
}

export class ShopifyError extends Error {
  constructor(message: string, public readonly errors?: unknown, public readonly status?: number) {
    super(message);
    this.name = "ShopifyError";
  }
}

type GraphQLResponse<T> = { data?: T; errors?: { message: string; extensions?: unknown }[] };

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: { cache?: RequestCache; revalidate?: number | false; tags?: string[]; buyerIp?: string } = {},
): Promise<T> {
  if (!isShopifyConfigured()) throw new ShopifyError("Shopify is not configured");
  const url = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
  const headers: Record<string, string> = { "Content-Type": "application/json", "Accept-Language": "ru" };
  if (SHOPIFY_PRIVATE_TOKEN) headers["Shopify-Storefront-Private-Token"] = SHOPIFY_PRIVATE_TOKEN;
  else headers["X-Shopify-Storefront-Access-Token"] = SHOPIFY_TOKEN;
  if (options.buyerIp) headers["Shopify-Storefront-Buyer-IP"] = options.buyerIp;

  // Operations declaring $country/$language get the market + the visitor's language (Shopify translations)
  let vars = variables;
  if (query.includes("$language: LanguageCode")) {
    const { getLocale } = await import("@/lib/i18n/server");
    const { SHOPIFY_LANGUAGE } = await import("@/lib/i18n/config");
    vars = { country: COUNTRY, language: SHOPIFY_LANGUAGE[await getLocale()], ...variables };
  }
  const init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = { method: "POST", headers, body: JSON.stringify({ query, variables: vars }) };
  if (options.cache === "no-store" || options.revalidate === false) init.cache = "no-store";
  else init.next = { revalidate: options.revalidate ?? 60, ...(options.tags ? { tags: options.tags } : {}) };
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    const cause = (e as Error & { cause?: Error }).cause;
    throw new ShopifyError(`Shopify request failed: ${(e as Error).message}${cause ? ` (${cause.message})` : ""}`);
  }

  if (!res.ok) {
    throw new ShopifyError(`Shopify responded ${res.status}`, await res.text().catch(() => undefined), res.status);
  }
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e) => e.message).join("; "), json.errors);
  }
  if (!json.data) throw new ShopifyError("Empty Shopify response");
  return json.data;
}

/** `@inContext(...)` directive. Country/language come from env so the store's Markets setup can be matched. */
const COUNTRY = (process.env.SHOPIFY_COUNTRY ?? "GE").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2) || "GE";
const LANGUAGE = (process.env.SHOPIFY_LANGUAGE ?? "KA").toUpperCase().replace(/[^A-Z_]/g, "").slice(0, 5) || "KA";
export const IN_CONTEXT = `@inContext(country: ${COUNTRY}, language: ${LANGUAGE})`;

export type ShopInfo = { name: string; domain: string; currency: string; apiVersion: string };

/** Lightweight connectivity check used by the admin panel and `npm run shopify:check`. */
export async function shopInfo(): Promise<ShopInfo> {
  const data = await storefront<{ shop: { name: string; primaryDomain: { url: string }; paymentSettings: { currencyCode: string } } }>(
    `query ShopInfo { shop { name primaryDomain { url } paymentSettings { currencyCode } } }`, {}, { cache: "no-store" },
  );
  return { name: data.shop.name, domain: data.shop.primaryDomain.url, currency: data.shop.paymentSettings.currencyCode, apiVersion: SHOPIFY_API_VERSION };
}

/**
 * `quantityAvailable` needs the Storefront scope unauthenticated_read_product_inventory.
 * Set SHOPIFY_READ_INVENTORY=true once that permission is enabled on the Headless app to get "low stock" indicators.
 */
export const INVENTORY_FIELD = process.env.SHOPIFY_READ_INVENTORY === "true" ? "quantityAvailable" : "";
