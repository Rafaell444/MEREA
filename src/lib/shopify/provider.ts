import "server-only";
import type {
  Cart, CartLine, CatalogProvider, Collection, CollectionQuery, Customer, CustomerOrder, PredictiveResult, Product, ProductCard,
  ProductFilter, ProductVariant, StockStatus,
} from "@/lib/catalog/types";
import { storefront, ShopifyError } from "./client";
import * as Q from "./queries";

/* ------------------------------------------------------------------ */
/* Raw Shopify shapes (only the fields we read)                        */
/* ------------------------------------------------------------------ */
type RawMoney = { amount: string; currencyCode: string };
type RawImage = { url: string; altText?: string | null; width?: number | null; height?: number | null } | null;
type RawVariant = {
  id: string; title: string; sku?: string | null; availableForSale: boolean; quantityAvailable?: number | null;
  price: RawMoney; compareAtPrice?: RawMoney | null; selectedOptions: { name: string; value: string }[]; image?: RawImage;
};
type RawProduct = {
  id: string; handle: string; title: string; vendor?: string; productType?: string; tags: string[]; availableForSale: boolean; createdAt?: string;
  featuredImage?: RawImage; images: { nodes: NonNullable<RawImage>[] };
  priceRange: { minVariantPrice: RawMoney; maxVariantPrice: RawMoney };
  compareAtPriceRange?: { minVariantPrice: RawMoney; maxVariantPrice: RawMoney };
  options: { name: string; values: string[] }[];
  variants: { nodes: RawVariant[] };
  colorName?: { value: string } | null; colorsCount?: { value: string } | null; modelCode?: { value: string } | null;
  description?: string; descriptionHtml?: string; seo?: { title?: string | null; description?: string | null };
  collections?: { nodes: { handle: string; title: string }[] };
  allImages?: { nodes: NonNullable<RawImage>[] };
  allVariants?: { nodes: RawVariant[] };
  composition?: { value: string } | null; care?: { value: string } | null; sizeGuide?: { value: string } | null;
  colorHex?: { value: string } | null; rating?: { value: string } | null; ratingCount?: { value: string } | null;
};
type RawFilter = { id: string; label: string; type: "LIST" | "PRICE_RANGE" | "BOOLEAN"; values: { id: string; label: string; count: number; input: string; swatch?: { color?: string | null } | null }[] };
type RawCart = {
  id: string; checkoutUrl: string; totalQuantity: number; discountCodes: { code: string; applicable: boolean }[];
  cost: { subtotalAmount: RawMoney; totalAmount: RawMoney };
  lines: { nodes: { id: string; quantity: number; cost: { totalAmount: RawMoney; subtotalAmount: RawMoney }; merchandise: RawVariant & { product: { id: string; handle: string; title: string; colorName?: { value: string } | null } } }[] };
};

const money = (m: RawMoney | null | undefined) => (m ? { amount: Number(m.amount), currencyCode: m.currencyCode } : null);
const image = (i: RawImage | undefined) => (i ? { url: i.url, alt: i.altText ?? undefined, width: i.width ?? undefined, height: i.height ?? undefined } : null);

// i18n: fallback error strings are translation sources; API routes wrap them with t(res.error).
// i18n: t("Неверный e-mail или пароль") t("Не удалось создать аккаунт") t("Не удалось сохранить адрес")
const SIZE_OPTION_NAMES = ["размер", "size", "taglia"];
const COLOR_OPTION_NAMES = ["цвет", "color", "colour", "colore"];

function stockStatus(v: RawVariant): StockStatus {
  if (!v.availableForSale) return "outOfStock";
  if (typeof v.quantityAvailable === "number" && v.quantityAvailable > 0 && v.quantityAvailable <= 3) return "lowStock";
  return "inStock";
}

function sizeOf(v: RawVariant) {
  const opt = v.selectedOptions.find((o) => SIZE_OPTION_NAMES.includes(o.name.toLowerCase()));
  return opt?.value ?? v.title;
}

