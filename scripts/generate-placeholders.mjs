/**
 * Generates original placeholder artwork (SVG) for the demo catalog and CMS defaults,
 * so the project does not depend on any external image host.
 *   node scripts/generate-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const out = join(process.cwd(), "public", "images", "placeholders");
mkdirSync(join(out, "products"), { recursive: true });
mkdirSync(join(out, "banners"), { recursive: true });
mkdirSync(join(out, "tiles"), { recursive: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

function luminance(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Simple garment silhouettes drawn with paths (original, schematic). */
const SHAPES = {
  bra: `<path d="M120 300 C120 230 180 200 240 240 C300 200 360 230 360 300 L360 330 C330 380 270 400 240 380 C210 400 150 380 120 330 Z" /><path d="M180 240 L150 120 M300 240 L330 120" stroke-width="10" stroke-linecap="round" fill="none"/>`,
  panty: `<path d="M110 220 L370 220 L350 300 C300 330 270 400 240 440 C210 400 180 330 130 300 Z" />`,
  top: `<path d="M150 180 L200 150 C220 190 260 190 280 150 L330 180 L360 260 L320 275 L320 460 L160 460 L160 275 L120 260 Z" />`,
  pants: `<path d="M160 150 L320 150 L335 460 L265 460 L240 260 L215 460 L145 460 Z" />`,
  skirt: `<path d="M170 170 L310 170 L370 460 L110 460 Z" />`,
  pajama: `<path d="M150 150 L330 150 L350 290 L310 300 L310 460 L170 460 L170 300 L130 290 Z" /><path d="M240 150 L240 460" stroke-width="6" fill="none" stroke-dasharray="14 12"/>`,
  socks: `<path d="M190 120 L290 120 L290 300 C290 340 330 360 350 400 C370 440 330 470 290 455 L200 400 C170 380 190 330 190 300 Z" />`,
  swim: `<path d="M150 180 L330 180 L310 300 C280 340 260 400 240 440 C220 400 200 340 170 300 Z" /><path d="M150 180 L130 110 M330 180 L350 110" stroke-width="10" stroke-linecap="round" fill="none"/>`,
  kids: `<path d="M160 170 L205 140 C220 170 260 170 275 140 L320 170 L345 250 L310 262 L310 440 L170 440 L170 262 L135 250 Z" /><circle cx="240" cy="330" r="34" fill="none" stroke-width="8"/>`,
};

export function productSvg({ hex, label, shape, view }) {
  const dark = luminance(hex) < 0.55;
  const ink = dark ? "#ffffff" : "#1c1c1c";
  const bg2 = dark ? "#ffffff22" : "#00000012";
  const silhouette = SHAPES[shape] ?? SHAPES.top;
  const offset = view === "F" ? 0 : view === "FI" ? 30 : 0;
  const scale = view === "FI" ? 1.25 : 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 480 720">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hex}"/><stop offset="1" stop-color="${hex}" stop-opacity="0.75"/></linearGradient></defs>
  <rect width="480" height="720" fill="url(#g)"/>
  <rect x="24" y="24" width="432" height="672" rx="18" fill="${bg2}"/>
  <g transform="translate(${240 - 240 * scale + offset} ${360 - 300 * scale}) scale(${scale})" fill="${ink}" fill-opacity="0.9" stroke="${ink}">${silhouette}</g>
  <text x="240" y="640" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="${ink}">${esc(label)}</text>
  <text x="240" y="672" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="${ink}" fill-opacity="0.7">DEMO · ${esc(view)}</text>
</svg>`;
}

function bannerSvg({ w, h, from, to, title, subtitle, file }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>
    <radialGradient id="r" cx="70%" cy="30%" r="60%"><stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#r)"/>
  <circle cx="${w * 0.72}" cy="${h * 0.45}" r="${Math.min(w, h) * 0.28}" fill="#ffffff" fill-opacity="0.12"/>
  <circle cx="${w * 0.78}" cy="${h * 0.6}" r="${Math.min(w, h) * 0.16}" fill="#ffffff" fill-opacity="0.1"/>
  <text x="${w * 0.06}" y="${h * 0.12}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(h * 0.045)}" font-weight="700" fill="#ffffff" fill-opacity="0.9">${esc(title)}</text>
  <text x="${w * 0.06}" y="${h * 0.12 + h * 0.06}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(h * 0.03)}" fill="#ffffff" fill-opacity="0.75">${esc(subtitle)}</text>
</svg>`;
  writeFileSync(join(out, "banners", file), svg);
}

