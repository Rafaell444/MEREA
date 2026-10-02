import type { Money } from "@/lib/utils";

export type StockStatus = "inStock" | "lowStock" | "outOfStock";

export type ProductImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type SelectedOption = { name: string; value: string };

export type ProductVariant = {
  id: string;
  title: string;
  sku?: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  stockStatus: StockStatus;
  price: Money;
  compareAtPrice?: Money | null;
  selectedOptions: SelectedOption[];
  image?: ProductImage | null;
};

export type ProductOption = { name: string; values: string[] };

/** Another colour of the same model (Shopify: products sharing a `model:` tag or metafield). */
export type ColorSibling = {
  handle: string;
  colorName: string;
  colorCode?: string;
  image?: string;
  hex?: string;
  available: boolean;
};

export type ProductCard = {
  id: string;
  handle: string;
  title: string;
  vendor?: string;
  productType?: string;
  tags: string[];
  images: ProductImage[];
  price: Money;
  compareAtPrice?: Money | null;
  colorName?: string;
  colorsCount: number;
  sizes: { label: string; variantId: string; stockStatus: StockStatus; available: boolean }[];
  badges: string[]; // raw badge labels from tags, mapped via CMS PromoBadge
  isNew?: boolean;
  isSale?: boolean;
};

export type Product = ProductCard & {
  description: string;
  descriptionHtml: string;
  sku?: string;
  options: ProductOption[];
  variants: ProductVariant[];
  colorSiblings: ColorSibling[];
  composition?: string;
  care?: string;
  sizeGuideKey?: string;
  rating?: number;
  reviewCount?: number;
  seo?: { title?: string; description?: string };
  collections: { handle: string; title: string }[];
};

export type FilterValue = { id: string; label: string; count: number; input: string; hex?: string };
export type ProductFilter = { id: string; label: string; type: "LIST" | "PRICE_RANGE"; values: FilterValue[] };

export type SortKey = "RELEVANCE" | "BEST_SELLING" | "CREATED" | "PRICE_ASC" | "PRICE_DESC" | "TITLE";

export type CollectionQuery = {
  first?: number;
  after?: string | null;
  page?: number;
  sort?: SortKey;
  filters?: Record<string, string[]>; // e.g. { color: ["Черный"], size: ["M"], price: ["0-2000"] }
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description?: string;
  image?: ProductImage | null;
  products: ProductCard[];
  totalCount: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null; page: number; pageSize: number };
  filters: ProductFilter[];
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string; // variant id
    title: string; // variant title (size)
    sku?: string;
    product: { id: string; handle: string; title: string; colorName?: string };
    image?: ProductImage | null;
    price: Money;
    compareAtPrice?: Money | null;
    selectedOptions: SelectedOption[];
  };
  cost: { totalAmount: Money; subtotalAmount: Money };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  cost: { subtotalAmount: Money; totalAmount: Money; totalDiscountAmount?: Money | null };
  discountCodes: { code: string; applicable: boolean }[];
};

export type CustomerAddress = {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip?: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
};

export type Customer = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  acceptsMarketing?: boolean;
  addresses?: CustomerAddress[];
  defaultAddressId?: string | null;
  bonusBalance?: number;
  bonusHistory?: { date: string; amount: number; note: string }[];
};

export type CustomerUpdateInput = { firstName?: string; lastName?: string; phone?: string; email?: string; password?: string; acceptsMarketing?: boolean; birthday?: string; gender?: string };
export type AddressInput = Omit<CustomerAddress, "id" | "isDefault">;

export type CustomerOrder = {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  totalPrice: Money;
  subtotalPrice?: Money;
  shippingPrice?: Money;
  statusUrl?: string;
  shippingAddress?: Partial<CustomerAddress>;
  trackingNumber?: string;
  trackingUrl?: string;
  lineItems: { title: string; quantity: number; variantTitle?: string; image?: string; price?: Money; handle?: string }[];
};

export type PredictiveResult = {
  queries: string[];
  products: ProductCard[];
  collections: { handle: string; title: string }[];
};

export interface CatalogProvider {
  readonly name: "shopify" | "mock";
  getProduct(handle: string): Promise<Product | null>;
  getProductsByHandles(handles: string[]): Promise<ProductCard[]>;
  getCollection(handle: string, query?: CollectionQuery): Promise<Collection | null>;
  getRecommendations(productId: string, limit?: number): Promise<ProductCard[]>;
  search(query: string, options?: CollectionQuery): Promise<Collection>;
  predictiveSearch(query: string): Promise<PredictiveResult>;
  listCollections(): Promise<{ handle: string; title: string; productsCount?: number }[]>;
  // Cart
  createCart(lines?: { merchandiseId: string; quantity: number }[]): Promise<Cart>;
  getCart(id: string): Promise<Cart | null>;
  addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<Cart>;
  updateCartLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<Cart>;
  removeCartLines(cartId: string, lineIds: string[]): Promise<Cart>;
  applyDiscount(cartId: string, codes: string[]): Promise<Cart>;
  // Customer
  login(email: string, password: string): Promise<{ token: string; expiresAt: string } | { error: string }>;
  register(input: { email: string; password: string; firstName?: string; lastName?: string; phone?: string; acceptsMarketing?: boolean }): Promise<{ ok: true } | { error: string }>;
  getCustomer(token: string): Promise<Customer | null>;
  getCustomerOrders(token: string): Promise<CustomerOrder[]>;
  getCustomerOrder(token: string, orderId: string): Promise<CustomerOrder | null>;
  updateCustomer(token: string, input: CustomerUpdateInput): Promise<{ ok: true; token?: string; expiresAt?: string } | { error: string }>;
  createAddress(token: string, input: AddressInput, makeDefault?: boolean): Promise<{ ok: true; id: string } | { error: string }>;
  updateAddress(token: string, id: string, input: AddressInput, makeDefault?: boolean): Promise<{ ok: true } | { error: string }>;
  deleteAddress(token: string, id: string): Promise<{ ok: true } | { error: string }>;
  recoverPassword(email: string): Promise<{ ok: true } | { error: string }>;
  logout(token: string): Promise<void>;
}
