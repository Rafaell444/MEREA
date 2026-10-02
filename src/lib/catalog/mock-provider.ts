import type {
  Cart, CartLine, CatalogProvider, Collection, CollectionQuery, PredictiveResult, Product, ProductCard,
  ProductFilter, ProductVariant, StockStatus,
} from "./types";
import { MODELS, MOCK_COLLECTION_TITLES, mockImage, mockStock, type MockModel, type MockColor } from "./mock-data";
import { mockCustomers } from "./mock-customers";

const DEFAULT_VIEWS = ["M", "F", "FI"];

function handleFor(m: MockModel, color: MockColor) {
  return `${m.slug}-${m.sku}-${color.code.toLowerCase()}`;
}

function variantId(m: MockModel, color: MockColor, size: string) {
  return `gid://mock/ProductVariant/${m.sku}${color.code}-${size.replace(/\s+/g, "")}`;
}

function buildCard(m: MockModel, color: MockColor): ProductCard {
  const sku = `${m.sku}${color.code}`;
  const views = DEFAULT_VIEWS;
  const sizes = m.sizes.map((size) => {
    const stockStatus = mockStock(m.sku, color.code, size);
    return { label: size, variantId: variantId(m, color, size), stockStatus, available: stockStatus !== "outOfStock" };
  });
  const badges: string[] = [];
  if (m.tags.includes("recycled-microfiber")) badges.push("Переработанная микрофибра");
  if (m.tags.includes("organic-cotton")) badges.push("Органический хлопок");
  if (m.tags.includes("anna-pokrov")) badges.push("Выбор Ани Покров");
  return {
    id: `gid://mock/Product/${sku}`,
    handle: handleFor(m, color),
    title: m.title,
    vendor: "Merea",
    productType: m.type,
    tags: m.tags,
    images: views.map((v, i) => ({ url: mockImage(m.sku, color.code, v), alt: `${m.title} — ${color.name} (${i + 1})`, width: 800, height: 1200 })),
    price: { amount: m.price, currencyCode: "RUB" },
    compareAtPrice: m.compareAt ? { amount: m.compareAt, currencyCode: "RUB" } : null,
    colorName: color.name,
    colorsCount: m.colors.length,
    sizes,
    badges,
    isNew: m.tags.includes("new"),
    isSale: m.tags.includes("sale") || !!m.compareAt,
  };
}

function buildProduct(m: MockModel, color: MockColor): Product {
  const card = buildCard(m, color);
  const variants: ProductVariant[] = card.sizes.map((s) => ({
    id: s.variantId,
    title: s.label,
    sku: `${m.sku}${color.code}-${s.label}`,
    availableForSale: s.available,
    quantityAvailable: s.stockStatus === "inStock" ? 12 : s.stockStatus === "lowStock" ? 2 : 0,
    stockStatus: s.stockStatus,
    price: card.price,
    compareAtPrice: card.compareAtPrice,
    selectedOptions: [
      { name: "Цвет", value: color.name },
      { name: "Размер", value: s.label },
    ],
    image: card.images[0],
  }));
  return {
    ...card,
    description: m.description,
    descriptionHtml: `<p>${m.description}</p>`,
    sku: m.sku,
    options: [
      { name: "Цвет", values: [color.name] },
      { name: "Размер", values: m.sizes },
    ],
    variants,
    colorSiblings: m.colors.map((cc) => ({
      handle: handleFor(m, cc),
      colorName: cc.name,
      colorCode: cc.code,
      hex: cc.hex,
      image: mockImage(m.sku, cc.code, "F"),
      available: true,
    })),
    composition: m.composition,
    care: "Стирка при 30°C в деликатном режиме. Не отбеливать. Не сушить в сушильной машине. Не гладить. Не подвергать химической чистке.",
    sizeGuideKey: m.sizeGuideKey,
    rating: m.rating,
    reviewCount: m.reviewCount,
    seo: { title: `${m.title} Merea, цвет ${color.name} — купить`, description: m.description.slice(0, 155) },
    collections: m.collections.map((h) => ({ handle: h, title: MOCK_COLLECTION_TITLES[h] ?? h })),
  };
}

