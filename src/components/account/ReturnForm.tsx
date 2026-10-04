"use client";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

// i18n: t("Не подошел размер") t("Не понравился цвет/модель") t("Брак или повреждение") t("Пришел другой товар") t("Передумала") t("Другое")
const REASONS = ["Не подошел размер", "Не понравился цвет/модель", "Брак или повреждение", "Пришел другой товар", "Передумала", "Другое"];
type OrderOpt = { orderNumber: string; items: { title: string; quantity: number }[] };
const input = "h-11 w-full border-b border-gray-400 bg-transparent text-sm placeholder:text-gray-500 focus:border-black";

export default function ReturnForm({ email, orders, preselect, returnDays }: { email: string; orders: OrderOpt[]; preselect?: string; returnDays: number }) {
  const t = useT();
  const [mail, setMail] = useState(email);
  const [orderNo, setOrderNo] = useState(preselect ?? orders[0]?.orderNumber ?? "");
  const order = useMemo(() => orders.find((o) => o.orderNumber === orderNo), [orders, orderNo]);
  const [sel, setSel] = useState<Record<number, { on: boolean; qty: number; reason: string }>>({});
  const [manual, setManual] = useState({ title: "", quantity: 1, reason: REASONS[0] });
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const items = order
      ? Object.entries(sel).filter(([, v]) => v.on).map(([i, v]) => ({ title: order.items[Number(i)].title, quantity: v.qty, reason: v.reason }))
      : [{ title: manual.title, quantity: manual.quantity, reason: manual.reason }];
    if (!items.length || items.some((i) => !i.title)) { setState("error"); setMsg(t("Выбери хотя бы один товар")); return; }
    setState("loading");
    try {
      const r = await fetch("/api/returns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: mail, orderNumber: orderNo, items, comment }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setState("done");
    } catch (err) { setState("error"); setMsg(t((err as Error).message)); }
  }

  if (state === "done") {
    return (
      <div className="rounded-sm border border-gray-200 p-6 animate-fade-in">
        <p className="text-sm font-bold">{t("Заявка на возврат принята")}</p>
        <p className="mt-2 text-sm text-gray-900">{t("Мы проверим ее в течение 1–2 рабочих дней и пришлем на {mail} инструкцию: как передать товар курьеру или в магазин. Деньги вернутся на карту в течение 10 дней после получения возврата.", { mail })}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-sm bg-off-white p-4 text-xsm text-gray-900">
        {t("Возврату подлежат товары надлежащего качества с бирками, без следов носки, в течение {n} дней. Нижнее белье, купальники и чулочно-носочные изделия в индивидуальной упаковке возврату не подлежат.", { n: returnDays })}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-xsm text-gray-500">{t("E-mail покупателя")}<input type="email" required value={mail} onChange={(e) => setMail(e.target.value)} className={input} /></label>
        <label className="block text-xsm text-gray-500">{t("Номер заказа")}
          {orders.length ? (
            <select value={orderNo} onChange={(e) => { setOrderNo(e.target.value); setSel({}); }} className={input}>
              {orders.map((o) => <option key={o.orderNumber} value={o.orderNumber}>№{o.orderNumber}</option>)}
              <option value="">{t("Другой заказ…")}</option>
            </select>
          ) : (
            <input required value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder={t("Например, 1001")} className={input} />
          )}
        </label>
      </div>

      {order ? (
        <ul className="divide-y divide-gray-100 rounded-sm border border-gray-200">
          {order.items.map((it, i) => {
            const s = sel[i] ?? { on: false, qty: 1, reason: REASONS[0] };
            return (
              <li key={i} className={cn("p-4 transition-colors", s.on && "bg-off-white/60")}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={s.on} onChange={(e) => setSel({ ...sel, [i]: { ...s, on: e.target.checked } })} className="mt-1 accent-black" />
                  <span className="flex-1 text-sm">{it.title} <span className="text-xsm text-gray-500">× {it.quantity}</span></span>
                </label>
                {s.on && (
                  <div className="mt-3 grid gap-3 pl-7 sm:grid-cols-[120px_1fr]">
                    <label className="text-xsm text-gray-500">{t("Кол-во")}<select value={s.qty} onChange={(e) => setSel({ ...sel, [i]: { ...s, qty: Number(e.target.value) } })} className={input}>{Array.from({ length: it.quantity }, (_, n) => <option key={n} value={n + 1}>{n + 1}</option>)}</select></label>
                    <label className="text-xsm text-gray-500">{t("Причина")}<select value={s.reason} onChange={(e) => setSel({ ...sel, [i]: { ...s, reason: e.target.value } })} className={input}>{REASONS.map((r) => <option key={r} value={r}>{t(r)}</option>)}</select></label>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="grid gap-5 sm:grid-cols-[1fr_100px_1fr]">
          <label className="block text-xsm text-gray-500">{t("Товар")}<input required value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} placeholder={t("Название или артикул")} className={input} /></label>
          <label className="block text-xsm text-gray-500">{t("Кол-во")}<input type="number" min={1} max={20} value={manual.quantity} onChange={(e) => setManual({ ...manual, quantity: Number(e.target.value) })} className={input} /></label>
          <label className="block text-xsm text-gray-500">{t("Причина")}<select value={manual.reason} onChange={(e) => setManual({ ...manual, reason: e.target.value })} className={input}>{REASONS.map((r) => <option key={r} value={r}>{t(r)}</option>)}</select></label>
        </div>
      )}

      <label className="block text-xsm text-gray-500">{t("Комментарий")}<textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="mt-1 w-full border border-gray-300 p-3 text-sm focus:border-black" /></label>
      {state === "error" && <p className="text-xsm text-error">{msg}</p>}
      <button type="submit" disabled={state === "loading"} className="btn-primary h-12 w-full sm:w-auto sm:px-10">{t("Отправить заявку")}</button>
    </form>
  );
}
