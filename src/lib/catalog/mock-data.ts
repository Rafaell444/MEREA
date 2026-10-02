/**
 * Mock catalog used until Shopify credentials are configured.
 * Product data mirrors the real Merea RU assortment (SKUs, names, prices) so the
 * design can be reviewed with realistic content. Images are served from the brand's
 * own media CDN (media.clz.ru) exactly like the live site does.
 */
import type { StockStatus } from "./types";

/** Garment silhouette family, derived from the model code prefix (used to pick a generated placeholder image). */
export function shapeFor(modelSku: string): string {
  const s = modelSku.toUpperCase();
  if (/^1Z/.test(s)) return "socks";
  if (/^1K/.test(s)) return "swim";
  if (/^(1TI|1RP|1RB|1RI|1FP|1RG|3RS|3TI)/.test(s)) return "bra";
  if (/^(1SN|1SB|3SC|3SN)/.test(s)) return "panty";
  if (/^(1GS|1GT|1PL|1GP|1PC)/.test(s)) return "pajama";
  if (/^(1WP|1WS|3WP|3WS)/.test(s)) return "pants";
  if (/^(1WG|3WG|3WA)/.test(s)) return "skirt";
  if (/^3/.test(s)) return "kids";
  return "top";
}

/** Local generated placeholder (see scripts/generate-placeholders.mjs). Replaced by Shopify CDN images once connected. */
export function mockImage(modelSku: string, colorCode: string, view: string) {
  const v = ["M", "F", "FI"].includes(view) ? view : "M";
  return `/images/placeholders/products/${shapeFor(modelSku)}-${colorCode}-${v}.svg`;
}

export type MockColor = { code: string; name: string; hex: string; views?: string[]; stock?: StockStatus[] };

export type MockModel = {
  sku: string; // base model code e.g. 1TI010V
  slug: string; // url slug (without sku/color)
  title: string;
  type: string; // product type (RU)
  price: number;
  compareAt?: number;
  colors: MockColor[];
  sizes: string[]; // size scale
  tags: string[]; // promo/material tags
  collections: string[];
  description: string;
  composition?: string;
  sizeGuideKey?: "bras" | "panties" | "clothing" | "girls" | "socks" | "swim";
  rating?: number;
  reviewCount?: number;
  views?: string[]; // image views available
  createdAt?: string;
};

export const COLOR_NAMES: Record<string, { name: string; hex: string }> = {
  "019": { name: "Черный - Nero", hex: "#111111" },
  "1905": { name: "Бежевый - Naturale Phard", hex: "#d9b69a" },
  "3106": { name: "Белый - Bianco", hex: "#f4f1ec" },
  "304Y": { name: "Коричневый - Marrone", hex: "#5a3a2e" },
  "680Z": { name: "Бордовый - Bordeaux", hex: "#5c1d2a" },
  "581Z": { name: "Серый меланж - Grigio", hex: "#9a9a9a" },
  "525Z": { name: "Пудровый - Rosa Cipria", hex: "#e8c4c4" },
  "578Z": { name: "Лавандовый - Lavanda", hex: "#b9a7d6" },
  "031": { name: "Айвори - Avorio", hex: "#efe7d8" },
  "799Z": { name: "Молочный - Latte", hex: "#eee5d6" },
  "4435": { name: "Шоколадный - Cioccolato", hex: "#3e2a22" },
  "677V": { name: "Антрацит - Antracite", hex: "#3b3b3b" },
  "495Z": { name: "Хаки - Verde Militare", hex: "#5b6b4a" },
  "624T": { name: "Серебристый - Argento", hex: "#c2c2c2" },
  "678Z": { name: "Вишневый - Ciliegia", hex: "#7a1f2b" },
  "668Z": { name: "Синий - Blu Notte", hex: "#1d2a4a" },
  "800Z": { name: "Золотистый - Oro", hex: "#c9a86a" },
  "493Z": { name: "Карамель - Caramello", hex: "#b7824f" },
  "519Z": { name: "Принт - Fantasia", hex: "#c48aa0" },
  "494Z": { name: "Сердечки - Cuori", hex: "#e39bb0" },
  "527Z": { name: "Серый с принтом - Grigio Stampa", hex: "#a7a7a7" },
  "480Z": { name: "Бургунди - Borgogna", hex: "#6b2231" },
  "001": { name: "Белый - Bianco", hex: "#ffffff" },
  "698Y": { name: "Розовый микс - Rosa Mix", hex: "#f2b8cc" },
  "178Z": { name: "Фуксия - Fucsia", hex: "#d6338a" },
  "478Z": { name: "Мятный - Menta", hex: "#b7e0cf" },
  "5482": { name: "Сиреневый - Lilla", hex: "#c7a9df" },
  "438Z": { name: "Голубой - Azzurro", hex: "#a9c9ea" },
  "701Y": { name: "Пастельный микс - Pastello", hex: "#efd9c2" },
  "449Z": { name: "Принт цветы - Fiori", hex: "#e2a9b4" },
  "831Y": { name: "Желтый - Giallo", hex: "#f0d35e" },
  "879Y": { name: "Коралловый - Corallo", hex: "#f08a7a" },
  "452Z": { name: "Оранжевый - Arancio", hex: "#ef8f3f" },
  "837Y": { name: "Деним - Denim", hex: "#6c86a8" },
  "941V": { name: "Светлый деним - Denim Chiaro", hex: "#9fb3cc" },
  "422Y": { name: "Темный деним - Denim Scuro", hex: "#3b5273" },
  "299Z": { name: "Зеленый - Verde", hex: "#4f8a5b" },
  "503Y": { name: "Персиковый - Pesca", hex: "#f3c0a6" },
  "350Z": { name: "Песочный - Sabbia", hex: "#d8c7a7" },
  "1910": { name: "Загар - Abbronzatura", hex: "#c69a79" },
  "279Z": { name: "Синий - Blu", hex: "#2b4a8a" },
  "564Z": { name: "Сливочно-желтый - Crema", hex: "#f2e3a3" },
  "285Z": { name: "Оливковый - Oliva", hex: "#7c7a48" },
  "573Z": { name: "Сафари - Safari", hex: "#a98f6b" },
  "286Z": { name: "Золотой - Oro", hex: "#d4b25f" },
};

const BRA_SIZES = ["70B", "75B", "75C", "75D", "80B", "80C", "80D", "85B", "85C", "85D", "90B", "90C"];
const BRA_SIZES_SHORT = ["70B", "75B", "75C", "80B", "80C", "85B", "85C", "90B"];
const XS_XL = ["XS", "S", "M", "L", "XL"];
const S_L = ["S", "M", "L"];
const S_XL = ["S", "M", "L", "XL"];
const KIDS = ["2-3 (92-98 cm)", "4-5 (104-110 cm)", "6-7 (116-122 cm)", "8-9 (128-134 cm)", "10-11 (140-146 cm)", "12-13 (152-158 cm)"];
const ONE = ["Один размер"];
const SWIM_TOP = ["70", "75", "80", "85", "90"];

const c = (code: string, views?: string[]): MockColor => ({ code, ...COLOR_NAMES[code], views });

const DESC_BRA =
  "Бесшовный бюстгальтер с V-образным вырезом выполнен из ультрамягкой гладкой микрофибры с матовым эффектом. Чашки без косточек дополнены слегка уплотненными съемными вкладышами. Изделие гарантирует максимальный комфорт и придает груди естественную форму. Благодаря минималистичному дизайну модель незаметна даже под самой облегающей одеждой. Длина бретелей регулируется. Застежка на два крючка обеспечивает четыре варианта ширины пояса.";