// Pre-build the full catalog once.
type Entry = { model: MockModel; color: MockColor; card: ProductCard };
const ENTRIES: Entry[] = MODELS.flatMap((model) => model.colors.map((color) => ({ model, color, card: buildCard(model, color) })));
const BY_HANDLE = new Map(ENTRIES.map((e) => [e.card.handle, e]));
const BY_ID = new Map(ENTRIES.map((e) => [e.card.id, e]));

function sortEntries(list: Entry[], sort?: CollectionQuery["sort"]) {
  const copy = [...list];
  switch (sort) {
    case "PRICE_ASC": return copy.sort((a, b) => a.card.price.amount - b.card.price.amount);
    case "PRICE_DESC": return copy.sort((a, b) => b.card.price.amount - a.card.price.amount);
    case "TITLE": return copy.sort((a, b) => a.card.title.localeCompare(b.card.title, "ru"));
    case "CREATED": return copy.sort((a, b) => Number(!!b.card.isNew) - Number(!!a.card.isNew));
    default: return copy;
  }
}

function colorGroup(hex: string): string {
  // very rough grouping for the colour filter
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max - min < 25) return l < 60 ? "Черный" : l > 225 ? "Белый" : "Серый";
  if (r > g && r > b) return g > 150 ? "Бежевый" : b > 90 ? "Розовый" : "Бордовый";
  if (g > r && g > b) return "Зеленый";
  if (b > r && b > g) return r > 120 ? "Фиолетовый" : "Синий";
  return "Бежевый";
}

function applyFilters(list: Entry[], filters?: CollectionQuery["filters"]) {
  if (!filters) return list;
  return list.filter((e) => {
    for (const [key, values] of Object.entries(filters)) {
      if (!values?.length) continue;
      if (key === "color" && !values.includes(colorGroup(e.color.hex))) return false;
      if (key === "size" && !e.card.sizes.some((s) => values.includes(s.label) && s.available)) return false;
      if (key === "material") {
        const mats = e.model.tags.filter((t) => ["recycled-microfiber", "organic-cotton", "recycled-lace", "merino"].includes(t));
        if (!mats.some((m) => values.includes(m))) return false;
      }
      if (key === "price") {
        const [min, max] = values[0].split("-").map(Number);
        if (e.card.price.amount < (min || 0) || e.card.price.amount > (max || Infinity)) return false;
      }
      if (key === "tag" && !values.some((v) => e.model.tags.includes(v))) return false;
    }
    return true;
  });
}

function buildFilters(list: Entry[]): ProductFilter[] {
  const LIST = "LIST" as const;
  const PRICE = "PRICE_RANGE" as const;
  const count = (fn: (e: Entry) => string[]) => {
    const m = new Map<string, number>();
    list.forEach((e) => fn(e).forEach((v) => m.set(v, (m.get(v) ?? 0) + 1)));
    return [...m.entries()];
  };
  const MATERIAL_LABELS: Record<string, string> = { "recycled-microfiber": "Переработанная микрофибра", "organic-cotton": "Органический хлопок", "recycled-lace": "Переработанное кружево", merino: "Мериносовая шерсть" };
  const sizeOrder = ["XS", "S", "M", "L", "XL"];
  return [
    { id: "color", label: "Цвет", type: LIST, values: count((e) => [colorGroup(e.color.hex)]).map(([v, n]) => ({ id: v, label: v, count: n, input: v })) },
    {
      id: "size", label: "Размер", type: LIST,
      values: count((e) => e.card.sizes.map((s) => s.label)).sort((a, b) => (sizeOrder.indexOf(a[0]) - sizeOrder.indexOf(b[0])) || a[0].localeCompare(b[0])).map(([v, n]) => ({ id: v, label: v, count: n, input: v })),
    },
    { id: "material", label: "Материал", type: LIST, values: count((e) => e.model.tags.filter((t) => MATERIAL_LABELS[t])).map(([v, n]) => ({ id: v, label: MATERIAL_LABELS[v], count: n, input: v })) },
    { id: "price", label: "Цена", type: PRICE, values: [{ id: "0-1000", label: "до 1 000 ₽", count: 0, input: "0-1000" }, { id: "1000-2000", label: "1 000 – 2 000 ₽", count: 0, input: "1000-2000" }, { id: "2000-100000", label: "от 2 000 ₽", count: 0, input: "2000-100000" }] },
  ].filter((f) => f.values.length > 0);
}

