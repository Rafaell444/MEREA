/**
 * Publishes every product and collection to the Headless sales channel (and the Online Store, if present),
 * so the Storefront API can see them. Requires Admin scopes: read_publications, write_publications, read_products.
 *   npm run shopify:publish
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

const pubs = (await gql(`{ publications(first: 25) { nodes { id name } } }`)).publications.nodes;
const targets = pubs.filter((p) => /headless|online store/i.test(p.name));
if (!targets.length) { console.error("No Headless / Online Store publication found. Publications:", pubs.map((p) => p.name).join(", ")); process.exit(1); }
console.log("Publishing to:", targets.map((p) => p.name).join(", "));
const input = targets.map((p) => ({ publicationId: p.id }));

async function all(field) {
  const ids = []; let after = null;
  do {
    const d = await gql(`query($after:String){ ${field}(first:250, after:$after){ pageInfo{hasNextPage endCursor} nodes{ id } } }`, { after });
    ids.push(...d[field].nodes.map((n) => n.id));
    after = d[field].pageInfo.hasNextPage ? d[field].pageInfo.endCursor : null;
  } while (after);
  return ids;
}

let done = 0, errors = 0;
for (const field of ["collections", "products"]) {
  const ids = await all(field);
  for (const id of ids) {
    try {
      const d = await gql(`mutation($id: ID!, $input: [PublicationInput!]!){ publishablePublish(id:$id, input:$input){ userErrors{ message } } }`, { id, input });
      if (d.publishablePublish.userErrors.length) { errors++; console.log(`✖ ${id}: ${d.publishablePublish.userErrors[0].message}`); } else { done++; process.stdout.write(`\r✔ published: ${done}`); }
    } catch (e) { errors++; console.log(`\n✖ ${id}: ${e.message}`); }
    await new Promise((r) => setTimeout(r, 120));
  }
  console.log(`\n${field}: ${ids.length}`);
}
console.log(`Done. Published: ${done}, errors: ${errors}.`);