function toCard(p: RawProduct): ProductCard {
  const price = money(p.priceRange.minVariantPrice)!;
  const compare = money(p.compareAtPriceRange?.minVariantPrice);
  const colorOpt = p.options.find((o) => COLOR_OPTION_NAMES.includes(o.name.toLowerCase()));
  const tagsLower = p.tags.map((t) => t.toLowerCase());
  const badges = p.tags.filter((t) => t.toLowerCase().startsWith("badge:")).map((t) => t.slice(6));
  const created = p.createdAt ? Date.now() - new Date(p.createdAt).getTime() < 1000 * 60 * 60 * 24 * 45 : false;
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags,
    images: (p.images?.nodes?.length ? p.images.nodes : p.featuredImage ? [p.featuredImage] : []).map((i) => image(i)!).filter(Boolean),
    price,
    compareAtPrice: compare && compare.amount > price.amount ? compare : null,
    colorName: p.colorName?.value ?? colorOpt?.values?.[0],
    colorsCount: Number(p.colorsCount?.value ?? 1) || 1,
    sizes: p.variants.nodes.map((v) => ({ label: sizeOf(v), variantId: v.id, stockStatus: stockStatus(v), available: v.availableForSale })),
    badges,
    isNew: tagsLower.includes("new") || tagsLower.includes("новинка") || created,
    isSale: (compare && compare.amount > price.amount) || tagsLower.includes("sale"),
  };
}

function toProduct(p: RawProduct): Product {
  const full: RawProduct = { ...p, images: p.allImages?.nodes?.length ? p.allImages : p.images, variants: p.allVariants?.nodes?.length ? p.allVariants : p.variants };
  const card = toCard(full);
  const variants: ProductVariant[] = full.variants.nodes.map((v) => ({
    id: v.id,
    title: sizeOf(v),
    sku: v.sku ?? undefined,
    availableForSale: v.availableForSale,
    quantityAvailable: v.quantityAvailable,
    stockStatus: stockStatus(v),
    price: money(v.price)!,
    compareAtPrice: money(v.compareAtPrice),
    selectedOptions: v.selectedOptions,
    image: image(v.image),
  }));
  return {
    ...card,
    description: p.description ?? "",
    descriptionHtml: p.descriptionHtml ?? "",
    sku: p.modelCode?.value ?? p.variants.nodes[0]?.sku?.split("-")[0],
    options: p.options,
    variants,
    colorSiblings: [],
    composition: p.composition?.value,
    care: p.care?.value,
    sizeGuideKey: p.sizeGuide?.value,
    rating: p.rating?.value ? Number(JSON.parse(p.rating.value)?.value ?? p.rating.value) : undefined,
    reviewCount: p.ratingCount?.value ? Number(p.ratingCount.value) : undefined,
    seo: { title: p.seo?.title ?? undefined, description: p.seo?.description ?? undefined },
    collections: p.collections?.nodes ?? [],
  };
}

function toFilters(filters: RawFilter[]): ProductFilter[] {
  return filters
    .filter((f) => f.type !== "BOOLEAN")
    .map((f) => ({
      id: f.id,
      label: f.label,
      type: f.type as "LIST" | "PRICE_RANGE",
      values: f.values.map((v) => ({ id: v.id, label: v.label, count: v.count, input: v.input, hex: v.swatch?.color ?? undefined })),
    }));
}

/** Convert our simple filter map to Shopify ProductFilter inputs. Values come from `FilterValue.input` (JSON). */
function toShopifyFilters(filters?: CollectionQuery["filters"]) {
  if (!filters) return undefined;
  const out: unknown[] = [];
  for (const values of Object.values(filters)) {
    for (const v of values) {
      try { out.push(JSON.parse(v)); } catch { /* ignore non-JSON */ }
    }
  }
  return out.length ? out : undefined;
}

function sortArgs(sort?: CollectionQuery["sort"], isSearch = false) {
  switch (sort) {
    case "PRICE_ASC": return { sortKey: "PRICE", reverse: false };
    case "PRICE_DESC": return { sortKey: "PRICE", reverse: true };
    case "CREATED": return { sortKey: isSearch ? "RELEVANCE" : "CREATED", reverse: !isSearch };
    case "BEST_SELLING": return { sortKey: isSearch ? "RELEVANCE" : "BEST_SELLING", reverse: false };
    case "TITLE": return { sortKey: isSearch ? "RELEVANCE" : "TITLE", reverse: false };
    default: return { sortKey: isSearch ? "RELEVANCE" : "COLLECTION_DEFAULT", reverse: false };
  }
}

