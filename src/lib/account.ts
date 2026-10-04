import "server-only";
import { redirect } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import type { Customer } from "@/lib/catalog/types";
import { getCustomerToken } from "@/lib/auth/session";
import { localized } from "@/lib/i18n/server";

/** Loads the logged-in customer or redirects to the login page (keeping the return path). */
export async function requireCustomer(next: string): Promise<{ customer: Customer; token: string }> {
  const token = await getCustomerToken();
  if (!token) redirect(await localized(`/myprofile?next=${encodeURIComponent(next)}`));
  const catalog = await getCatalog();
  const customer = await catalog.getCustomer(token).catch(() => null);
  if (!customer) redirect(await localized(`/myprofile?next=${encodeURIComponent(next)}`));
  return { customer, token };
}

export async function optionalCustomer(): Promise<Customer | null> {
  const token = await getCustomerToken();
  if (!token) return null;
  const catalog = await getCatalog();
  return catalog.getCustomer(token).catch(() => null);
}

// i18n: t("Оплачен") t("Ожидает оплаты") t("Возврат выполнен") t("Частичный возврат") t("Отменен") t("Доставлен") t("Собирается") t("Частично отправлен") t("В пути") t("В обработке")
export const ORDER_STATUS: Record<string, string> = {
  PAID: "Оплачен", PENDING: "Ожидает оплаты", REFUNDED: "Возврат выполнен", PARTIALLY_REFUNDED: "Частичный возврат", VOIDED: "Отменен",
  FULFILLED: "Доставлен", UNFULFILLED: "Собирается", PARTIALLY_FULFILLED: "Частично отправлен", IN_PROGRESS: "В пути",
};
/** Returns the Russian source string — callers wrap it: `t(orderStatus(o))`. */
export function orderStatus(o: { fulfillmentStatus?: string; financialStatus?: string }) {
  return ORDER_STATUS[o.fulfillmentStatus ?? ""] ?? ORDER_STATUS[o.financialStatus ?? ""] ?? "В обработке";
}
