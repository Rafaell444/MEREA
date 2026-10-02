import "server-only";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { AddressInput, CatalogProvider, Customer, CustomerAddress, CustomerOrder } from "./types";
import { MODELS, mockImage } from "./mock-data";

/* Demo customer accounts persisted in SQLite (DemoCustomer). Tokens are stateless HMAC tokens: "<id>.<sig>". */

function secret() {
  return process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32 ? process.env.AUTH_SECRET : "dev-only-insecure-secret-change-me-please-32chars";
}
function sign(id: string) {
  return crypto.createHmac("sha256", secret()).update(`demo-customer:${id}`).digest("base64url");
}
function makeToken(id: string) {
  return `${id}.${sign(id)}`;
}
function idFromToken(token: string): string | null {
  const [id, sig] = token.split(".");
  if (!id || !sig) return null;
  const expected = sign(id);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return id;
}

type Row = NonNullable<Awaited<ReturnType<typeof db.demoCustomer.findUnique>>>;

function parse<T>(s: string, fb: T): T {
  try { return JSON.parse(s) as T; } catch { return fb; }
}

function toCustomer(r: Row): Customer {
  const addresses = parse<CustomerAddress[]>(r.addresses, []);
  return {
    id: r.id, email: r.email, firstName: r.firstName ?? undefined, lastName: r.lastName ?? undefined, phone: r.phone ?? undefined,
    birthday: r.birthday ?? undefined, gender: r.gender ?? undefined, acceptsMarketing: r.acceptsMarketing,
    addresses, defaultAddressId: addresses.find((a) => a.isDefault)?.id ?? null,
    bonusBalance: r.bonusBalance, bonusHistory: parse(r.bonusHistory, []),
  };
}

async function byToken(token: string) {
  const id = idFromToken(token);
  if (!id) return null;
  return db.demoCustomer.findUnique({ where: { id } });
}

/** Two realistic demo orders so the account area has content right after registration. */
function demoOrders(firstName?: string, lastName?: string): CustomerOrder[] {
  const pick = (sku: string, color: string, size: string, qty = 1) => {
    const m = MODELS.find((x) => x.sku === sku)!;
    return { title: m.title, quantity: qty, variantTitle: size, image: mockImage(m.sku, color, "M"), price: { amount: m.price, currencyCode: "RUB" }, handle: `${m.slug}-${m.sku}-${color.toLowerCase()}` };
  };
  const addr = { firstName, lastName, address1: "ул. Тверская, 12, кв. 34", city: "Москва", zip: "125009", country: "Россия", phone: "+7 900 000-00-00" };
  const o1 = [pick("1TI010V", "1905", "75C"), pick("1SB01V", "1905", "M", 2)];
  const o2 = [pick("1WP1569", "581Z", "M"), pick("1ML1569", "581Z", "M")];
  const sum = (l: ReturnType<typeof pick>[]) => l.reduce((s, x) => s + x.price.amount * x.quantity, 0);
  const day = 86400000;
  return [
    { id: "demo-1002", orderNumber: 1002, processedAt: new Date(Date.now() - 3 * day).toISOString(), financialStatus: "PAID", fulfillmentStatus: "UNFULFILLED", totalPrice: { amount: sum(o2), currencyCode: "RUB" }, subtotalPrice: { amount: sum(o2), currencyCode: "RUB" }, shippingPrice: { amount: 0, currencyCode: "RUB" }, shippingAddress: addr, trackingNumber: "RU123456789", lineItems: o2 },
    { id: "demo-1001", orderNumber: 1001, processedAt: new Date(Date.now() - 40 * day).toISOString(), financialStatus: "PAID", fulfillmentStatus: "FULFILLED", totalPrice: { amount: sum(o1) + 299, currencyCode: "RUB" }, subtotalPrice: { amount: sum(o1), currencyCode: "RUB" }, shippingPrice: { amount: 299, currencyCode: "RUB" }, shippingAddress: addr, trackingNumber: "RU987654321", lineItems: o1 },
  ];
}