function toCart(c: RawCart): Cart {
  const lines: CartLine[] = c.lines.nodes.map((l) => ({
    id: l.id,
    quantity: l.quantity,
    merchandise: {
      id: l.merchandise.id,
      title: l.merchandise.title,
      sku: l.merchandise.sku ?? undefined,
      product: { id: l.merchandise.product.id, handle: l.merchandise.product.handle, title: l.merchandise.product.title, colorName: l.merchandise.product.colorName?.value },
      image: image(l.merchandise.image),
      price: money(l.merchandise.price)!,
      compareAtPrice: money(l.merchandise.compareAtPrice),
      selectedOptions: l.merchandise.selectedOptions,
    },
    cost: { totalAmount: money(l.cost.totalAmount)!, subtotalAmount: money(l.cost.subtotalAmount)! },
  }));
  const subtotal = money(c.cost.subtotalAmount)!;
  const total = money(c.cost.totalAmount)!;
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity,
    lines,
    cost: { subtotalAmount: subtotal, totalAmount: total, totalDiscountAmount: { amount: Math.max(0, subtotal.amount - total.amount), currencyCode: total.currencyCode } },
    discountCodes: c.discountCodes,
  };
}

function assertNoUserErrors(errs?: { message: string }[]) {
  if (errs?.length) throw new ShopifyError(errs.map((e) => e.message).join("; "), errs);
}