const DESC_PANTY =
  "Трусики из переработанной микрофибры с необработанными краями: гладкие, невидимые под одеждой и очень комфортные. Эластичная ткань мягко облегает тело и не оставляет следов. Ластовица из хлопка.";
const DESC_TOP =
  "Ультралегкий трикотаж из смесовой мериносовой шерсти: теплый, дышащий и приятный к телу. Прилегающий крой подходит для многослойных образов и носится как самостоятельная вещь.";
const DESC_PJ = "Мягкая пижама из натуральных материалов для спокойного сна. Свободный крой, эластичный пояс и аккуратные детали.";
const DESC_KIDS = "Базовая модель из мягкого хлопка для девочек. Гипоаллергенные материалы, плоские швы и комфортная посадка на каждый день.";

export const MODELS: MockModel[] = [
  // ---------------- БЮСТГАЛЬТЕРЫ ----------------
  {
    sku: "1TI010V", slug: "byustgalter-treugolnik-s-neobrabotannymi-krayami-natural-lifting",
    title: "Бюстгальтер-Треугольник с Необработанными Краями Natural Lifting", type: "Бюстгальтер-треугольник",
    price: 2699, colors: [c("1905", ["M", "FI", "DT1W", "BI", "F"]), c("019"), c("3106", ["M1", "F", "FI"]), c("304Y"), c("680Z")], sizes: BRA_SIZES_SHORT,
    tags: ["3=4", "natural-lifting", "bestseller"], collections: ["women-bras", "women-bras-triangle", "women-lingerie", "women-all", "natural-lifting-bra", "home-burgundy"],
    description: DESC_BRA, composition: "Микрофибра 76% полиамид, 24% эластан", sizeGuideKey: "bras", rating: 5, reviewCount: 2,
  },
  {
    sku: "1TI070P", slug: "byustgalter-treugolnik-havana-iz-pererabotannogo-kruzheva",
    title: "Бюстгальтер-Треугольник Havana из Переработанного Кружева", type: "Бюстгальтер-треугольник",
    price: 2199, colors: [c("3106"), c("019"), c("1905"), c("680Z"), c("525Z"), c("578Z")], sizes: BRA_SIZES_SHORT,
    tags: ["3=4", "new", "recycled-lace"], collections: ["women-bras", "women-bras-triangle", "women-lingerie", "women-all", "women-new", "home-burgundy"],
    description: "Бюстгальтер-треугольник из переработанного кружева с цветочным узором. Мягкие чашки без косточек, регулируемые бретели.", composition: "Кружево 85% переработанный полиамид, 15% эластан", sizeGuideKey: "bras", rating: 4.8, reviewCount: 14,
  },
  {
    sku: "1FP01A", slug: "uplotnennyy-byustgalter-bando-new-york-iz-pererabotannoy-mikrofibry",
    title: "Уплотненный Бюстгальтер Бандо New York из Переработанной Микрофибры", type: "Бюстгальтер-бандо",
    price: 2199, colors: [c("1905"), c("019"), c("3106")], sizes: BRA_SIZES_SHORT,
    tags: ["3=4", "recycled-microfiber"], collections: ["women-bras", "women-bras-bandeau", "women-lingerie", "women-all"],
    description: DESC_BRA, composition: "Микрофибра 80% переработанный полиамид, 20% эластан", sizeGuideKey: "bras", rating: 4.6, reviewCount: 7,
  },
  {
    sku: "1RP010F", slug: "polnostyu-zakrytyy-byustgalter-balkonet-prague-iz-pererabotannoy-mikrofibry",
    title: "Полностью Закрытый Бюстгальтер Балконет Prague из Переработанной Микрофибры", type: "Бюстгальтер-балконет",
    price: 2199, colors: [c("1905"), c("019"), c("3106")], sizes: BRA_SIZES,
    tags: ["3=4", "recycled-microfiber"], collections: ["women-bras", "women-bras-balconette", "women-lingerie", "women-all"],
    description: DESC_BRA, composition: "Микрофибра 80% переработанный полиамид, 20% эластан", sizeGuideKey: "bras", rating: 4.7, reviewCount: 21,
  },
  {
    sku: "1RI010", slug: "byustgalter-balkonet-wien-iz-pererabotannoy-mikrofibry",
    title: "Бюстгальтер Балконет Wien из Переработанной Микрофибры", type: "Бюстгальтер-балконет",
    price: 2199, colors: [c("1905"), c("019")], sizes: BRA_SIZES,
    tags: ["3=4", "recycled-microfiber"], collections: ["women-bras", "women-bras-balconette", "women-lingerie", "women-all"],
    description: DESC_BRA, composition: "Микрофибра 80% переработанный полиамид, 20% эластан", sizeGuideKey: "bras", rating: 4.5, reviewCount: 9,
  },
  {
    sku: "1FP01F", slug: "polnostyu-zakrytyy-byustgalter-bando-iz-pererabotannoy-mikrofibry-s-legkim-uplotneniem",
    title: "Полностью Закрытый Бюстгальтер-Бандо из Переработанной Микрофибры с Легким Уплотнением", type: "Бюстгальтер-бандо",
    price: 999, compareAt: 2699, colors: [c("1905"), c("019"), c("3106")], sizes: BRA_SIZES,
    tags: ["sale", "recycled-microfiber"], collections: ["women-bras", "women-bras-bandeau", "women-lingerie", "women-all", "women-sale", "sale-all"],
    description: DESC_BRA, composition: "Микрофибра 80% переработанный полиамид, 20% эластан", sizeGuideKey: "bras", rating: 4.4, reviewCount: 5,
  },
  {
    sku: "1RB070", slug: "byustgalter-balkonet-paris-iz-pererabotannogo-kruzheva-bez-uplotneniya",
    title: "Бюстгальтер Балконет Paris из Переработанного Кружева Без Уплотнения", type: "Бюстгальтер-балконет",
    price: 2199, colors: [c("680Z"), c("3106"), c("019"), c("1905")], sizes: BRA_SIZES,
    tags: ["3=4", "new", "recycled-lace"], collections: ["women-bras", "women-bras-balconette", "women-lingerie", "women-all", "women-new", "home-burgundy"],
    description: "Балконет из переработанного кружева без уплотнения: легкая поддержка, косточки, регулируемые бретели.", composition: "Кружево 85% переработанный полиамид, 15% эластан", sizeGuideKey: "bras", rating: 4.9, reviewCount: 11,
  },
  {
    sku: "1RP010A", slug: "byustgalter-push-ap-athens-iz-pererabotannoy-mikrofibry",
    title: "Бюстгальтер Пуш-ап Athens из Переработанной Микрофибры", type: "Бюстгальтер пуш-ап",
    price: 1899, colors: [c("1905"), c("019")], sizes: BRA_SIZES_SHORT,
    tags: ["3=4", "recycled-microfiber", "bestseller"], collections: ["women-bras", "women-bras-pushup", "women-lingerie", "women-all"],
    description: DESC_BRA, composition: "Микрофибра 80% переработанный полиамид, 20% эластан", sizeGuideKey: "bras", rating: 4.8, reviewCount: 33,
  },
  {
    sku: "1RB2077A", slug: "byustgalter-balkonet-paris-air-lifting-iz-tyulya",
    title: "Бюстгальтер Балконет Paris Air Lifting из Тюля", type: "Бюстгальтер-балконет",
    price: 2199, colors: [c("304Y"), c("1905"), c("019")], sizes: BRA_SIZES,
    tags: ["3=4"], collections: ["women-bras", "women-bras-balconette", "women-lingerie", "women-all"],
    description: "Балконет из прозрачного тюля с технологией Air Lifting: невесомая поддержка и приподнятый эффект.", composition: "Тюль 88% полиамид, 12% эластан", sizeGuideKey: "bras", rating: 4.3, reviewCount: 4,
  },
  {
    sku: "1RB010V", slug: "byustgalter-balkonet-natural-lifting-s-kollagenom-i-lazernoy-obrabotkoy-kraya",
    title: "Бюстгальтер Балконет Natural Lifting с Коллагеном и Лазерной Обработкой Края", type: "Бюстгальтер-балконет",
    price: 2699, colors: [c("1905"), c("019")], sizes: BRA_SIZES_SHORT,
    tags: ["3=4", "natural-lifting"], collections: ["women-bras", "women-bras-balconette", "women-lingerie", "women-all", "natural-lifting-bra"],
    description: DESC_BRA, composition: "Микрофибра с коллагеном 78% полиамид, 22% эластан", sizeGuideKey: "bras", rating: 4.7, reviewCount: 6,
  },
  {
    sku: "1TI050A", slug: "byustgalter-treugolnik-london-s-legkim-uplotneniem-iz-organicheskogo-khlopka",
    title: "Бюстгальтер Треугольник London с Легким Уплотнением из Органического Хлопка", type: "Бюстгальтер-треугольник",
    price: 2199, colors: [c("304Y"), c("019"), c("3106")], sizes: ["70B", "75B", "75C", "80B", "80C", "85B"],
    tags: ["3=4", "organic-cotton"], collections: ["women-bras", "women-bras-triangle", "women-lingerie", "women-all"],
    description: "Треугольный бюстгальтер из органического хлопка с легким уплотнением. Мягкий, дышащий, для каждого дня.", composition: "Хлопок 95% органический, 5% эластан", sizeGuideKey: "bras", rating: 4.6, reviewCount: 8,
  },
  {
    sku: "1RG010V", slug: "byustgalter-push-ap-natural-lifting-plus-s-lazernoy-obrabotkoy-kraya",
    title: "Бюстгальтер Пуш-ап Natural Lifting Plus с Лазерной Обработкой Края", type: "Бюстгальтер пуш-ап",
    price: 2699, colors: [c("680Z"), c("3106"), c("1905"), c("019")], sizes: ["70B", "75B", "75C", "80B", "80C", "85B"],
    tags: ["3=4", "new", "natural-lifting", "anna-pokrov"], collections: ["women-bras", "women-bras-pushup", "women-lingerie", "women-all", "women-new", "natural-lifting-bra"],
    description: DESC_BRA, composition: "Микрофибра 76% полиамид, 24% эластан", sizeGuideKey: "bras", rating: 5, reviewCount: 3,
  },
  {
    sku: "1RP2279", slug: "byustgalter-push-ap-athens-essential-details",
    title: "Бюстгальтер Пуш-ап Athens Essential Details", type: "Бюстгальтер пуш-ап",
    price: 2699, colors: [c("019"), c("1905")], sizes: ["70B", "75B", "75C", "80B", "80C", "85B"],
    tags: ["3=4", "new"], collections: ["women-bras", "women-bras-pushup", "women-lingerie", "women-all", "women-new"],
    description: "Пуш-ап с минималистичными деталями: тонкие бретели, гладкие чашки, аккуратная застежка.", composition: "Микрофибра 80% полиамид, 20% эластан", sizeGuideKey: "bras", rating: 4.5, reviewCount: 2,
  },
  // ---------------- ТРУСИКИ ----------------
  {
    sku: "1SN05C", slug: "zhenskie-slipy-iz-organicheskogo-khlopka", title: "Женские Слипы из Органического Хлопка", type: "Слипы",
    price: 799, colors: [c("1905"), c("019"), c("031"), c("581Z"), c("525Z"), c("304Y"), c("578Z")], sizes: XS_XL,
    tags: ["3=4", "organic-cotton", "bestseller"], collections: ["women-panties", "women-panties-slips", "women-lingerie", "women-all"],
    description: DESC_PANTY, composition: "Хлопок 95% органический, 5% эластан", sizeGuideKey: "panties", rating: 4.8, reviewCount: 52,
  },
  {
    sku: "1SN01V", slug: "slipy-s-neobrabotannymi-krayami-iz-pererabotannoy-mikrofibry", title: "Слипы с Необработанными Краями из Переработанной Микрофибры", type: "Слипы",
    price: 799, colors: [c("1905"), c("019"), c("304Y"), c("680Z")], sizes: S_XL,
    tags: ["3=4", "recycled-microfiber"], collections: ["women-panties", "women-panties-slips", "women-lingerie", "women-all", "women-invisible"],
    description: DESC_PANTY, composition: "Микрофибра 80% переработанный полиамид, 20% эластан", sizeGuideKey: "panties", rating: 4.7, reviewCount: 19,
  },
  {
    sku: "1SB01SV", slug: "brazilyano-iz-pererabotannoy-mikrofibry-s-vysokim-vyrezom-bedra-i-neobrabotannymi-krayami", title: "Бразильяно из Переработанной Микрофибры с Высоким Вырезом Бедра и Необработанными Краями", type: "Бразильяно",
    price: 799, colors: [c("1905"), c("019")], sizes: XS_XL,
    tags: ["3=4", "recycled-microfiber"], collections: ["women-panties", "women-panties-brazilian", "women-lingerie", "women-all", "women-invisible"],
    description: DESC_PANTY, composition: "Микрофибра 80% переработанный полиамид, 20% эластан", sizeGuideKey: "panties", rating: 4.6, reviewCount: 12,
  },
  {
    sku: "1SB070", slug: "brazilyano-iz-pererabotannogo-kruzheva", title: "Бразильяно из Переработанного Кружева", type: "Бразильяно",
    price: 799, colors: [c("019"), c("680Z"), c("3106"), c("1905")], sizes: XS_XL,
    tags: ["3=4", "new", "recycled-lace"], collections: ["women-panties", "women-panties-brazilian", "women-lingerie", "women-all", "women-new", "home-burgundy"],
    description: "Бразильяно из переработанного кружева с эластичной каймой. Мягкий хлопковый ластовица.", composition: "Кружево 85% переработанный полиамид, 15% эластан", sizeGuideKey: "panties", rating: 4.9, reviewCount: 17,
  },
  {
    sku: "1SB01V", slug: "brazilyano-iz-pererabotannoy-mikrofibry-s-neobrabotannymi-krayami", title: "Бразильяно из Переработанной Микрофибры с Необработанными Краями", type: "Бразильяно",
    price: 799, colors: [c("1905"), c("019"), c("304Y")], sizes: XS_XL,
    tags: ["3=4", "recycled-microfiber"], collections: ["women-panties", "women-panties-brazilian", "women-lingerie", "women-all", "women-invisible"],
    description: DESC_PANTY, composition: "Микрофибра 80% переработанный полиамид, 20% эластан", sizeGuideKey: "panties", rating: 4.7, reviewCount: 25,
  },
  {
    sku: "1SN05V", slug: "besshovnye-slipy-iz-organicheskogo-khlopka", title: "Бесшовные Слипы из Органического Хлопка", type: "Слипы",
    price: 799, colors: [c("1905"), c("019")], sizes: S_XL,
    tags: ["3=4", "organic-cotton"], collections: ["women-panties", "women-panties-slips", "women-lingerie", "women-all"],
    description: DESC_PANTY, composition: "Хлопок 95% органический, 5% эластан", sizeGuideKey: "panties", rating: 4.5, reviewCount: 8,
  },
  {
    sku: "1SN2222", slug: "slipy-iz-mikrofibry-s-lazernoy-obrabotkoy-kraya-i-kruzheva", title: "Слипы из Микрофибры с Лазерной Обработкой Края и Кружева", type: "Слипы",
    price: 899, colors: [c("019"), c("1905")], sizes: S_L,
    tags: ["3=4", "new"], collections: ["women-panties", "women-panties-slips", "women-lingerie", "women-all", "women-new"],
    description: DESC_PANTY, composition: "Микрофибра 78% полиамид, 22% эластан; кружево", sizeGuideKey: "panties", rating: 4.4, reviewCount: 3,
  },
  {
    sku: "1SB01C", slug: "brazilyano-iz-pererabotannoy-mikrofibry", title: "Бразильяно из Переработанной Микрофибры", type: "Бразильяно",
    price: 799, colors: [c("1905"), c("019"), c("581Z")], sizes: XS_XL,
    tags: ["3=4", "new", "recycled-microfiber"], collections: ["women-panties", "women-panties-brazilian", "women-lingerie", "women-all", "women-new"],
    description: DESC_PANTY, composition: "Микрофибра 80% переработанный полиамид, 20% эластан", sizeGuideKey: "panties", rating: 4.6, reviewCount: 10,
  },
  {
    sku: "1SB5070", slug: "brazilyano-iz-khlopka-i-pererabotannogo-kruzheva", title: "Бразильяно из Хлопка и Переработанного Кружева", type: "Бразильяно",
    price: 799, colors: [c("3106"), c("019")], sizes: XS_XL,
    tags: ["3=4"], collections: ["women-panties", "women-panties-brazilian", "women-lingerie", "women-all"],
    description: DESC_PANTY, composition: "Хлопок 95%, эластан 5%; кружево", sizeGuideKey: "panties", rating: 4.5, reviewCount: 6,
  },
  // ---------------- ОДЕЖДА ----------------
  {
    sku: "1ML16B", slug: "ultralegkaya-vodolazka-iz-smesovoy-merinosovoy-shersti", title: "Ультралегкая Водолазка из Смесовой Мериносовой Шерсти", type: "Водолазка",
    price: 2199, colors: [c("799Z"), c("019"), c("581Z")], sizes: XS_XL,
    tags: ["3=4", "new", "merino"], collections: ["women-clothing", "women-clothing-tops", "women-all", "women-new", "women-thermal"],
    description: DESC_TOP, composition: "Шерсть мериноса 50%, вискоза 45%, эластан 5%", sizeGuideKey: "clothing", rating: 4.8, reviewCount: 9,
  },
  {
    sku: "1ML16D", slug: "ultralegkiy-longsliv-iz-smesovoy-merinosovoy-shersti-s-v-obraznym-vyrezom-i-kruzhevnoy-kaymoy", title: "Ультралегкий Лонгслив из Смесовой Мериносовой Шерсти с V-образным Вырезом и Кружевной Каймой", type: "Лонгслив",
    price: 2199, colors: [c("678Z"), c("799Z"), c("304Y"), c("019")], sizes: ["XS", "S", "M", "L"],
    tags: ["3=4", "new", "merino"], collections: ["women-clothing", "women-clothing-tops", "women-all", "women-new", "home-build-look"],
    description: DESC_TOP, composition: "Шерсть мериноса 50%, вискоза 45%, эластан 5%", sizeGuideKey: "clothing", rating: 4.7, reviewCount: 4,
  },
  {
    sku: "1ML16E", slug: "ultralegkiy-longsliv-iz-smesovoy-merinosovoy-shersti-s-vyrezom-bato", title: "Ультралегкий Лонгслив из Смесовой Мериносовой Шерсти с Вырезом Бато", type: "Лонгслив",
    price: 2199, colors: [c("4435"), c("019"), c("799Z"), c("678Z"), c("624T"), c("668Z")], sizes: XS_XL,
    tags: ["3=4", "new", "merino"], collections: ["women-clothing", "women-clothing-tops", "women-all", "women-new"],
    description: DESC_TOP, composition: "Шерсть мериноса 50%, вискоза 45%, эластан 5%", sizeGuideKey: "clothing", rating: 4.6, reviewCount: 13,
  },
  {
    sku: "1WP1569", slug: "leginsy-invisible-therm", title: "Легинсы Invisible Therm", type: "Легинсы",
    price: 2199, colors: [c("581Z"), c("495Z"), c("677V"), c("019")], sizes: S_L,
    tags: ["3=4", "therm"], collections: ["women-clothing", "women-clothing-pants", "women-all", "women-thermal", "home-build-look"],
    description: "Легинсы Invisible Therm с начесом внутри: тепло без объема. Высокая посадка, незаметные под одеждой.", composition: "Полиамид 88%, эластан 12%", sizeGuideKey: "clothing", rating: 4.9, reviewCount: 41,
  },
  {
    sku: "1WS2487", slug: "modeliruyuschie-velosipedki-s-neobrabotannymi-krayami", title: "Моделирующие Велосипедки с Необработанными Краями", type: "Велосипедки",
    price: 1899, colors: [c("1905"), c("019")], sizes: S_XL,
    tags: ["3=4"], collections: ["women-clothing", "women-clothing-pants", "women-all", "women-shaping"],
    description: "Моделирующие велосипедки с необработанными краями: утягивающий эффект, невидимы под платьем.", composition: "Полиамид 80%, эластан 20%", sizeGuideKey: "clothing", rating: 4.5, reviewCount: 7,
  },
  {
    sku: "1ML1569A", slug: "vodolazka-invisible-therm-s-nevysokim-vorotnikom-stoykoy", title: "Водолазка Invisible Therm с Невысоким Воротником-Стойкой", type: "Водолазка",
    price: 2199, colors: [c("677V"), c("019"), c("581Z")], sizes: S_L,
    tags: ["3=4", "therm"], collections: ["women-clothing", "women-clothing-tops", "women-all", "women-thermal"],
    description: "Тонкая термоводолазка с невысокой стойкой — согревает и остается невидимой под рубашкой или свитером.", composition: "Полиамид 88%, эластан 12%", sizeGuideKey: "clothing", rating: 4.7, reviewCount: 15,
  },
  {
    sku: "1ML1569", slug: "longsliv-invisible-therm-s-vyrezom-bato", title: "Лонгслив Invisible Therm с Вырезом Бато", type: "Лонгслив",
    price: 2199, colors: [c("581Z"), c("019"), c("1905")], sizes: S_L,
    tags: ["3=4", "therm"], collections: ["women-clothing", "women-clothing-tops", "women-all", "women-thermal", "home-build-look"],
    description: "Лонгслив Invisible Therm с вырезом бато: мягкий начес внутри, гладкая поверхность снаружи.", composition: "Полиамид 88%, эластан 12%", sizeGuideKey: "clothing", rating: 4.8, reviewCount: 22,
  },
  {
    sku: "1ML15C", slug: "longsliv-s-kruglym-vyrezom-iz-elastichnogo-organicheskogo-khlopka", title: "Лонгслив с Круглым Вырезом из Эластичного Органического Хлопка", type: "Лонгслив",
    price: 1299, colors: [c("019"), c("3106"), c("581Z")], sizes: XS_XL,
    tags: ["3=4", "organic-cotton"], collections: ["women-clothing", "women-clothing-tops", "women-all"],
    description: "Базовый лонгслив из эластичного органического хлопка. Прилегающий крой, круглый вырез.", composition: "Хлопок 95% органический, 5% эластан", sizeGuideKey: "clothing", rating: 4.6, reviewCount: 30,
  },
  {
    sku: "1ML1232", slug: "dzhemper-iz-viskozy-s-dlinnymi-rukavami-i-vyrezom-lodochka", title: "Джемпер из Вискозы с Длинными Рукавами и Вырезом «Лодочка»", type: "Джемпер",
    price: 1899, colors: [c("677V"), c("019"), c("799Z")], sizes: S_L,
    tags: ["3=4"], collections: ["women-clothing", "women-clothing-knit", "women-all"],
    description: "Тонкий джемпер из вискозы с вырезом «лодочка». Мягко драпируется, подходит для офиса и выходных.", composition: "Вискоза 80%, полиамид 17%, эластан 3%", sizeGuideKey: "clothing", rating: 4.4, reviewCount: 5,
  },
  {
    sku: "1BO16C", slug: "bodi-iz-viskozy-i-merinosovoy-shersti-s-kruglym-vyrezom", title: "Боди из Вискозы и Мериносовой Шерсти с Круглым Вырезом", type: "Боди",
    price: 2199, colors: [c("799Z"), c("019")], sizes: ["XS", "S", "M", "L"],
    tags: ["3=4", "new", "merino"], collections: ["women-clothing", "women-clothing-tops", "women-all", "women-new"],
    description: "Боди из смесовой мериносовой шерсти с круглым вырезом и застежкой на кнопки.", composition: "Вискоза 50%, шерсть мериноса 45%, эластан 5%", sizeGuideKey: "clothing", rating: 4.7, reviewCount: 2,
  },
  {
    sku: "1ML16L", slug: "longsliv-s-vyrezom-bato-iz-merinosovoy-shersti-lame-i-viskozy", title: "Лонгслив с Вырезом Бато из Мериносовой Шерсти Ламе и Вискозы", type: "Лонгслив",
    price: 2199, colors: [c("800Z"), c("019")], sizes: XS_XL,
    tags: ["3=4", "new", "merino"], collections: ["women-clothing", "women-clothing-tops", "women-all", "women-new", "home-build-look"],
    description: "Лонгслив с мерцающей нитью ламе — для вечерних и праздничных образов.", composition: "Вискоза 48%, шерсть 42%, металлизированная нить 10%", sizeGuideKey: "clothing", rating: 4.9, reviewCount: 1,
  },
  {
    sku: "1WL1428D", slug: "svitshot-s-kruglym-vyrezom-i-lampasami-v-rubchik-superior-softness", title: "Свитшот с Круглым Вырезом и Лампасами в Рубчик Superior Softness", type: "Свитшот",
    price: 2799, colors: [c("495Z"), c("019"), c("581Z")], sizes: S_L,
    tags: ["3=4", "new", "superior-softness"], collections: ["women-clothing", "women-clothing-sweats", "women-all", "women-new", "superior-softness", "women-sport"],
    description: "Свитшот Superior Softness из ультрамягкого футера в рубчик с контрастными лампасами.", composition: "Хлопок 70%, полиэстер 27%, эластан 3%", sizeGuideKey: "clothing", rating: 4.8, reviewCount: 6,
  },
  {
    sku: "1WP980B", slug: "termoleginsy-c-effektom-kozhi", title: "Термолегинсы c Эффектом Кожи", type: "Легинсы",
    price: 2199, colors: [c("019")], sizes: XS_XL,
    tags: ["3=4", "therm"], collections: ["women-clothing", "women-clothing-pants", "women-all", "women-thermal"],
    description: "Термолегинсы с эффектом кожи и мягким начесом внутри. Высокая посадка, глянцевая поверхность.", composition: "Полиэстер 60%, полиуретан 30%, эластан 10%", sizeGuideKey: "clothing", rating: 4.6, reviewCount: 18,
  },
  {
    sku: "1MC16C", slug: "ultralegkaya-mayka-iz-merinosovy-shersti-i-kruzheva", title: "Ультралегкая Майка из Мериносовой Шерсти и Кружева", type: "Майка",
    price: 1499, colors: [c("4435"), c("019"), c("799Z")], sizes: ["XS", "S", "M", "L"],
    tags: ["3=4", "new", "merino"], collections: ["women-clothing", "women-clothing-tops", "women-all", "women-new"],
    description: DESC_TOP, composition: "Шерсть мериноса 50%, вискоза 45%, эластан 5%; кружево", sizeGuideKey: "clothing", rating: 4.5, reviewCount: 2,
  },
  {
    sku: "1WP1676", slug: "bryuki-palatstso-iz-tkani-suede-touch", title: "Брюки Палаццо из Ткани Suede Touch", type: "Брюки",
    price: 3699, colors: [c("493Z"), c("019"), c("678Z")], sizes: ["XS", "S", "M", "L"],
    tags: ["3=4", "new"], collections: ["women-clothing", "women-clothing-pants", "women-all", "women-new", "home-build-look"],
    description: "Широкие брюки палаццо из ткани с эффектом замши Suede Touch. Высокая посадка, струящийся силуэт.", composition: "Полиэстер 92%, эластан 8%", sizeGuideKey: "clothing", rating: 4.7, reviewCount: 3,
  },
  {
    sku: "1MT1177", slug: "mayka-iz-regulyarnogo-trikotazha-lame", title: "Майка из Регулярного Трикотажа Ламе", type: "Майка",
    price: 2199, colors: [c("624T"), c("800Z"), c("019")], sizes: S_L,
    tags: ["3=4"], collections: ["women-clothing", "women-clothing-tops", "women-all", "home-build-look"],
    description: "Майка из мерцающего трикотажа ламе — лаконичный вечерний акцент.", composition: "Вискоза 60%, металлизированная нить 30%, эластан 10%", sizeGuideKey: "clothing", rating: 4.6, reviewCount: 4,
  },
  {
    sku: "1WG1199", slug: "dlinnaya-raskleshennaya-yubka-iz-atlasa", title: "Длинная Расклешенная Юбка из Атласа", type: "Юбка",
    price: 3199, colors: [c("495Z"), c("019"), c("680Z")], sizes: S_L,
    tags: ["3=4", "new"], collections: ["women-clothing", "women-clothing-skirts", "women-all", "women-new", "home-build-look"],
    description: "Длинная атласная юбка с расклешенным низом и эластичным поясом.", composition: "Полиэстер 100%", sizeGuideKey: "clothing", rating: 4.8, reviewCount: 2,
  },
  // ---------------- ПИЖАМЫ ----------------
  {
    sku: "1GS460AT", slug: "korotkie-shorty-iz-atlasa-s-printom-i-kruzheva", title: "Короткие Шорты из Атласа с Принтом и Кружева", type: "Шорты для сна",
    price: 1299, colors: [c("519Z"), c("019")], sizes: ["XS", "S", "M", "L"],
    tags: ["3=4", "new"], collections: ["women-pajamas", "women-pajamas-short", "women-all", "women-new", "home-pajamas"],
    description: DESC_PJ, composition: "Полиэстер 100%; кружево", sizeGuideKey: "clothing", rating: 4.7, reviewCount: 5,
  },
  {
    sku: "1GS460A", slug: "korotkie-shorty-iz-atlasa-i-kruzheva", title: "Короткие Шорты из Атласа и Кружева", type: "Шорты для сна",
    price: 1299, colors: [c("3106"), c("525Z"), c("495Z"), c("019"), c("680Z")], sizes: XS_XL,
    tags: ["3=4", "new"], collections: ["women-pajamas", "women-pajamas-short", "women-all", "women-new", "home-pajamas"],
    description: DESC_PJ, composition: "Полиэстер 100%; кружево", sizeGuideKey: "clothing", rating: 4.8, reviewCount: 12,
  },
  {
    sku: "1GT460A", slug: "mayka-na-tonkikh-bretelyakh-iz-atlasa-i-kruzheva", title: "Майка на Тонких Бретелях из Атласа и Кружева", type: "Майка для сна",
    price: 1899, colors: [c("525Z"), c("019"), c("3106"), c("680Z")], sizes: XS_XL,
    tags: ["3=4", "new"], collections: ["women-pajamas", "women-pajamas-short", "women-all", "women-new", "home-pajamas"],
    description: DESC_PJ, composition: "Полиэстер 100%; кружево", sizeGuideKey: "clothing", rating: 4.7, reviewCount: 9,
  },
  {
    sku: "1PL1105", slug: "dlinnaya-khlopkovaya-pizhama-s-printom-serdechki", title: "Длинная Хлопковая Пижама с Принтом «Сердечки»", type: "Пижама",
    price: 2799, colors: [c("494Z")], sizes: S_L,
    tags: ["3=4", "new"], collections: ["women-pajamas", "women-pajamas-long", "women-all", "women-new", "home-pajamas"],
    description: DESC_PJ, composition: "Хлопок 100%", sizeGuideKey: "clothing", rating: 4.9, reviewCount: 7,
  },
  {
    sku: "1GP1185", slug: "dzhoggery-iz-plotnogo-khlopka-s-printom", title: "Джоггеры из Плотного Хлопка с Принтом", type: "Джоггеры",
    price: 2199, colors: [c("527Z"), c("019"), c("581Z")], sizes: S_L,
    tags: ["3=4", "new"], collections: ["women-pajamas", "women-pajamas-long", "women-all", "women-new", "home-pajamas"],
    description: DESC_PJ, composition: "Хлопок 100%", sizeGuideKey: "clothing", rating: 4.6, reviewCount: 4,
  },
  {
    sku: "1MT779", slug: "mayka-s-tonkimi-bretelyami-i-v-obraznym-vyrezom-iz-viskozy-i-kruzheva", title: "Майка с Тонкими Бретелями и V-образным Вырезом из Вискозы и Кружева", type: "Майка для сна",
    price: 1699, colors: [c("019"), c("3106"), c("680Z")], sizes: S_XL,
    tags: ["3=4"], collections: ["women-pajamas", "women-pajamas-nightwear", "women-all", "home-pajamas"],
    description: DESC_PJ, composition: "Вискоза 95%, эластан 5%; кружево", sizeGuideKey: "clothing", rating: 4.5, reviewCount: 11,
  },
  {
    sku: "1PC1654", slug: "korotkaya-pizhama-iz-viskozy-i-kruzheva-s-v-obraznym-vyrezom", title: "Короткая Пижама из Вискозы и Кружева с V-образным Вырезом", type: "Пижама",
    price: 2799, colors: [c("480Z")], sizes: S_XL,
    tags: ["3=4", "new"], collections: ["women-pajamas", "women-pajamas-short", "women-all", "women-new", "home-pajamas", "home-burgundy"],
    description: DESC_PJ, composition: "Вискоза 100%; кружево", sizeGuideKey: "clothing", rating: 4.8, reviewCount: 3,
  },
  // ---------------- НОСКИ И КОЛГОТКИ ----------------
  {
    sku: "1ZG21B", slug: "prozrachnye-golfy-appearance-20den", title: "Прозрачные Гольфы Appearance 20 Ден", type: "Гольфы",
    price: 299, colors: [c("019")], sizes: ONE, tags: ["3=4"], collections: ["women-socks", "women-all"],
    description: "Прозрачные гольфы 20 ден с комфортной резинкой.", composition: "Полиамид 88%, эластан 12%", sizeGuideKey: "socks", rating: 4.5, reviewCount: 20,
  },
  {
    sku: "1ZC090", slug: "plotnye-kolgotki-s-kashemirom", title: "Плотные Колготки с Кашемиром", type: "Колготки",
    price: 1299, colors: [c("019"), c("581Z")], sizes: S_L, tags: ["3=4"], collections: ["women-socks", "women-all", "women-thermal"],
    description: "Плотные теплые колготки с добавлением кашемира.", composition: "Полиамид 60%, кашемир 20%, шерсть 15%, эластан 5%", sizeGuideKey: "socks", rating: 4.7, reviewCount: 9,
  },
  {
    sku: "1ZC16B", slug: "prozrachnye-kolgotki-appearance-20den", title: "Прозрачные Колготки Appearance 20 Ден", type: "Колготки",
    price: 499, colors: [c("019"), c("1910")], sizes: S_XL, tags: ["3=4"], collections: ["women-socks", "women-all"],
    description: "Прозрачные колготки 20 ден с эффектом ухоженной кожи.", composition: "Полиамид 88%, эластан 12%", sizeGuideKey: "socks", rating: 4.6, reviewCount: 34,
  },
  {
    sku: "1ZL174", slug: "zhenskie-khlopkovye-noski-3-4-v-rubchik", title: "Женские Хлопковые Носки 3/4 в Рубчик", type: "Носки",
    price: 499, colors: [c("019"), c("3106"), c("581Z")], sizes: ONE, tags: ["3=4", "new"], collections: ["women-socks", "women-all", "women-new"],
    description: "Носки 3/4 из хлопка в рубчик.", composition: "Хлопок 80%, полиамид 18%, эластан 2%", sizeGuideKey: "socks", rating: 4.8, reviewCount: 6,
  },
  {
    sku: "1ZZ49M", slug: "ultrakorotkie-noski-uniseks-iz-odnotonnogo-khlopka-5par", title: "Ультракороткие Носки Унисекс из Однотонного Хлопка (5 Пар)", type: "Носки",
    price: 799, colors: [c("001"), c("019")], sizes: ["34-36", "37-39", "40-41", "42-43", "44-45"], tags: ["3=4"], collections: ["women-socks", "women-all"],
    description: "Набор из 5 пар ультракоротких носков.", composition: "Хлопок 78%, полиамид 20%, эластан 2%", sizeGuideKey: "socks", rating: 4.7, reviewCount: 48,
  },
  {
    sku: "1ZC50B", slug: "plotnye-kolgotki-50den-iz-mikrofibry", title: "Плотные Колготки 50 Ден из Микрофибры", type: "Колготки",
    price: 699, colors: [c("019")], sizes: S_XL, tags: ["3=4"], collections: ["women-socks", "women-all"],
    description: "Матовые плотные колготки 50 ден из мягкой микрофибры.", composition: "Полиамид 90%, эластан 10%", sizeGuideKey: "socks", rating: 4.6, reviewCount: 27,
  },
  // ---------------- КУПАЛЬНИКИ ----------------
  {
    sku: "1KTI2240", slug: "treugolnyy-lif-bikini-shiny-glam-sinego-tsveta-s-legkim-uplotneniem", title: "Треугольный Лиф Бикини Shiny Glam Синего Цвета с Легким Уплотнением", type: "Лиф бикини",
    price: 599, compareAt: 1999, colors: [c("279Z")], sizes: SWIM_TOP, tags: ["sale"], collections: ["women-swimwear", "women-all", "women-sale", "sale-all"],
    description: "Треугольный лиф бикини с мерцающим эффектом и легким уплотнением.", composition: "Полиамид 80%, эластан 20%", sizeGuideKey: "swim", rating: 4.5, reviewCount: 3,
  },
  {
    sku: "1KSF2317", slug: "plavki-bikini-shiny-glam-slivochno-zheltogo-tsveta-na-zavyazkakh", title: "Плавки Бикини Shiny Glam Сливочно-Желтого Цвета на Завязках", type: "Плавки бикини",
    price: 399, compareAt: 1299, colors: [c("564Z")], sizes: S_L, tags: ["sale", "new"], collections: ["women-swimwear", "women-all", "women-sale", "sale-all"],
    description: "Плавки бикини на завязках с мерцающим эффектом.", composition: "Полиамид 80%, эластан 20%", sizeGuideKey: "swim", rating: 4.4, reviewCount: 2,
  },
  {
    sku: "1KPP328E", slug: "lif-bikini-push-ap-iz-pererabotannoy-mikrofibry-s-legkim-uplotneniem", title: "Лиф Бикини Пуш-ап из Переработанной Микрофибры с Легким Уплотнением", type: "Лиф бикини",
    price: 599, compareAt: 1999, colors: [c("019")], sizes: SWIM_TOP, tags: ["sale", "recycled-microfiber"], collections: ["women-swimwear", "women-all", "women-sale", "sale-all"],
    description: "Лиф бикини пуш-ап из переработанной микрофибры.", composition: "Полиамид 80% переработанный, эластан 20%", sizeGuideKey: "swim", rating: 4.6, reviewCount: 8,
  },
  {
    sku: "1KIN2262", slug: "slitnyy-kupalnik-bando-safari-luxe", title: "Слитный Купальник Бандо Safari Luxe", type: "Слитный купальник",
    price: 999, compareAt: 3399, colors: [c("573Z")], sizes: ["XS", "S", "M", "L"], tags: ["sale", "new"], collections: ["women-swimwear", "women-all", "women-sale", "sale-all"],
    description: "Слитный купальник бандо с принтом сафари и съемными бретелями.", composition: "Полиамид 80%, эластан 20%", sizeGuideKey: "swim", rating: 4.7, reviewCount: 4,
  },
  {
    sku: "1KSN328", slug: "klassicheskie-plavki-bikini-iz-pererabotannoy-mikrofibry", title: "Классические Плавки Бикини из Переработанной Микрофибры", type: "Плавки бикини",
    price: 1299, colors: [c("019")], sizes: XS_XL, tags: ["recycled-microfiber"], collections: ["women-swimwear", "women-all"],
    description: "Классические плавки бикини из переработанной микрофибры.", composition: "Полиамид 80% переработанный, эластан 20%", sizeGuideKey: "swim", rating: 4.5, reviewCount: 10,
  },
  // ---------------- ДЕВОЧКАМ ----------------
  {
    sku: "3SC50M", slug: "bazovye-kyuloty-iz-khlopka-dlya-devochek-4shtuki", title: "Базовые Кюлоты из Хлопка для Девочек (4 Штуки)", type: "Трусики для девочек",
    price: 1299, colors: [c("001"), c("019"), c("698Y")], sizes: KIDS, tags: ["3=4"], collections: ["girls-lingerie", "girls-panties", "girls-all"],
    description: DESC_KIDS, composition: "Хлопок 95%, эластан 5%", sizeGuideKey: "girls", rating: 4.8, reviewCount: 16,
  },
  {
    sku: "3SN50M", slug: "bazovye-slipy-iz-khlopka-dlya-devochek-4shtuki", title: "Базовые Слипы из Хлопка для Девочек (4 Штуки)", type: "Трусики для девочек",
    price: 1299, colors: [c("698Y"), c("001")], sizes: KIDS, tags: ["3=4"], collections: ["girls-lingerie", "girls-panties", "girls-all"],
    description: DESC_KIDS, composition: "Хлопок 95%, эластан 5%", sizeGuideKey: "girls", rating: 4.7, reviewCount: 9,
  },
  {
    sku: "3MC839", slug: "mayka-v-rubchik-s-shirokimi-bretelyami-dlya-devochek", title: "Майка в Рубчик с Широкими Бретелями для Девочек", type: "Майка для девочек",
    price: 299, compareAt: 799, colors: [c("019"), c("001")], sizes: KIDS, tags: ["sale"], collections: ["girls-lingerie", "girls-tops", "girls-all", "girls-sale", "sale-all"],
    description: DESC_KIDS, composition: "Хлопок 95%, эластан 5%", sizeGuideKey: "girls", rating: 4.5, reviewCount: 4,
  },
  {
    sku: "3RS05CT", slug: "byustgalter-braser-iz-khlopka-s-printom-dlya-devochek", title: "Бюстгальтер Брасьер из Хлопка с Принтом для Девочек", type: "Брасьер",
    price: 199, compareAt: 499, colors: [c("178Z"), c("438Z")], sizes: S_L, tags: ["sale"], collections: ["girls-lingerie", "girls-bras", "girls-all", "girls-sale", "sale-all"],
    description: DESC_KIDS, composition: "Хлопок 95%, эластан 5%", sizeGuideKey: "girls", rating: 4.6, reviewCount: 6,
  },
  {
    sku: "3RS05C", slug: "bazovyy-byustgalter-braser-iz-khlopka-dlya-devochek", title: "Базовый Бюстгальтер Брасьер из Хлопка для Девочек", type: "Брасьер",
    price: 499, colors: [c("478Z"), c("5482"), c("001"), c("019")], sizes: S_L, tags: ["3=4", "new"], collections: ["girls-lingerie", "girls-bras", "girls-all", "girls-new"],
    description: DESC_KIDS, composition: "Хлопок 95%, эластан 5%", sizeGuideKey: "girls", rating: 4.8, reviewCount: 12,
  },
  {
    sku: "3TI05C", slug: "byustgalter-treugolnik-so-semnym-uplotneniem-dlya-devochek", title: "Бюстгальтер-Треугольник со Съемным Уплотнением для Девочек", type: "Брасьер",
    price: 899, colors: [c("5482"), c("019")], sizes: S_L, tags: ["3=4"], collections: ["girls-lingerie", "girls-bras", "girls-all"],
    description: DESC_KIDS, composition: "Хлопок 95%, эластан 5%", sizeGuideKey: "girls", rating: 4.7, reviewCount: 3,
  },
  {
    sku: "3SC50PM", slug: "shortiki-kyuloty-iz-khlopka-dlya-devochek-3shtuki", title: "Шортики-Кюлоты из Хлопка для Девочек (3 Штуки)", type: "Трусики для девочек",
    price: 1299, colors: [c("701Y")], sizes: KIDS, tags: ["3=4"], collections: ["girls-lingerie", "girls-panties", "girls-all"],
    description: DESC_KIDS, composition: "Хлопок 95%, эластан 5%", sizeGuideKey: "girls", rating: 4.6, reviewCount: 5,
  },
  {
    sku: "3SN50TM", slug: "slipy-iz-khlopka-s-printom-dlya-devochek-4shtuki", title: "Слипы из Хлопка с Принтом для Девочек (4 Штуки)", type: "Трусики для девочек",
    price: 1299, colors: [c("449Z")], sizes: KIDS, tags: ["3=4"], collections: ["girls-lingerie", "girls-panties", "girls-all"],
    description: DESC_KIDS, composition: "Хлопок 95%, эластан 5%", sizeGuideKey: "girls", rating: 4.7, reviewCount: 8,
  },
  {
    sku: "3ML1461", slug: "longsliv-iz-khlopka-s-printom-dlya-devochek", title: "Лонгслив из Хлопка с Принтом для Девочек", type: "Лонгслив для девочек",
    price: 399, compareAt: 1299, colors: [c("831Y"), c("879Y")], sizes: KIDS.slice(0, 5), tags: ["sale"], collections: ["girls-clothing", "girls-all", "girls-sale", "sale-all"],
    description: DESC_KIDS, composition: "Хлопок 100%", sizeGuideKey: "girls", rating: 4.4, reviewCount: 2,
  },
  {
    sku: "3WA1291", slug: "plate-iz-khlopkovoy-tkani-s-effektom-lna-dlya-devochek", title: "Платье из Хлопковой Ткани с Эффектом Льна для Девочек", type: "Платье для девочек",
    price: 399, compareAt: 1499, colors: [c("452Z")], sizes: KIDS, tags: ["sale"], collections: ["girls-clothing", "girls-all", "girls-sale", "sale-all"],
    description: DESC_KIDS, composition: "Хлопок 100%", sizeGuideKey: "girls", rating: 4.5, reviewCount: 3,
  },
  {
    sku: "3WG820", slug: "yubka-iz-viskoznoy-tkani-s-oborkami-dlya-devochek", title: "Юбка из Вискозной Ткани с Оборками для Девочек", type: "Юбка для девочек",
    price: 399, compareAt: 1499, colors: [c("438Z")], sizes: KIDS, tags: ["sale"], collections: ["girls-clothing", "girls-all", "girls-sale", "sale-all"],
    description: DESC_KIDS, composition: "Вискоза 100%", sizeGuideKey: "girls", rating: 4.6, reviewCount: 1,
  },
  {
    sku: "3WP618", slug: "dzhinsy-klesh-s-zastezhkoy-na-molniyu-i-pugovitsu", title: "Джинсы Клеш с Застежкой на Молнию и Пуговицу", type: "Джинсы для девочек",
    price: 799, compareAt: 2799, colors: [c("837Y"), c("941V")], sizes: KIDS, tags: ["sale"], collections: ["girls-clothing", "girls-all", "girls-sale", "sale-all"],
    description: DESC_KIDS, composition: "Хлопок 98%, эластан 2%", sizeGuideKey: "girls", rating: 4.5, reviewCount: 4,
  },
  {
    sku: "3WP629", slug: "dzhinsy-skinni-dlya-devochek", title: "Джинсы Скинни для Девочек", type: "Джинсы для девочек",
    price: 799, compareAt: 2799, colors: [c("422Y")], sizes: KIDS, tags: ["sale"], collections: ["girls-clothing", "girls-all", "girls-sale", "sale-all"],
    description: DESC_KIDS, composition: "Хлопок 98%, эластан 2%", sizeGuideKey: "girls", rating: 4.7, reviewCount: 6,
  },
  {
    sku: "3WS1043", slug: "shorty-iz-khlopkovogo-futera-s-kantom-dlya-devochek", title: "Шорты из Хлопкового Футера с Кантом для Девочек", type: "Шорты для девочек",
    price: 299, compareAt: 899, colors: [c("503Y")], sizes: KIDS, tags: ["sale"], collections: ["girls-clothing", "girls-all", "girls-sale", "sale-all"],
    description: DESC_KIDS, composition: "Хлопок 100%", sizeGuideKey: "girls", rating: 4.5, reviewCount: 2,
  },
];

