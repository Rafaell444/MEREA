/**
 * Merges translated chunk files (scripts/.i18n/out-<locale>-<n>.json, each a { "русский": "translation" } object)
 * into src/lib/i18n/dictionaries/<locale>.json.
 *   node scripts/i18n-merge.mjs
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "fs";

for (const locale of ["ka", "en"]) {
  const path = `src/lib/i18n/dictionaries/${locale}.json`;
  const dict = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
  let added = 0, bad = 0;
  for (const f of readdirSync("scripts/.i18n").filter((x) => x.startsWith(`out-${locale}-`) && x.endsWith(".json"))) {
    let chunk;
    try { chunk = JSON.parse(readFileSync(`scripts/.i18n/${f}`, "utf8")); } catch (e) { console.log(`✖ ${f}: invalid JSON (${e.message})`); bad++; continue; }
    for (const [k, v] of Object.entries(chunk)) {
      if (typeof v !== "string" || !v.trim()) continue;
      // placeholders must survive translation
      const ph = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");
      if (ph(k) !== ph(v)) { console.log(`⚠ placeholder mismatch in ${f}: ${k.slice(0, 60)}`); continue; }
      if (!dict[k]) added++;
      dict[k] = v;
    }
  }
  const sorted = Object.fromEntries(Object.entries(dict).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(path, JSON.stringify(sorted, null, 1) + "\n");
  console.log(`${locale}: ${Object.keys(sorted).length} entries (+${added})${bad ? `, ${bad} bad chunk files` : ""}`);
}