/* ------------------------------------------------------------------ */
export const shopifyProvider: CatalogProvider = {
  name: "shopify",

  async getProduct(handle) {
    const data = await storefront<{ product: RawProduct | null }>(Q.GET_PRODUCT, { handle }, { tags: [`product:${handle}`] });
    if (!data.product) return null;
    const product = toProduct(data.product);
    const model = data.product.modelCode?.value;
    if (model) {
      const sib = await storefront<{ products: { nodes: { handle: string; availableForSale: boolean; featuredImage?: RawImage; colorName?: { value: string } | null; colorHex?: { value: string } | null }[] } }>(
        Q.GET_SIBLINGS, { query: `tag:model:${model}` }, { tags: [`model:${model}`] },
      );
      product.colorSiblings = sib.products.nodes.map((n) => ({ handle: n.handle, colorName: n.colorName?.value ?? "", hex: n.colorHex?.value ?? undefined, image: n.featuredImage?.url, available: n.availableForSale }));
    }
    return product;
  },

  async getProductsByHandles(handles) {
    if (!handles.length) return [];
    const query = handles.map((h) => `handle:${h}`).join(" OR ");
    const data = await storefront<{ products: { nodes: RawProduct[] } }>(Q.GET_PRODUCTS_BY_HANDLES, { query, first: handles.length });
    const byHandle = new Map(data.products.nodes.map((p) => [p.handle, toCard(p)]));
    return handles.map((h) => byHandle.get(h)).filter((p): p is ProductCard => !!p);
  },

  async getCollection(handle, query = {}) {
    const first = query.first ?? 24;
    const { sortKey, reverse } = sortArgs(query.sort);
    const data = await storefront<{ collection: (Omit<RawProduct, "variants"> & { description?: string; image?: RawImage; products: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; filters: RawFilter[]; nodes: RawProduct[] } }) | null }>(
      Q.GET_COLLECTION,
      { handle, first, after: query.after ?? null, sortKey, reverse, filters: toShopifyFilters(query.filters) },
      { tags: [`collection:${handle}`] },
    );
    const c = data.collection;
    if (!c) return null;
    return {
      id: c.id,
      handle: c.handle,
      title: c.title,
      description: c.description,
      image: image(c.image),
      products: c.products.nodes.map(toCard),
      totalCount: -1, // Storefront API doesn't expose counts for collections; UI falls back to filter counts
      pageInfo: { hasNextPage: c.products.pageInfo.hasNextPage, endCursor: c.products.pageInfo.endCursor, page: query.page ?? 1, pageSize: first },
      filters: toFilters(c.products.filters),
    };
  },

  async getRecommendations(productId, limit = 12) {
    const data = await storefront<{ productRecommendations: RawProduct[] | null }>(Q.GET_RECOMMENDATIONS, { productId });
    return (data.productRecommendations ?? []).slice(0, limit).map(toCard);
  },

  async search(query, options = {}) {
    const first = options.first ?? 24;
    const { sortKey, reverse } = sortArgs(options.sort, true);
    const data = await storefront<{ search: { totalCount: number; pageInfo: { hasNextPage: boolean; endCursor: string | null }; productFilters: RawFilter[]; nodes: RawProduct[] } }>(
      Q.SEARCH_PRODUCTS, { query, first, after: options.after ?? null, sortKey, reverse, filters: toShopifyFilters(options.filters) }, { revalidate: 30 },
    );
    return {
      id: "search",
      handle: "search",
      title: `Результаты поиска: ${query}`,
      products: data.search.nodes.map(toCard),
      totalCount: data.search.totalCount,
      pageInfo: { ...data.search.pageInfo, page: options.page ?? 1, pageSize: first },
      filters: toFilters(data.search.productFilters),
    } satisfies Collection;
  },

  async predictiveSearch(query): Promise<PredictiveResult> {
    const data = await storefront<{ predictiveSearch: { queries: { text: string }[]; collections: { handle: string; title: string }[]; products: RawProduct[] } | null }>(Q.PREDICTIVE_SEARCH, { query }, { revalidate: 30 });
    const r = data.predictiveSearch;
    return { queries: r?.queries.map((q) => q.text) ?? [], products: r?.products.map(toCard) ?? [], collections: r?.collections ?? [] };
  },

  async listCollections() {
    const out: { handle: string; title: string }[] = [];
    let after: string | null = null;
    do {
      const data: { collections: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: { handle: string; title: string }[] } } =
        await storefront(Q.LIST_COLLECTIONS, { after }, { revalidate: 300 });
      out.push(...data.collections.nodes);
      after = data.collections.pageInfo.hasNextPage ? data.collections.pageInfo.endCursor : null;
    } while (after);
    return out;
  },

  // ---- cart ----
  async createCart(lines = []) {
    const data = await storefront<{ cartCreate: { cart: RawCart; userErrors: { message: string }[] } }>(Q.CART_CREATE, { input: { lines } }, { cache: "no-store" });
    assertNoUserErrors(data.cartCreate.userErrors);
    return toCart(data.cartCreate.cart);
  },
  async getCart(id) {
    const data = await storefront<{ cart: RawCart | null }>(Q.CART_GET, { id }, { cache: "no-store" });
    return data.cart ? toCart(data.cart) : null;
  },
  async addToCart(cartId, lines) {
    const data = await storefront<{ cartLinesAdd: { cart: RawCart; userErrors: { message: string }[] } }>(Q.CART_LINES_ADD, { cartId, lines }, { cache: "no-store" });
    assertNoUserErrors(data.cartLinesAdd.userErrors);
    return toCart(data.cartLinesAdd.cart);
  },
  async updateCartLines(cartId, lines) {
    const data = await storefront<{ cartLinesUpdate: { cart: RawCart; userErrors: { message: string }[] } }>(Q.CART_LINES_UPDATE, { cartId, lines }, { cache: "no-store" });
    assertNoUserErrors(data.cartLinesUpdate.userErrors);
    return toCart(data.cartLinesUpdate.cart);
  },
  async removeCartLines(cartId, lineIds) {
    const data = await storefront<{ cartLinesRemove: { cart: RawCart; userErrors: { message: string }[] } }>(Q.CART_LINES_REMOVE, { cartId, lineIds }, { cache: "no-store" });
    assertNoUserErrors(data.cartLinesRemove.userErrors);
    return toCart(data.cartLinesRemove.cart);
  },
  async applyDiscount(cartId, codes) {
    const data = await storefront<{ cartDiscountCodesUpdate: { cart: RawCart; userErrors: { message: string }[] } }>(Q.CART_DISCOUNT_UPDATE, { cartId, discountCodes: codes }, { cache: "no-store" });
    assertNoUserErrors(data.cartDiscountCodesUpdate.userErrors);
    return toCart(data.cartDiscountCodesUpdate.cart);
  },

  // ---- customer ----
  async login(email, password) {
    const data = await storefront<{ customerAccessTokenCreate: { customerAccessToken: { accessToken: string; expiresAt: string } | null; customerUserErrors: { message: string }[] } }>(
      Q.CUSTOMER_ACCESS_TOKEN_CREATE, { input: { email, password } }, { cache: "no-store" },
    );
    const r = data.customerAccessTokenCreate;
    if (!r.customerAccessToken) return { error: r.customerUserErrors[0]?.message ?? "Неверный e-mail или пароль" };
    return { token: r.customerAccessToken.accessToken, expiresAt: r.customerAccessToken.expiresAt };
  },
  async register(input) {
    const data = await storefront<{ customerCreate: { customer: { id: string } | null; customerUserErrors: { message: string }[] } }>(Q.CUSTOMER_CREATE, { input }, { cache: "no-store" });
    if (!data.customerCreate.customer) return { error: data.customerCreate.customerUserErrors[0]?.message ?? "Не удалось создать аккаунт" };
    return { ok: true };
  },
  async getCustomer(token): Promise<Customer | null> {
    type RawAddr = { id: string; firstName?: string | null; lastName?: string | null; company?: string | null; address1?: string | null; address2?: string | null; city?: string | null; province?: string | null; zip?: string | null; country?: string | null; phone?: string | null };
    const data = await storefront<{ customer: { id: string; email: string; firstName?: string | null; lastName?: string | null; phone?: string | null; acceptsMarketing?: boolean; defaultAddress?: { id: string } | null; addresses: { nodes: RawAddr[] }; birthday?: { value: string } | null; gender?: { value: string } | null; bonusBalance?: { value: string } | null } | null }>(
      Q.GET_CUSTOMER_FULL, { token }, { cache: "no-store" },
    );
    const c = data.customer;
    if (!c) return null;
    const def = c.defaultAddress?.id ?? null;
    return {
      id: c.id, email: c.email, firstName: c.firstName ?? undefined, lastName: c.lastName ?? undefined, phone: c.phone ?? undefined, acceptsMarketing: c.acceptsMarketing,
      birthday: c.birthday?.value, gender: c.gender?.value, bonusBalance: c.bonusBalance ? Number(c.bonusBalance.value) : undefined,
      defaultAddressId: def,
      addresses: c.addresses.nodes.map((a) => ({ id: a.id, firstName: a.firstName ?? undefined, lastName: a.lastName ?? undefined, company: a.company ?? undefined, address1: a.address1 ?? "", address2: a.address2 ?? undefined, city: a.city ?? "", province: a.province ?? undefined, zip: a.zip ?? undefined, country: a.country ?? "", phone: a.phone ?? undefined, isDefault: a.id === def })),
    };
  },
  async getCustomerOrder(token, orderId) {
    const num = orderId.replace(/\D/g, "");
    const data = await storefront<{ customer: { orders: { nodes: Record<string, unknown>[] } } | null }>(Q.GET_CUSTOMER_ORDER, { token, query: `name:#${num}` }, { cache: "no-store" });
    const o = data.customer?.orders.nodes[0] as
      | { id: string; orderNumber: number; processedAt: string; financialStatus?: string; fulfillmentStatus?: string; statusUrl?: string; totalPrice: RawMoney; subtotalPrice?: RawMoney | null; totalShippingPrice?: RawMoney | null; shippingAddress?: Record<string, string | null> | null; successfulFulfillments?: { trackingInfo: { number?: string | null; url?: string | null }[] }[]; lineItems: { nodes: { title: string; quantity: number; originalTotalPrice?: RawMoney; variant?: { title?: string; image?: { url: string } | null; product?: { handle?: string } } | null }[] } }
      | undefined;
    if (!o) return null;
    const tracking = o.successfulFulfillments?.[0]?.trackingInfo?.[0];
    return {
      id: o.id, orderNumber: o.orderNumber, processedAt: o.processedAt, financialStatus: o.financialStatus, fulfillmentStatus: o.fulfillmentStatus, statusUrl: o.statusUrl,
      totalPrice: money(o.totalPrice)!, subtotalPrice: money(o.subtotalPrice) ?? undefined, shippingPrice: money(o.totalShippingPrice) ?? undefined,
      shippingAddress: o.shippingAddress ? Object.fromEntries(Object.entries(o.shippingAddress).map(([k, v]) => [k, v ?? undefined])) : undefined,
      trackingNumber: tracking?.number ?? undefined, trackingUrl: tracking?.url ?? undefined,
      lineItems: o.lineItems.nodes.map((li) => ({ title: li.title, quantity: li.quantity, variantTitle: li.variant?.title, image: li.variant?.image?.url, price: money(li.originalTotalPrice) ?? undefined, handle: li.variant?.product?.handle })),
    };
  },
  async updateCustomer(token, input) {
    const customer: Record<string, unknown> = {};
    for (const k of ["firstName", "lastName", "phone", "email", "password", "acceptsMarketing"] as const) if (input[k] !== undefined) customer[k] = input[k];
    const data = await storefront<{ customerUpdate: { customerAccessToken?: { accessToken: string; expiresAt: string } | null; customerUserErrors: { message: string }[] } }>(Q.CUSTOMER_UPDATE, { token, customer }, { cache: "no-store" });
    if (data.customerUpdate.customerUserErrors.length) return { error: data.customerUpdate.customerUserErrors[0].message };
    const t = data.customerUpdate.customerAccessToken;
    return t ? { ok: true, token: t.accessToken, expiresAt: t.expiresAt } : { ok: true };
  },
  async createAddress(token, input, makeDefault) {
    const data = await storefront<{ customerAddressCreate: { customerAddress?: { id: string } | null; customerUserErrors: { message: string }[] } }>(Q.ADDRESS_CREATE, { token, address: input }, { cache: "no-store" });
    const r = data.customerAddressCreate;
    if (!r.customerAddress) return { error: r.customerUserErrors[0]?.message ?? "Не удалось сохранить адрес" };
    if (makeDefault) await storefront(Q.DEFAULT_ADDRESS_UPDATE, { token, id: r.customerAddress.id }, { cache: "no-store" }).catch(() => undefined);
    return { ok: true, id: r.customerAddress.id };
  },
  async updateAddress(token, id, input, makeDefault) {
    const data = await storefront<{ customerAddressUpdate: { customerAddress?: { id: string } | null; customerUserErrors: { message: string }[] } }>(Q.ADDRESS_UPDATE, { token, id, address: input }, { cache: "no-store" });
    if (data.customerAddressUpdate.customerUserErrors.length) return { error: data.customerAddressUpdate.customerUserErrors[0].message };
    if (makeDefault) await storefront(Q.DEFAULT_ADDRESS_UPDATE, { token, id }, { cache: "no-store" }).catch(() => undefined);
    return { ok: true };
  },
  async deleteAddress(token, id) {
    const data = await storefront<{ customerAddressDelete: { customerUserErrors: { message: string }[] } }>(Q.ADDRESS_DELETE, { token, id }, { cache: "no-store" });
    if (data.customerAddressDelete.customerUserErrors.length) return { error: data.customerAddressDelete.customerUserErrors[0].message };
    return { ok: true };
  },
  async getCustomerOrders(token): Promise<CustomerOrder[]> {
    const data = await storefront<{ customer: { orders: { nodes: { id: string; orderNumber: number; processedAt: string; financialStatus?: string; fulfillmentStatus?: string; statusUrl?: string; totalPrice: RawMoney; lineItems: { nodes: { title: string; quantity: number; variant?: { title?: string; image?: { url: string } | null } | null }[] } }[] } } | null }>(
      Q.GET_CUSTOMER_ORDERS, { token }, { cache: "no-store" },
    );
    return (data.customer?.orders.nodes ?? []).map((o) => ({
      id: o.id, orderNumber: o.orderNumber, processedAt: o.processedAt, financialStatus: o.financialStatus, fulfillmentStatus: o.fulfillmentStatus, statusUrl: o.statusUrl,
      totalPrice: money(o.totalPrice)!,
      lineItems: o.lineItems.nodes.map((li) => ({ title: li.title, quantity: li.quantity, variantTitle: li.variant?.title, image: li.variant?.image?.url })),
    }));
  },
  async recoverPassword(email) {
    const data = await storefront<{ customerRecover: { customerUserErrors: { message: string }[] } }>(Q.CUSTOMER_RECOVER, { email }, { cache: "no-store" });
    if (data.customerRecover.customerUserErrors.length) return { error: data.customerRecover.customerUserErrors[0].message };
    return { ok: true };
  },
  async logout(token) {
    await storefront(Q.CUSTOMER_ACCESS_TOKEN_DELETE, { customerAccessToken: token }, { cache: "no-store" }).catch(() => undefined);
  },
};
