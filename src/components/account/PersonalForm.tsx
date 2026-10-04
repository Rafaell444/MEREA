"use client";
import { useState } from "react";
import { useT, useLocalizedRouter } from "@/lib/i18n/client";
import type { Customer } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const input = "h-11 w-full border-b border-gray-400 bg-transparent text-sm placeholder:text-gray-500 focus:border-black transition-colors";
const label = "block text-xsm text-gray-500";

// i18n: t("Ошибка")
async function patch(body: Record<string, unknown>) {
  const r = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? "Ошибка");
}

export default function PersonalForm({ customer }: { customer: Customer }) {
  const router = useLocalizedRouter();
  const t = useT();
  const [form, setForm] = useState({ firstName: customer.firstName ?? "", lastName: customer.lastName ?? "", email: customer.email, phone: customer.phone ?? "", birthday: customer.birthday ?? "", gender: customer.gender ?? "" });
  const [pw, setPw] = useState({ currentPassword: "", password: "", confirm: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try { await patch(form); setMsg({ ok: true, text: t("Данные сохранены") }); router.refresh(); } catch (err) { setMsg({ ok: false, text: t((err as Error).message) }); } finally { setBusy(false); }
  }
  async function savePassword(e: React.FormEvent) {
    e.preventDefault(); setPwMsg(null);
    if (pw.password !== pw.confirm) { setPwMsg({ ok: false, text: t("Пароли не совпадают") }); return; }
    setBusy(true);
    try { await patch({ currentPassword: pw.currentPassword, password: pw.password }); setPwMsg({ ok: true, text: t("Пароль изменен") }); setPw({ currentPassword: "", password: "", confirm: "" }); } catch (err) { setPwMsg({ ok: false, text: t((err as Error).message) }); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={saveProfile} className="rounded-sm border border-gray-200 p-5 sm:p-6">
        <h2 className="mb-5 text-sm font-bold">{t("Профиль")}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={label}>{t("Имя")}<input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={input} autoComplete="given-name" /></label>
          <label className={label}>{t("Фамилия")}<input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={input} autoComplete="family-name" /></label>
          <label className={label}>E-mail<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} autoComplete="email" /></label>
          <label className={label}>{t("Телефон")}<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+995 5__ __ __ __" className={input} autoComplete="tel" /></label>
          <label className={label}>{t("Дата рождения")} <span className="text-[10px]">{t("(подарок в день рождения)")}</span><input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} className={input} /></label>
          <label className={label}>{t("Пол")}
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={input}>
              <option value="">{t("Не указан")}</option><option value="female">{t("Женский")}</option><option value="male">{t("Мужской")}</option><option value="other">{t("Другое")}</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className="btn-primary h-11 px-8 text-xsm">{t("Сохранить")}</button>
          {msg && <span className={cn("text-xsm", msg.ok ? "text-success" : "text-error")}>{msg.text}</span>}
        </div>
      </form>

      <form onSubmit={savePassword} className="rounded-sm border border-gray-200 p-5 sm:p-6">
        <h2 className="mb-5 text-sm font-bold">{t("Изменить пароль")}</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <label className={label}>{t("Текущий пароль")}<input type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} className={input} autoComplete="current-password" /></label>
          <label className={label}>{t("Новый пароль")}<input type="password" required minLength={8} value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} className={input} autoComplete="new-password" /></label>
          <label className={label}>{t("Повтори пароль")}<input type="password" required minLength={8} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={input} autoComplete="new-password" /></label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className="btn-outline h-11 px-8 text-xsm">{t("Обновить пароль")}</button>
          {pwMsg && <span className={cn("text-xsm", pwMsg.ok ? "text-success" : "text-error")}>{pwMsg.text}</span>}
        </div>
      </form>

      <MarketingToggle initial={customer.acceptsMarketing ?? false} />
      <DeleteAccount email={customer.email} />
    </div>
  );
}

function MarketingToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [msg, setMsg] = useState("");
  const t = useT();
  async function toggle() {
    const next = !on; setOn(next); setMsg("");
    try { await patch({ acceptsMarketing: next }); setMsg(t("Сохранено")); } catch (e) { setOn(!next); setMsg(t((e as Error).message)); }
  }
  return (
    <div className="rounded-sm border border-gray-200 p-5 sm:p-6">
      <h2 className="mb-3 text-sm font-bold">{t("Рассылки")}</h2>
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <button type="button" role="switch" aria-checked={on} onClick={toggle} className={cn("relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-black" : "bg-gray-300")}>
          <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", on ? "left-[18px]" : "left-0.5")} />
        </button>
        <span>{t("Получать новости, акции и персональные предложения на e-mail")}{msg && <span className="ml-2 text-xsm text-gray-500">{msg}</span>}</span>
      </label>
    </div>
  );
}

function DeleteAccount({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const t = useT();
  async function request() {
    if (!confirm(t("Отправить запрос на удаление аккаунта? Мы удалим данные в течение 30 дней."))) return;
    await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Удаление аккаунта", email, topic: "Удаление аккаунта", message: `Прошу удалить мой аккаунт ${email} и персональные данные.` }) });
    setSent(true);
  }
  return (
    <div className="rounded-sm border border-gray-200 p-5 sm:p-6">
      <h2 className="mb-2 text-sm font-bold">{t("Удаление аккаунта")}</h2>
      <p className="text-xsm text-gray-500">{t("Запрос обрабатывается службой поддержки согласно политике конфиденциальности.")}</p>
      {sent ? <p className="mt-3 text-xsm text-success">{t("Запрос отправлен. Мы свяжемся с тобой по e-mail.")}</p> : <button onClick={request} className="mt-3 text-xsm text-error underline underline-offset-4">{t("Запросить удаление аккаунта")}</button>}
    </div>
  );
}
