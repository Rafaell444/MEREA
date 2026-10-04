/**
 * Imports the demo catalog (src/lib/catalog/mock-data.ts — the real Merea RU assortment structure) into Shopify:
 * collections (one per category handle used by the site) and products with colour variants, sizes, tags, metafields
 * and placeholder images. Requires an Admin API token with write_products + write_inventory (custom app).
 *
 *   npm run shopify:import-catalog            # create everything
 *   npm run shopify:import-catalog -- --dry   # only print what would be created
 *
 * Re-running is safe: existing products (by handle) are updated with productSet, existing collections are reused.
 */
import { readFileSync, existsSync } from "fs";
import { pathToFileURL } from "url";
import { execSync } from "child_process";

if (existsSync(".env")) for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1"); }
const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "";
const version = process.env.SHOPIFY_API_VERSION ?? "2026-10";
// Shopify fetches media from this URL, so localhost is useless until the site is deployed
const rawSite = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const siteUrl = /localhost|127\.0\.0\.1/.test(rawSite) ? "" : rawSite;
const dry = process.argv.includes("--dry");
if (!domain || !token) { console.error("✖ SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_ACCESS_TOKEN missing in .env"); process.exit(1); }

// Compile the TS mock data to a temp JS module (esbuild ships with Next.js)
execSync(`npx esbuild src/lib/catalog/mock-data.ts --bundle --platform=node --format=esm --outfile=.tmp-mock-data.mjs --log-level=error`, { stdio: "inherit" });
const { MODELS, MOCK_COLLECTION_TITLES, COLOR_NAMES } = await import(pathToFileURL(".tmp-mock-data.mjs").href);

async function gql(query, variables = {}) {
  const r = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token }, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(j.errors.map((e) => e.message).join("; "));
  return j.data;
}

const shapeFor = (sku) => { const s = sku.toUpperCase(); if (/^1Z/.test(s)) return "socks"; if (/^1K/.test(s)) return "swim"; if (/^(1TI|1RP|1RB|1RI|1FP|1RG|3RS|3TI)/.test(s)) return "bra"; if (/^(1SN|1SB|3SC|3SN)/.test(s)) return "panty"; if (/^(1GS|1GT|1PL|1GP|1PC)/.test(s)) return "pajama"; if (/^(1WP|1WS|3WP|3WS)/.test(s)) return "pants"; if (/^(1WG|3WG|3WA)/.test(s)) return "skirt"; if (/^3/.test(s)) return "kids"; return "top"; };
const imageUrl = (sku, code, view) => siteUrl ? `${siteUrl}/images/placeholders/products-png/${shapeFor(sku)}-${code}-${view}.png` : null;

// ---- collections ----
const existing = new Map();
let after = null;
do {
  const d = await gql(`query($after:String){ collections(first:250, after:$after){ pageInfo{hasNextPage endCursor} nodes{ id handle } } }`, { after });
  d.collections.nodes.forEach((c) => existing.set(c.handle, c.id));
  after = d.collections.pageInfo.hasNextPage ? d.collections.pageInfo.endCursor : null;
} while (after);

const neededHandles = [...new Set(MODELS.flatMap((m) => m.collections))];
let created = 0;
for (const handle of neededHandles) {
  if (existing.has(handle)) continue;
  const title = MOCK_COLLECTION_TITLES[handle] ?? handle;
  if (dry) { console.log(`[dry] collection ${handle} — ${title}`); continue; }
  const d = await gql(`mutation($input: CollectionInput!){ collectionCreate(input:$input){ collection{ id handle } userErrors{ message } } }`, { input: { handle, title } });
  if (d.collectionCreate.userErrors.length) console.log(`✖ collection ${handle}: ${d.collectionCreate.userErrors[0].message}`);
  else { existing.set(handle, d.collectionCreate.collection.id); created++; }
}
console.log(`✔ collections ready: ${existing.size} (created ${created})`);

