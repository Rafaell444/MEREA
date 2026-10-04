"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/lib/admin/actions";
import type { Field } from "@/lib/admin/registry";
import { FieldInput } from "./RecordForm";
import { cn } from "@/lib/utils";

const SECTIONS: { title: string; fields: Field[] }[] = [
  {
    title: "Бренд",
    fields: [
      { name: "siteName", label: "Название сайта", type: "text", width: "half" },
      { name: "tagline", label: "Слоган", type: "text", width: "half" },
      { name: "logo", label: "Логотип (пусто = текстовый логотип MEREY)", type: "image" },
      { name: "headerTransparentOnHome", label: "Прозрачная шапка на главной (поверх баннера)", type: "boolean" },
      { name: "showGirlsMenu", label: "Показывать раздел «Девочкам»", type: "boolean" },
    ],
  },
  {
    title: "Контакты и регион",
    fields: [
      { name: "supportPhone", label: "Телефон поддержки", type: "text", width: "half" },
      { name: "supportEmail", label: "E-mail поддержки", type: "text", width: "half" },
      { name: "region", label: "Регион / валюта (футер)", type: "text", width: "half" },
      { name: "language", label: "Язык (футер)", type: "text", width: "half" },
      { name: "legalEntity", label: "Юридическая информация (футер)", type: "textarea" },
      { name: "socials", label: "Соцсети (JSON: [{name, href, icon: vk|telegram|youtube|instagram}])", type: "json" },
    ],
  },
  {
    title: "Корзина и доставка",
    fields: [
      { name: "freeShippingFrom", label: "Бесплатная доставка от, ₽", type: "number", width: "half" },
      { name: "returnDays", label: "Срок возврата, дней", type: "number", width: "half" },
      { name: "cartNotice", label: "Примечание в корзине", type: "text" },
    ],
  },
  {
    title: "Тексты футера",
    fields: [
      { name: "newsletterTitle", label: "Заголовок подписки", type: "text" },
      { name: "storeFinderTitle", label: "Заголовок поиска магазина", type: "text", width: "half" },
      { name: "storeFinderPlaceholder", label: "Подсказка в поле поиска магазина", type: "text", width: "half" },
    ],
  },
  {
    title: "SEO и аналитика",
    fields: [
      { name: "seoTitle", label: "Title главной страницы", type: "text" },
      { name: "seoDescription", label: "Description главной страницы", type: "textarea" },
      { name: "yandexMetrikaId", label: "ID счетчика Яндекс.Метрики", type: "text", width: "half" },
    ],
  },
];

export default function SettingsForm({ initial }: { initial: Record<string, unknown> }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const v = { ...initial };
    if (typeof v.socials !== "string") v.socials = JSON.stringify(v.socials ?? [], null, 2);
    return v;
  });
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const out: Record<string, unknown> = {};
      for (const s of SECTIONS) for (const f of s.fields) {
        const raw = values[f.name];
        if (f.type === "number") out[f.name] = Number(raw) || 0;
        else if (f.type === "boolean") out[f.name] = Boolean(raw);
        else if (f.type === "json") { try { out[f.name] = JSON.parse(String(raw || "[]")); } catch { setMsg({ ok: false, text: `«${f.label}»: некорректный JSON` }); return; } }
        else out[f.name] = raw ?? "";
      }
      const r = await saveSettings(out);
      setMsg(r.ok ? { ok: true, text: "Настройки сохранены" } : { ok: false, text: r.error });
      if (r.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {SECTIONS.map((s) => (
        <section key={s.title} className="rounded-sm border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-500">{s.title}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {s.fields.map((f) => (
              <div key={f.name} className={cn(f.width === "half" ? "sm:col-span-1" : "sm:col-span-2")}>
                <FieldInput field={f} value={values[f.name]} onChange={(v) => setValues((st) => ({ ...st, [f.name]: v }))} options={f.options} />
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary h-10 rounded-sm px-6 text-xsm">{pending ? "Сохраняем…" : "Сохранить настройки"}</button>
        {msg && <span className={cn("text-xsm", msg.ok ? "text-success" : "text-error")}>{msg.text}</span>}
      </div>
    </form>
  );
}