function paginate(list: Entry[], query: CollectionQuery | undefined, handle: string, title: string): Collection {
  const pageSize = query?.first ?? 24;
  const page = Math.max(1, query?.page ?? 1);
  const filtered = applyFilters(list, query?.filters);
  const sorted = sortEntries(filtered, query?.sort);
  const slice = sorted.slice((page - 1) * pageSize, page * pageSize);
  return {
    id: `gid://mock/Collection/${handle}`,
    handle,
    title,
    products: slice.map((e) => e.card),
    totalCount: filtered.length,
    pageInfo: { hasNextPage: page * pageSize < filtered.length, endCursor: null, page, pageSize },
    filters: buildFilters(list),
  };
}

// ---------------- Cart (in-memory, per server process) ----------------
type CartStore = Map<string, Cart>;
const g = globalThis as unknown as { __mockCarts?: CartStore };
const carts: CartStore = (g.__mockCarts ??= new Map());

function money(n: number) {
  return { amount: Math.round(n * 100) / 100, currencyCode: "RUB" };
}

function recompute(cart: Cart): Cart {
  const subtotal = cart.lines.reduce((s, l) => s + l.cost.subtotalAmount.amount, 0);
  let discount = 0;
  if (cart.discountCodes.some((d) => d.applicable && d.code.toUpperCase() === "WELCOME10")) discount = subtotal * 0.1;
  cart.cost = { subtotalAmount: money(subtotal), totalAmount: money(subtotal - discount), totalDiscountAmount: money(discount) };
  cart.totalQuantity = cart.lines.reduce((s, l) => s + l.quantity, 0);
  return cart;
}

function lineFromVariant(merchandiseId: string, quantity: number): CartLine | null {
  // merchandiseId: gid://mock/ProductVariant/<SKU><COLOR>-<SIZE>
  const m = merchandiseId.match(/ProductVariant\/([A-Z0-9]+?)([A-Z0-9]{3,4})-(.+)$/i);
  if (!m) return null;
  const entry = ENTRIES.find((e) => `${e.model.sku}${e.color.code}` === `${m[1]}${m[2]}` || e.card.sizes.some((s) => s.variantId === merchandiseId));
  if (!entry) return null;
  const size = entry.card.sizes.find((s) => s.variantId === merchandiseId);
  if (!size) return null;
  const unit = entry.card.price.amount;
  return {
    id: `line-${merchandiseId.split("/").pop()}`,
    quantity,
    merchandise: {
      id: merchandiseId,
      title: size.label,
      sku: `${entry.model.sku}${entry.color.code}`,
      product: { id: entry.card.id, handle: entry.card.handle, title: entry.card.title, colorName: entry.color.name },
      image: entry.card.images[0],
      price: entry.card.price,
      compareAtPrice: entry.card.compareAtPrice,
      selectedOptions: [{ name: "Цвет", value: entry.color.name }, { name: "Размер", value: size.label }],
    },
    cost: { totalAmount: money(unit * quantity), subtotalAmount: money(unit * quantity) },
  };
}

function newCart(): Cart {
  const id = `gid://mock/Cart/${Math.random().toString(36).slice(2, 12)}`;
  const cart: Cart = { id, checkoutUrl: `/checkout?cart=${encodeURIComponent(id)}`, totalQuantity: 0, lines: [], cost: { subtotalAmount: money(0), totalAmount: money(0), totalDiscountAmount: money(0) }, discountCodes: [] };
  carts.set(id, cart);
  return cart;
}

