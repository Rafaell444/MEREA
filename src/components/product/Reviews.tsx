"use client";
import { useState } from "react";
import Stars from "@/components/ui/Stars";
import { cn } from "@/lib/utils";
import { useT, useLocale } from "@/lib/i18n/client";

export type ReviewItem = { id: string; author: string; rating: number; title?: string | null; body: string; createdAt: string | Date };

export default function Reviews({ productHandle, reviews, rating }: { productHandle: string; reviews: ReviewItem[]; rating: number }) {
  const t = useT();
  const locale = useLocale();
  const dateFmt = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : locale === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ author: "", rating: 5, title: "", body: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const r = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, productHandle }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? t("Ошибка"));
      setState("done"); setMsg(j.message);
    } catch (err) { setState("error"); setMsg((err as Error).message); }
  }

  return (
    <section id="reviewsSection" className="scroll-mt-24 px-4 py-10 sm:px-10">
      <h2 className="text-xl font-bold">{t("Оценка и отзывы")}</h2>
      {reviews.length > 0 ? (
        <p className="mt-2 flex items-center gap-2 text-sm">
          <Stars value={rating} size={14} /> {t("{rating} из 5 звезд (оценок: {n})", { rating: locale === "en" ? rating.toFixed(1) : rating.toFixed(1).replace(".", ","), n: reviews.length })}
        </p>
      ) : (
        <p className="mt-2 text-sm text-gray-500">{t("Отзывов пока нет — будь первой!")}</p>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <article key={r.id} className="rounded-sm border border-gray-200 p-5">
            <Stars value={r.rating} size={12} />
            {r.title && <p className="mt-2 text-sm font-bold">{r.title}</p>}
            <p className="mt-2 text-sm leading-6 text-gray-900">{r.body}</p>
            <p className="mt-3 text-xsm text-gray-500">{r.author} · {dateFmt.format(new Date(r.createdAt))}</p>
          </article>
        ))}
      </div>

      <div className="mt-6">
        {state === "done" ? (
          <p className="text-sm">{msg}</p>
        ) : (
          <>
            <button onClick={() => setShowForm((v) => !v)} className="btn-outline h-10 px-6 text-xsm">{t("Оставить отзыв")}</button>
            {showForm && (
              <form onSubmit={submit} className="mt-4 max-w-lg space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-sm">
                  {t("Оценка:")}
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setForm((f) => ({ ...f, rating: n }))} className={cn("h-8 w-8 rounded-full border text-xsm", n <= form.rating ? "border-black bg-black text-white" : "border-gray-300")}>{n}</button>
                  ))}
                </div>
                <input required maxLength={60} placeholder={t("Имя")} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="h-10 w-full border-b border-gray-400 text-sm focus:border-black" />
                <input maxLength={120} placeholder={t("Заголовок")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-10 w-full border-b border-gray-400 text-sm focus:border-black" />
                <textarea required minLength={5} maxLength={2000} rows={4} placeholder={t("Отзыв")} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full border border-gray-300 p-3 text-sm focus:border-black" />
                {state === "error" && <p className="text-xsm text-error">{msg}</p>}
                <button type="submit" disabled={state === "loading"} className="btn-primary h-10 px-6 text-xsm">{t("Отправить")}</button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
}
