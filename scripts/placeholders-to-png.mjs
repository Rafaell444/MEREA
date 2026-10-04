/**
 * Shopify product media does not accept SVG, so this renders the placeholder SVGs that the demo catalog
 * actually uses into PNG files (public/images/placeholders/products-png) for the catalog importer.
 *   node scripts/placeholders-to-png.mjs
 */
import sharp from "sharp";
import { mkdirSync, existsSync } from "fs";
import { pathToFileURL } from "url";
import { execSync } from "child_process";
import { join } from "path";

execSync(`npx esbuild src/lib/catalog/mock-data.ts --bundle --platform=node --format=esm --outfile=.tmp-mock-data.mjs --log-level=error`, { stdio: "inherit" });
const { MODELS, shapeFor } = await import(pathToFileURL(".tmp-mock-data.mjs").href);
const src = join("public", "images", "placeholders", "products");
const out = join("public", "images", "placeholders", "products-png");
mkdirSync(out, { recursive: true });
const names = new Set();
for (const m of MODELS) for (const c of m.colors) for (const v of ["M", "F", "FI"]) names.add(`${shapeFor(m.sku)}-${c.code}-${v}`);
let n = 0;
for (const name of names) {
  const from = join(src, `${name}.svg`);
  if (!existsSync(from)) continue;
  await sharp(from, { density: 110 }).resize(800, 1200).png({ compressionLevel: 9, palette: true }).toFile(join(out, `${name}.png`));
  n++;
}
console.log(`Rendered ${n} PNG placeholders`);