// ---- products: one Shopify product per model × colour (like the live site) ----
const TAG_LABEL = { "3=4": "3=4", new: "new", sale: "sale", "recycled-microfiber": "recycled-microfiber", "organic-cotton": "organic-cotton", "recycled-lace": "recycled-lace", merino: "merino", "natural-lifting": "natural-lifting", "anna-pokrov": "anna-pokrov", bestseller: "bestseller", therm: "therm", "superior-softness": "superior-softness" };
let pc = 0, pe = 0;
for (const m of MODELS) {
  for (const color of m.colors) {
    const handle = `${m.slug}-${m.sku}-${color.code.toLowerCase()}`;
    const colorName = COLOR_NAMES[color.code]?.name ?? color.name;
    const hex = COLOR_NAMES[color.code]?.hex ?? color.hex;
    const tags = [...m.tags.map((t) => TAG_LABEL[t] ?? t), `model:${m.sku}`, `color:${color.code}`];
    const sizes = m.sizes;
    const media = ["M", "F", "FI"].map((v) => imageUrl(m.sku, color.code, v)).filter(Boolean).map((src) => ({ originalSource: src, mediaContentType: "IMAGE", alt: `${m.title} — ${colorName}` }));
    const input = {
      handle, title: m.title, descriptionHtml: `<p>${m.description}</p>`, vendor: "Merea", productType: m.type, status: "ACTIVE", tags,
      productOptions: [{ name: "Цвет", values: [{ name: colorName }] }, { name: "Размер", values: sizes.map((s) => ({ name: s })) }],
      variants: sizes.map((s) => ({ optionValues: [{ optionName: "Цвет", name: colorName }, { optionName: "Размер", name: s }], price: String(m.price), compareAtPrice: m.compareAt ? String(m.compareAt) : null, sku: `${m.sku}${color.code}-${s}`, inventoryPolicy: "DENY" })),
      metafields: [
        { namespace: "custom", key: "color_name", type: "single_line_text_field", value: colorName },
        { namespace: "custom", key: "color_hex", type: "single_line_text_field", value: hex },
        { namespace: "custom", key: "model_code", type: "single_line_text_field", value: m.sku },
        { namespace: "custom", key: "colors_count", type: "number_integer", value: String(m.colors.length) },
        ...(m.composition ? [{ namespace: "custom", key: "composition", type: "single_line_text_field", value: m.composition }] : []),
        { namespace: "custom", key: "care", type: "multi_line_text_field", value: "Стирка при 30°C в деликатном режиме. Не отбеливать. Не сушить в сушильной машине. Не гладить." },
        ...(m.sizeGuideKey ? [{ namespace: "custom", key: "size_guide", type: "single_line_text_field", value: m.sizeGuideKey }] : []),
      ],
      collections: m.collections.map((h) => existing.get(h)).filter(Boolean),
      ...(media.length ? { files: media } : {}),
    };
    if (dry) { console.log(`[dry] product ${handle} (${sizes.length} sizes)`); continue; }
    try {
      const d = await gql(`mutation($input: ProductSetInput!){ productSet(input:$input, synchronous:true){ product{ id handle } userErrors{ field message } } }`, { input });
      if (d.productSet.userErrors.length) { pe++; console.log(`✖ ${handle}: ${d.productSet.userErrors.map((e) => `${e.field?.join(".") ?? ""} ${e.message}`).join("; ")}`); }
      else { pc++; process.stdout.write(`\r✔ products: ${pc}`); }
    } catch (e) { pe++; console.log(`\n✖ ${handle}: ${e.message}`); }
    await new Promise((r) => setTimeout(r, 250)); // stay under the Admin API cost limit
  }
}
console.log(`\nDone. Products created/updated: ${pc}, errors: ${pe}.`);
console.log("Inventory: set stock per location in Shopify admin (or pass inventoryQuantities to productSet). Then open Admin → Shopify on the site and run «Сопоставить автоматически».");
