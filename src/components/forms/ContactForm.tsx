"use client";
import { useState } from "react";
import { useT } from "@/lib/i18n/client";

// i18n: t("Заказ") t("Доставка") t("Возврат") t("Оплата") t("Товар") t("Программа лояльности") t("Другое")
const TOPICS = ["Заказ", "Доставка", "Возврат", "Оплата", "Товар", "Программа лояльности", "Другое"];

export default function ContactForm() {
  const t = useT();
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: TOPICS[0], orderNo: "", message: "", website: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const input = "h-11 w-full border-b border-gray-400 bg-transparent text-sm placeholder:text-gray-500 focus:border-black";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? t("Ошибка"));
      setState("done");
    } catch (err) { setState("error"); setMsg((err as Error).message); }
  }

  if (state === "done") return <p className="mt-8 rounded-sm bg-off-white p-5 text-sm animate-fade-in">{t("Спасибо! Сообщение отправлено, мы скоро ответим на {email}.", { email: form.email })}</p>;

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("Имя")} className={input} />
        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t("Электронная почта")} className={input} />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t("Телефон")} className={input} />
        <input value={form.orderNo} onChange={(e) => setForm({ ...form, orderNo: e.target.value })} placeholder={t("Номер заказа (если есть)")} className={input} />
      </div>
      <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={input}>
        {TOPICS.map((topic) => <option key={topic} value={topic}>{t(topic)}</option>)}
      </select>
      <textarea required minLength={5} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t("Сообщение")} className="w-full border border-gray-300 p-3 text-sm focus:border-black" />
      <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" aria-hidden />
      {state === "error" && <p className="text-xsm text-error">{t(msg)}</p>}
      <button type="submit" disabled={state === "loading"} className="btn-primary h-12 px-10">{t("Отправить")}</button>
    </form>
  );
}