export const mockProvider: CatalogProvider = {
  name: "mock",

  async getProduct(handle) {
    const e = BY_HANDLE.get(handle);
    return e ? buildProduct(e.model, e.color) : null;
  },

  async getProductsByHandles(handles) {
    return handles.map((h) => BY_HANDLE.get(h)?.card).filter((c): c is ProductCard => !!c);
  },

  async getCollection(handle, query) {
    const title = MOCK_COLLECTION_TITLES[handle];
    const list = ENTRIES.filter((e) => e.model.collections.includes(handle));
    if (!title && list.length === 0) return null;
    // Show one colour per model first, then the rest — mirrors how the live PLP mixes colours
    return paginate(list, query, handle, title ?? handle);
  },

  async getRecommendations(productId, limit = 12) {
    const e = BY_ID.get(productId);
    if (!e) return ENTRIES.slice(0, limit).map((x) => x.card);
    const sameCollections = ENTRIES.filter((x) => x.card.id !== productId && x.model.collections.some((c) => e.model.collections.includes(c)));
    const uniq = new Map<string, Entry>();
    sameCollections.forEach((x) => { if (!uniq.has(x.model.sku)) uniq.set(x.model.sku, x); });
    return [...uniq.values()].slice(0, limit).map((x) => x.card);
  },

  async search(query, options) {
    const q = query.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const list = ENTRIES.filter((e) => {
      const hay = `${e.card.title} ${e.model.type} ${e.color.name} ${e.model.sku} ${e.model.tags.join(" ")}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
    return paginate(list, options, "search", `Результаты поиска: ${query}`);
  },

  async predictiveSearch(query) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { queries: [], products: [], collections: [] };
    const res = await this.search(query, { first: 6 });
    const types = [...new Set(ENTRIES.filter((e) => e.model.type.toLowerCase().includes(q)).map((e) => e.model.type))].slice(0, 5);
    const collections = Object.entries(MOCK_COLLECTION_TITLES).filter(([, t]) => t.toLowerCase().includes(q)).slice(0, 4).map(([handle, title]) => ({ handle, title }));
    return { queries: types, products: res.products, collections };
  },

  async listCollections() {
    return Object.entries(MOCK_COLLECTION_TITLES).map(([handle, title]) => ({ handle, title, productsCount: ENTRIES.filter((e) => e.model.collections.includes(handle)).length }));
  },

  // ---- cart ----
  async createCart(lines = []) {
    const cart = newCart();
    return this.addToCart(cart.id, lines);
  },
  async getCart(id) {
    return carts.get(id) ?? null;
  },
  async addToCart(cartId, lines) {
    const cart = carts.get(cartId) ?? newCart();
    for (const l of lines) {
      const existing = cart.lines.find((x) => x.merchandise.id === l.merchandiseId);
      if (existing) {
        existing.quantity += l.quantity;
        existing.cost.subtotalAmount = money(existing.merchandise.price.amount * existing.quantity);
        existing.cost.totalAmount = existing.cost.subtotalAmount;
      } else {
        const line = lineFromVariant(l.merchandiseId, l.quantity);
        if (line) cart.lines.push(line);
      }
    }
    return recompute(cart);
  },
  async updateCartLines(cartId, lines) {
    const cart = carts.get(cartId) ?? newCart();
    for (const l of lines) {
      const existing = cart.lines.find((x) => x.id === l.id);
      if (!existing) continue;
      if (l.quantity <= 0) cart.lines = cart.lines.filter((x) => x.id !== l.id);
      else {
        existing.quantity = l.quantity;
        existing.cost.subtotalAmount = money(existing.merchandise.price.amount * l.quantity);
        existing.cost.totalAmount = existing.cost.subtotalAmount;
      }
    }
    return recompute(cart);
  },
  async removeCartLines(cartId, lineIds) {
    const cart = carts.get(cartId) ?? newCart();
    cart.lines = cart.lines.filter((x) => !lineIds.includes(x.id));
    return recompute(cart);
  },
  async applyDiscount(cartId, codes) {
    const cart = carts.get(cartId) ?? newCart();
    cart.discountCodes = codes.filter(Boolean).map((code) => ({ code, applicable: code.toUpperCase() === "WELCOME10" }));
    return recompute(cart);
  },

  // ---- customer (DB-backed demo accounts) ----
  ...mockCustomers,
};

export const mockPredictive = (q: string): Promise<PredictiveResult> => mockProvider.predictiveSearch(q);
export type { StockStatus };
