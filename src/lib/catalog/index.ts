import "server-only";
import type { CatalogProvider } from "./types";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { mockProvider } from "./mock-provider";

let cached: CatalogProvider | null = null;

/**
 * Returns the active catalog provider.
 * - Shopify Storefront API when SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_ACCESS_TOKEN are set
 * - Built-in mock catalog otherwise (design/preview mode)
 */
export async function getCatalog(): Promise<CatalogProvider> {
  if (cached) return cached;
  if (isShopifyConfigured()) {
    const { shopifyProvider } = await import("@/lib/shopify/provider");
    cached = shopifyProvider;
  } else {
    cached = mockProvider;
  }
  return cached;
}

export function catalogMode(): "shopify" | "mock" {
  return isShopifyConfigured() ? "shopify" : "mock";
}

export * from "./types";