export const mockCustomers: Pick<CatalogProvider, "login" | "register" | "getCustomer" | "getCustomerOrders" | "getCustomerOrder" | "updateCustomer" | "createAddress" | "updateAddress" | "deleteAddress" | "recoverPassword" | "logout"> = {
  async login(email, password) {
    const r = await db.demoCustomer.findUnique({ where: { email: email.toLowerCase() } });
    const ok = r ? await bcrypt.compare(password, r.passwordHash) : false;
    if (!r || !ok) return { error: "Неверный e-mail или пароль" };
    return { token: makeToken(r.id), expiresAt: new Date(Date.now() + 14 * 86400000).toISOString() };
  },
  async register(input) {
    const email = input.email.toLowerCase();
    if (await db.demoCustomer.findUnique({ where: { email } })) return { error: "Пользователь с таким e-mail уже зарегистрирован" };
    const orders = demoOrders(input.firstName, input.lastName);
    await db.demoCustomer.create({
      data: {
        email, passwordHash: await bcrypt.hash(input.password, 10), firstName: input.firstName, lastName: input.lastName, phone: input.phone, acceptsMarketing: input.acceptsMarketing ?? true,
        orders: JSON.stringify(orders),
        bonusBalance: 450,
        bonusHistory: JSON.stringify([
          { date: new Date().toISOString(), amount: 300, note: "Приветственные бонусы за регистрацию" },
          { date: orders[1].processedAt, amount: 150, note: `Начисление за заказ №${orders[1].orderNumber}` },
        ]),
      },
    });
    return { ok: true };
  },
  async getCustomer(token) {
    const r = await byToken(token);
    return r ? toCustomer(r) : null;
  },
  async getCustomerOrders(token) {
    const r = await byToken(token);
    return r ? parse<CustomerOrder[]>(r.orders, []) : [];
  },
  async getCustomerOrder(token, orderId) {
    const r = await byToken(token);
    return r ? parse<CustomerOrder[]>(r.orders, []).find((o) => o.id === orderId || String(o.orderNumber) === orderId) ?? null : null;
  },
  async updateCustomer(token, input) {
    const r = await byToken(token);
    if (!r) return { error: "Сессия истекла" };
    const data: Record<string, unknown> = {};
    for (const k of ["firstName", "lastName", "phone", "birthday", "gender", "acceptsMarketing"] as const) if (input[k] !== undefined) data[k] = input[k];
    if (input.email && input.email.toLowerCase() !== r.email) {
      if (await db.demoCustomer.findUnique({ where: { email: input.email.toLowerCase() } })) return { error: "E-mail уже используется" };
      data.email = input.email.toLowerCase();
    }
    if (input.password) data.passwordHash = await bcrypt.hash(input.password, 10);
    await db.demoCustomer.update({ where: { id: r.id }, data });
    return { ok: true };
  },
  async createAddress(token, input, makeDefault) {
    const r = await byToken(token);
    if (!r) return { error: "Сессия истекла" };
    const list = parse<CustomerAddress[]>(r.addresses, []);
    const id = `addr_${crypto.randomBytes(5).toString("hex")}`;
    const isDefault = makeDefault || list.length === 0;
    if (isDefault) list.forEach((a) => (a.isDefault = false));
    list.push({ ...input, id, isDefault });
    await db.demoCustomer.update({ where: { id: r.id }, data: { addresses: JSON.stringify(list) } });
    return { ok: true, id };
  },
  async updateAddress(token, id, input, makeDefault) {
    const r = await byToken(token);
    if (!r) return { error: "Сессия истекла" };
    const list = parse<CustomerAddress[]>(r.addresses, []);
    const idx = list.findIndex((a) => a.id === id);
    if (idx < 0) return { error: "Адрес не найден" };
    if (makeDefault) list.forEach((a) => (a.isDefault = false));
    list[idx] = { ...list[idx], ...input, id, isDefault: makeDefault || list[idx].isDefault };
    await db.demoCustomer.update({ where: { id: r.id }, data: { addresses: JSON.stringify(list) } });
    return { ok: true };
  },
  async deleteAddress(token, id) {
    const r = await byToken(token);
    if (!r) return { error: "Сессия истекла" };
    let list = parse<CustomerAddress[]>(r.addresses, []).filter((a) => a.id !== id);
    if (list.length && !list.some((a) => a.isDefault)) list = list.map((a, i) => ({ ...a, isDefault: i === 0 }));
    await db.demoCustomer.update({ where: { id: r.id }, data: { addresses: JSON.stringify(list) } });
    return { ok: true };
  },
  async recoverPassword() {
    return { ok: true };
  },
  async logout() {
    /* stateless tokens: nothing to revoke */
  },
};
