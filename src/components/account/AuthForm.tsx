"use client";
import { useState } from "react";
import Link from "@/components/ui/Link";
import { useT, useLocalizedRouter } from "@/lib/i18n/client";
import { Eye, EyeOff } from "lucide-react";

export default function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const router = useLocalizedRouter();
  const t = useT();
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", phone: "", acceptsMarketing: true, agree: false });
  const [show, setShow] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "error" | "recover" | "recovered">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "register" && !form.agree) { setState("error"); setMsg(t("Необходимо принять условия использования сайта")); return; }
    setState("loading");
    try {
      const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      router.push(next && next.startsWith("/") ? next : "/myprofile");
      router.refresh();
    } catch (err) { setState("error"); setMsg(t((err as Error).message)); }
  }

  async function recover(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/auth/recover", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email }) });
    const j = await r.json();
    setMsg(t(j.message ?? j.error ?? "")); setState("recovered");
  }

  // Sentence with two inline links: translators keep the <a>…</a> / <b>…</b> markers.
  const agreeParts = t("Принимаю <a>условия использования сайта</a> и <b>политику конфиденциальности</b>").split(/<\/?[ab]>/);

  const input = "h-11 w-full border-b border-gray-400 bg-transparent text-sm placeholder:text-gray-500 focus:border-black transition-colors";

  if (state === "recover" || state === "recovered") {
    return (
      <form onSubmit={recover} className="mt-8 space-y-4">
        <p className="text-sm">{t("Введи e-mail — пришлем ссылку для восстановления пароля.")}</p>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t("Электронная почта")} className={input} />
        {state === "recovered" && <p className="text-sm">{msg}</p>}
        <button type="submit" className="btn-primary w-full">{t("Восстановить")}</button>
        <button type="button" onClick={() => setState("idle")} className="w-full text-center text-xsm underline underline-offset-4">{t("Назад ко входу")}</button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      {mode === "register" && (
        <div className="grid grid-cols-2 gap-4">
          <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder={t("Имя")} className={input} autoComplete="given-name" />
          <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder={t("Фамилия")} className={input} autoComplete="family-name" />
        </div>
      )}
      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t("Электронная почта")} className={input} autoComplete="email" />
      {mode === "register" && <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t("Телефон")} className={input} autoComplete="tel" />}
      <div className="relative">
        <input type={show ? "text" : "password"} required minLength={mode === "register" ? 8 : 1} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={mode === "register" ? t("Пароль (минимум 8 символов)") : t("Пароль")} className={`${input} pr-10`} autoComplete={mode === "register" ? "new-password" : "current-password"} />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={t("Показать пароль")} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
      </div>
      {mode === "register" && (
        <div className="space-y-2 text-xsm text-gray-500">
          <label className="flex items-start gap-2"><input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} className="mt-0.5 accent-black" /><span>{agreeParts[0]}<Link href="/policy/terms" className="underline" target="_blank">{agreeParts[1]}</Link>{agreeParts[2]}<Link href="/policy/privacy-policy" className="underline" target="_blank">{agreeParts[3]}</Link>{agreeParts[4]}</span></label>
          <label className="flex items-start gap-2"><input type="checkbox" checked={form.acceptsMarketing} onChange={(e) => setForm({ ...form, acceptsMarketing: e.target.checked })} className="mt-0.5 accent-black" /><span>{t("Хочу получать новости и персональные предложения")}</span></label>
        </div>
      )}
      {state === "error" && <p className="text-xsm text-error animate-fade-in">{msg}</p>}
      <button type="submit" disabled={state === "loading"} className="btn-primary w-full">{mode === "login" ? t("Войти") : t("Зарегистрироваться")}</button>
      {mode === "login" && <button type="button" onClick={() => setState("recover")} className="w-full text-center text-xsm underline underline-offset-4">{t("Забыли пароль?")}</button>}
    </form>
  );
}
