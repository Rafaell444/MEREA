/**
 * Collects every translatable source string (Russian) used by the storefront:
 *   - t("…") / t(`…`) calls and `// i18n: t("…")` hints in src/
 *   - all Cyrillic strings in the CMS defaults (menus, footer, pages, popups, categories, stores, size guides…)
 * and reports which ones are missing from the ka / en dictionaries.
 *
 *   node scripts/i18n-extract.mjs            # writes scripts/.i18n/keys.json + missing-<locale>.json
 *   node scripts/i18n-extract.mjs --check    # exit 1 if anything is missing
 */
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join, sep } from "path";
import { pathToFileURL } from "url";
import { execSync } from "child_process";

const CYR = /[А-Яа-яЁё]/;
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|mjs)$/.test(f)) out.push(p);
  }
  return out;
}

const keys = new Set();
const unescape = (s) => s.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\`/g, "`").replace(/\\\\/g, "\\");
for (const file of walk("src")) {
  const norm = file.split(sep).join("/");
  if (norm.includes("/admin/") || norm.includes("/i18n/dictionaries/")) continue;
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)) if (CYR.test(m[1])) keys.add(unescape(m[1]));
  for (const m of src.matchAll(/\bt\(\s*`((?:[^`\\$]|\\.)*)`/g)) if (CYR.test(m[1])) keys.add(unescape(m[1]));
}
const fromCode = keys.size;

// CMS defaults: every Cyrillic string value
execSync(`npx esbuild src/lib/cms/defaults.ts --bundle --platform=node --format=esm --outfile=.tmp-defaults.mjs --log-level=error`, { stdio: "inherit" });
const defaults = await import(pathToFileURL(".tmp-defaults.mjs").href + `?t=${Date.now()}`);
(function collect(v) {
  if (typeof v === "string") { if (CYR.test(v)) keys.add(v); return; }
  if (Array.isArray(v)) return v.forEach(collect);
  if (v && typeof v === "object") return Object.values(v).forEach(collect);
})(Object.fromEntries(Object.entries(defaults).filter(([k]) => k.startsWith("DEFAULT_"))));

const all = [...keys].sort((a, b) => a.length - b.length || a.localeCompare(b));
mkdirSync("scripts/.i18n", { recursive: true });
writeFileSync("scripts/.i18n/keys.json", JSON.stringify(all, null, 1));
console.log(`keys: ${all.length} (code: ${fromCode}, cms: ${all.length - fromCode})`);

let missingTotal = 0;
for (const locale of ["ka", "en"]) {
  const path = `src/lib/i18n/dictionaries/${locale}.json`;
  const dict = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
  const missing = all.filter((k) => !dict[k]);
  missingTotal += missing.length;
  writeFileSync(`scripts/.i18n/missing-${locale}.json`, JSON.stringify(missing, null, 1));
  console.log(`${locale}: ${all.length - missing.length} translated, ${missing.length} missing`);
}
if (process.argv.includes("--check") && missingTotal) process.exit(1);
