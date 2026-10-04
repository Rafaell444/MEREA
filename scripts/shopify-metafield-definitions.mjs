/**
 * Creates product metafield definitions with Storefront read access, so the headless site can read
 * colour/model/composition metafields. Requires Admin scope write_products.
 *   npm run shopify:metafields
 */
import { readFileSync, existsSync } from "fs";
if (existsSync(".env")) for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1"); }
const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "";
const version = process.env.SHOPIFY_API_VERSION ?? "2026-10";
async function gql(query, variables = {}) {
  const r = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token }, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(j.errors.map((e) => e.message).join("; "));
  return j.data;
}
const defs = [
  ["color_name", "Color name", "single_line_text_field"], ["color_hex", "Color hex", "single_line_text_field"], ["model_code", "Model code", "single_line_text_field"],
  ["colors_count", "Colors count", "number_integer"], ["composition", "Composition", "single_line_text_field"], ["care", "Care", "multi_line_text_field"], ["size_guide", "Size guide key", "single_line_text_field"],
];
for (const [key, name, type] of defs) {
  const d = await gql(`mutation($definition: MetafieldDefinitionInput!){ metafieldDefinitionCreate(definition:$definition){ createdDefinition{ id } userErrors{ code message } } }`,
    { definition: { namespace: "custom", key, name, type, ownerType: "PRODUCT", access: { storefront: "PUBLIC_READ" } } });
  const errs = d.metafieldDefinitionCreate.userErrors;
  if (!errs.length) { console.log(`✔ custom.${key} created`); continue; }
  if (errs.some((e) => e.code === "TAKEN")) {
    // already exists → make sure storefront access is on
    const u = await gql(`mutation($definition: MetafieldDefinitionUpdateInput!){ metafieldDefinitionUpdate(definition:$definition){ updatedDefinition{ id } userErrors{ message } } }`,
      { definition: { namespace: "custom", key, ownerType: "PRODUCT", access: { storefront: "PUBLIC_READ" } } });
    console.log(u.metafieldDefinitionUpdate.userErrors.length ? `✖ custom.${key}: ${u.metafieldDefinitionUpdate.userErrors[0].message}` : `✔ custom.${key} updated (storefront access on)`);
  } else console.log(`✖ custom.${key}: ${errs.map((e) => e.message).join("; ")}`);
}