/** Deterministic pseudo-random stock status per variant so the UI shows all three states. */
export function mockStock(sku: string, color: string, size: string): StockStatus {
  let h = 0;
  const s = sku + color + size;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const r = h % 10;
  if (r < 2) return "outOfStock";
  if (r < 5) return "lowStock";
  return "inStock";
}

export const MOCK_COLLECTION_TITLES: Record<string, string> = {
  "women-all": "Женщинам",
  "women-new": "Новые поступления",
  "women-sale": "Распродажа для неё",
  "sale-all": "Распродажа",
  "women-lingerie": "Женское нижнее белье",
  "women-bras": "Женские бюстгальтеры",
  "women-bras-balconette": "Бюстгальтеры балконет",
  "women-bras-pushup": "Бюстгальтеры пуш-ап",
  "women-bras-triangle": "Бюстгальтеры-треугольник",
  "women-bras-bandeau": "Бюстгальтеры бандо и без бретелей",
  "women-bras-bralette": "Бралетт и брасьер",
  "women-panties": "Женские трусики",
  "women-panties-brazilian": "Бразильяно",
  "women-panties-slips": "Слипы",
  "women-panties-strings": "Стринги",
  "women-panties-culottes": "Кюлоты",
  "women-sets": "Комплекты нижнего белья",
  "women-invisible": "Невидимое белье",
  "women-shaping": "Моделирующее нижнее белье",
  "women-clothing": "Женская одежда",
  "women-clothing-tops": "Майки, топы и лонгсливы",
  "women-clothing-pants": "Брюки и легинсы",
  "women-clothing-knit": "Кардиганы и джемперы",
  "women-clothing-sweats": "Худи и толстовки",
  "women-clothing-skirts": "Юбки и платья",
  "women-pajamas": "Женские пижамы и одежда для сна",
  "women-pajamas-long": "Длинные пижамы",
  "women-pajamas-short": "Короткие пижамы",
  "women-pajamas-nightwear": "Ночные сорочки и халаты",
  "women-socks": "Женские носки и колготки",
  "women-thermal": "Термоодежда",
  "women-sport": "Спортивная одежда",
  "women-swimwear": "Купальники и пляжная одежда для женщин",
  "natural-lifting-bra": "Бюстгальтеры с естественным эффектом",
  "superior-softness": "Superior Softness",
  "home-build-look": "Собери образ",
  "home-burgundy": "Влюбляясь в бордовый",
  "home-pajamas": "Пижамы для неё",
  "girls-all": "Девочкам",
  "girls-new": "Новинки для девочек",
  "girls-lingerie": "Нижнее белье для девочек",
  "girls-bras": "Бюстгальтеры для девочек",
  "girls-panties": "Трусики для девочек",
  "girls-tops": "Майки для девочек",
  "girls-clothing": "Одежда для девочек",
  "girls-pajamas": "Пижамы для девочек",
  "girls-socks": "Носки и колготки для девочек",
  "girls-swimwear": "Купальники для девочек",
  "girls-sale": "Распродажа для девочек",
};
