/**
 * Server-only Shopify Admin GraphQL client (back-office only: orders, customers, fulfillment, refunds).
 * Uses the custom app's `shpat_…` token from SHOPIFY_ADMIN_ACCESS_TOKEN. Never exposed to the browser.
 */
import "server-only";
import { SHOPIFY_DOMAIN, SHOPIFY_API_VERSION, ShopifyError } from "./client";

export const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "";

export function isAdminConfigured() {
  return Boolean(SHOPIFY_DOMAIN && ADMIN_TOKEN && !SHOPIFY_DOMAIN.startsWith("your-store"));
}

export async function adminGraphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!isAdminConfigured()) throw new ShopifyError("Shopify Admin API is not configured (SHOPIFY_ADMIN_ACCESS_TOKEN)");
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": ADMIN_TOKEN },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new ShopifyError(`Shopify Admin responded ${res.status}`, await res.text().catch(() => undefined), res.status);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new ShopifyError(json.errors.map((e) => e.message).join("; "), json.errors);
  if (!json.data) throw new ShopifyError("Empty Admin API response");
  return json.data;
}

/* ---------------- Operations used by the admin panel ---------------- */

export const ADMIN_ORDERS = /* GraphQL */ `
  query AdminOrders($first: Int!, $after: String, $query: String) {
    orders(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id name createdAt displayFinancialStatus displayFulfillmentStatus
        totalPriceSet { shopMoney { amount currencyCode } }
        customer { id displayName email }
        shippingAddress { city }
        lineItems(first: 5) { nodes { title quantity } }
      }
    }
  }
`;

export const ADMIN_ORDER = /* GraphQL */ `
  query AdminOrder($id: ID!) {
    order(id: $id) {
      id name createdAt note displayFinancialStatus displayFulfillmentStatus
      totalPriceSet { shopMoney { amount currencyCode } }
      subtotalPriceSet { shopMoney { amount currencyCode } }
      totalShippingPriceSet { shopMoney { amount currencyCode } }
      customer { id displayName email phone }
      shippingAddress { name address1 address2 city zip country phone }
      fulfillments { status trackingInfo { number url company } }
      lineItems(first: 50) { nodes { title quantity sku variantTitle originalTotalSet { shopMoney { amount currencyCode } } image { url } } }
    }
  }
`;

export const ADMIN_CUSTOMERS = /* GraphQL */ `
  query AdminCustomers($first: Int!, $after: String, $query: String) {
    customers(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id displayName email phone createdAt numberOfOrders
        amountSpent { amount currencyCode }
        defaultAddress { city }
        emailMarketingConsent { marketingState }
      }
    }
  }
`;

export const ADMIN_CUSTOMER = /* GraphQL */ `
  query AdminCustomer($id: ID!) {
    customer(id: $id) {
      id displayName firstName lastName email phone createdAt note tags numberOfOrders
      amountSpent { amount currencyCode }
      emailMarketingConsent { marketingState }
      addresses { address1 address2 city zip country phone }
      orders(first: 20, sortKey: CREATED_AT, reverse: true) { nodes { id name createdAt displayFinancialStatus displayFulfillmentStatus totalPriceSet { shopMoney { amount currencyCode } } } }
    }
  }
`;

export const ADMIN_ORDER_NOTE_UPDATE = /* GraphQL */ `
  mutation AdminOrderNote($input: OrderInput!) {
    orderUpdate(input: $input) { order { id note } userErrors { field message } }
  }
`;

export const ADMIN_CUSTOMER_TAGS = /* GraphQL */ `
  mutation AdminCustomerTags($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
  }
`;