function tileSvg({ hex, shape, label, file }) {
  const ink = luminance(hex) < 0.55 ? "#ffffff" : "#1c1c1c";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 480 480">
  <rect width="480" height="480" rx="24" fill="${hex}"/>
  <g transform="translate(0 -70)" fill="${ink}" fill-opacity="0.9" stroke="${ink}">${SHAPES[shape] ?? SHAPES.top}</g>
  <text x="240" y="440" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="${ink}">${esc(label)}</text>
</svg>`;
  writeFileSync(join(out, "tiles", file), svg);
}

// ---- banners / editorial / popup ----
bannerSvg({ w: 1920, h: 1080, from: "#d8b7a0", to: "#8d5e4a", title: "Natural Lifting", subtitle: "Демо-баннер · замените в админке", file: "hero-1.svg" });
bannerSvg({ w: 1920, h: 1080, from: "#e5243f", to: "#6f0a1c", title: "Распродажа до -70%", subtitle: "Демо-баннер", file: "hero-sale.svg" });
bannerSvg({ w: 1080, h: 1440, from: "#d8b7a0", to: "#8d5e4a", title: "Natural Lifting", subtitle: "Демо (mobile)", file: "hero-1-mobile.svg" });
bannerSvg({ w: 1200, h: 1440, from: "#5c1d2a", to: "#2b0b12", title: "Влюбляясь в бордовый", subtitle: "Редакционный блок · демо", file: "editorial-burgundy.svg" });
bannerSvg({ w: 1920, h: 900, from: "#f2c9d3", to: "#b6657f", title: "Пижамы для неё", subtitle: "Баннер · демо", file: "banner-pajamas.svg" });
bannerSvg({ w: 900, h: 1200, from: "#3b3b3b", to: "#121212", title: "-10%", subtitle: "за регистрацию", file: "popup-newsletter.svg" });
bannerSvg({ w: 1920, h: 600, from: "#fbe9ee", to: "#e5a4bb", title: "Merea Club", subtitle: "Программа лояльности", file: "loyalty.svg" });

// ---- category tiles ----
const tiles = [
  ["allbras", "#f1e3d6", "bra", "Все"], ["balconette", "#e8cdb8", "bra", "Балконет"], ["pushup", "#d9b69a", "bra", "Пуш-ап"], ["triangle", "#cfa98f", "bra", "Треугольник"],
  ["bandeau", "#b78c73", "bra", "Бандо"], ["bralette", "#9c5d57", "bra", "Бралетт"], ["brazilian", "#e8c4c4", "panty", "Бразильяно"], ["slip", "#d4a5b5", "panty", "Слипы"],
  ["thong", "#c58aa0", "panty", "Стринги"], ["culotte", "#b9a7d6", "panty", "Кюлоты"], ["pajamas", "#f2d6dc", "pajama", "Пижамы"], ["clothing", "#d9d9d9", "top", "Одежда"],
  ["socks", "#c2c2c2", "socks", "Носки"], ["girls", "#f2b8cc", "kids", "Девочкам"], ["swim", "#a9c9ea", "swim", "Купальники"], ["sport", "#5b6b4a", "pants", "Спорт"],
];
tiles.forEach(([file, hex, shape, label]) => tileSvg({ hex, shape, label, file: `${file}.svg` }));

// ---- product images: one set per colour code × view, shape by product family ----
const COLORS = {
  "019": "#111111", "1905": "#d9b69a", "3106": "#f4f1ec", "304Y": "#5a3a2e", "680Z": "#5c1d2a", "581Z": "#9a9a9a", "525Z": "#e8c4c4", "578Z": "#b9a7d6", "031": "#efe7d8",
  "799Z": "#eee5d6", "4435": "#3e2a22", "677V": "#3b3b3b", "495Z": "#5b6b4a", "624T": "#c2c2c2", "678Z": "#7a1f2b", "668Z": "#1d2a4a", "800Z": "#c9a86a", "493Z": "#b7824f",
  "519Z": "#c48aa0", "494Z": "#e39bb0", "527Z": "#a7a7a7", "480Z": "#6b2231", "001": "#ffffff", "698Y": "#f2b8cc", "178Z": "#d6338a", "478Z": "#b7e0cf", "5482": "#c7a9df",
  "438Z": "#a9c9ea", "701Y": "#efd9c2", "449Z": "#e2a9b4", "831Y": "#f0d35e", "879Y": "#f08a7a", "452Z": "#ef8f3f", "837Y": "#6c86a8", "941V": "#9fb3cc", "422Y": "#3b5273",
  "299Z": "#4f8a5b", "503Y": "#f3c0a6", "350Z": "#d8c7a7", "1910": "#c69a79", "279Z": "#2b4a8a", "564Z": "#f2e3a3", "285Z": "#7c7a48", "573Z": "#a98f6b", "286Z": "#d4b25f",
};
const VIEWS = ["M", "F", "FI"];
let count = 0;
for (const shape of Object.keys(SHAPES)) {
  for (const [code, hex] of Object.entries(COLORS)) {
    for (const view of VIEWS) {
      writeFileSync(join(out, "products", `${shape}-${code}-${view}.svg`), productSvg({ hex, label: `${shape.toUpperCase()} · ${code}`, shape, view }));
      count++;
    }
  }
}
console.log(`Generated ${count} product placeholders, ${tiles.length} tiles and 7 banners in public/images/placeholders`);
