/**
 * Verifies the Shopify Storefront API connection and the scopes the storefront needs.
 *   npm run shopify:check
 */
import { readFileSync, existsSync } from "fs";

if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
}
const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "";
const version = process.env.SHOPIFY_API_VERSION ?? "2026-10";
if (!domain || !token || domain.startsWith("your-store")) {
  console.error("✖ SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN are not set in .env");
  process.exit(1);
}

async function gql(query, variables = {}) {
  const r = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(j.errors.map((e) => e.message).join("; "));
  return j.data;
}

const checks = [
  ["Магазин", `{ shop { name primaryDomain { url } paymentSettings { currencyCode } } }`, (d) => `${d.shop.name} · ${d.shop.primaryDomain.url} · ${d.shop.paymentSettings.currencyCode}`],
  ["Товары (чтение)", `{ products(first: 3) { nodes { handle title variants(first: 1) { nodes { availableForSale } } } } }`, (d) => `${d.products.nodes.length} товара(ов), первый: ${d.products.nodes[0]?.title ?? "—"}`],
  ["Коллекции", `{ collections(first: 50) { nodes { handle title } } }`, (d) => `${d.collections.nodes.length}: ${d.collections.nodes.slice(0, 6).map((c) => c.handle).join(", ")}…`],
  ["Фильтры коллекции", `{ collections(first: 1) { nodes { handle products(first: 1) { filters { label } } } } }`, (d) => d.collections.nodes[0] ? `${d.collections.nodes[0].products.filters.map((f) => f.label).join(", ") || "фильтров нет"}` : "нет коллекций"],
  ["Поиск", `{ search(query: "a", first: 1, types: PRODUCT) { totalCount } }`, (d) => `totalCount=${d.search.totalCount}`],
  ["Корзина (создание)", `mutation { cartCreate { cart { id checkoutUrl } userErrors { message } } }`, (d) => d.cartCreate.cart ? `checkoutUrl: ${d.cartCreate.cart.checkoutUrl}` : d.cartCreate.userErrors.map((e) => e.message).join("; ")],
  ["Клиенты (customerAccessTokenCreate)", `mutation { customerAccessTokenCreate(input: { email: "probe@example.com", password: "probe" }) { customerUserErrors { code message } } }`, (d) => `доступно (ответ: ${d.customerAccessTokenCreate.customerUserErrors[0]?.code ?? "ok"})`],
];

let failed = 0;
for (const [name, query, fmt] of checks) {
  try {
    const d = await gql(query);
    console.log(`✔ ${name}: ${fmt(d)}`);
  } catch (e) {
    failed++;
    console.log(`✖ ${name}: ${e.message}`);
  }
}
console.log(failed ? `\n${failed} проверок не прошло. Проверь scopes приложения в Shopify (см. README).` : "\nВсе проверки пройдены — сайт готов работать с этим магазином.");


// ---------- Admin API (back-office) ----------
const admin = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "";
if (admin) {
  console.log("\nAdmin API:");
  const adminGql = async (query) => {
    const r = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": admin }, body: JSON.stringify({ query }) });
    const j = await r.json();
    if (j.errors) throw new Error(j.errors.map((e) => e.message).join("; "));
    return j.data;
  };
  const adminChecks = [
    ["Магазин", `{ shop { name } }`, (d) => d.shop.name],
    ["Товары (read_products)", `{ products(first: 1) { nodes { title } } }`, (d) => `${d.products.nodes.length} шт.`],
    ["Заказы (read_orders)", `{ orders(first: 1) { nodes { name } } }`, (d) => `${d.orders.nodes.length} шт.`],
    ["Клиенты (read_customers)", `{ customers(first: 1) { nodes { email } } }`, (d) => `${d.customers.nodes.length} шт.`],
    ["Scopes приложения", `{ currentAppInstallation { accessScopes { handle } } }`, (d) => d.currentAppInstallation.accessScopes.map((s) => s.handle).join(", ")],
  ];
  for (const [name, query, fmt] of adminChecks) {
    try { console.log(`✔ ${name}: ${fmt(await adminGql(query))}`); } catch (e) { console.log(`✖ ${name}: ${e.message}`); }
  }
}

process.exit(failed ? 1 : 0);
