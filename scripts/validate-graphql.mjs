/**
 * Validates every GraphQL operation in src/lib/shopify/queries.ts (Storefront API) and src/lib/shopify/admin.ts (Admin API)
 * against Shopify's official schema using the Shopify AI Toolkit validator (installed in ~/.claude/skills/shopify).
 *   node scripts/validate-graphql.mjs [--version 2026-10]
 */
import { readFileSync, existsSync } from "fs";
import { spawnSync } from "child_process";
import { homedir } from "os";
import { join } from "path";

const version = process.argv.includes("--version") ? process.argv[process.argv.indexOf("--version") + 1] : (process.env.SHOPIFY_API_VERSION ?? "2026-10");
const validator = [join(homedir(), ".claude", "skills", "shopify", "scripts", "validate.mjs"), join(process.cwd(), ".claude", "skills", "shopify", "scripts", "validate.mjs")].find(existsSync);
if (!validator) { console.error("Shopify skill validator not found. Install the shopify-ai-toolkit skill first."); process.exit(1); }

function extract(file) {
  const src = readFileSync(file, "utf8");
  const consts = {};
  const re = /export const ([A-Z_]+) = \/\* GraphQL \*\/ `([\s\S]*?)`;/g;
  let m;
  while ((m = re.exec(src))) consts[m[1]] = m[2];
  const resolve = (body, depth = 0) =>
    body.replace(/\$\{([A-Z_]+)\}/g, (_, name) => (name === "IN_CONTEXT" ? "@inContext(country: RU, language: RU)" : depth < 5 ? resolve(consts[name] ?? "", depth + 1) : ""));
  return Object.entries(consts).filter(([n]) => !n.endsWith("_FRAGMENT")).map(([name, body]) => [name, resolve(body)]);
}

const targets = [
  ["storefront-graphql", "src/lib/shopify/queries.ts"],
  ["admin", "src/lib/shopify/admin.ts"],
];
let failed = 0;
for (const [api, file] of targets) {
  console.log(`\n== ${api} (${file}) @ ${version}`);
  for (const [name, code] of extract(file)) {
    const r = spawnSync(process.execPath, [validator, "--api", api, "--version", version, "--code", code, "--json", "--client-name", "merea-headless", "--client-version", "1.0.0", "--model", "claude"], { encoding: "utf8" });
    const out = (r.stdout || "") + (r.stderr || "");
    let verdict = "";
    try {
      const line = out.trim().split("\n").filter((l) => l.startsWith("{")).pop() ?? "{}";
      const j = JSON.parse(line);
      const bad = (j.responses ?? []).filter((x) => x.result === "failed");
      const notes = (j.responses ?? []).filter((x) => x.result === "inform").map((x) => x.resultDetail.replace(/\s+/g, " ").slice(0, 220));
      verdict = j.success && !bad.length ? "VALID" + (notes.length ? " (note: " + notes.join(" | ") + ")" : "") : "INVALID " + bad.map((x) => x.resultDetail).join(" | ").slice(0, 600);
    } catch { verdict = "ERROR " + out.replace(/\s+/g, " ").slice(0, 200); }
    if (!verdict.startsWith("VALID")) failed++;
    console.log(`${verdict.startsWith("VALID") ? "✔" : "✖"} ${name}: ${verdict}`);
  }
}
console.log(failed ? `\n${failed} operation(s) failed validation` : "\nAll operations are valid.");
process.exit(failed ? 1 : 0);
