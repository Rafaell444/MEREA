"use client";
import { useEffect, useRef, useState } from "react";
import Link from "@/components/ui/Link";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import type { PredictiveResult } from "@/lib/catalog/types";
import { formatMoney } from "@/lib/utils";
import { useT, useLocalizedRouter } from "@/lib/i18n/client";
import { useUI } from "@/store/ui";

// i18n: t("Бюстгальтер") t("Пижама") t("Легинсы") t("Бразильяно") t("Носки") t("Купальник")
const POPULAR = ["Бюстгальтер", "Пижама", "Легинсы", "Бразильяно", "Носки", "Купальник"];

export default function SearchDrawer() {
  const { drawer, close } = useUI();
  const open = drawer === "search";
  const [q, setQ] = useState("");
  const [res, setRes] = useState<PredictiveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const router = useLocalizedRouter();
  const t = useT();

  useEffect(() => { if (open) setTimeout(() => ref.current?.focus(), 50); else { setQ(""); setRes(null); } }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); return; }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal });
        setRes(await r.json());
      } catch { /* aborted */ } finally { setLoading(false); }
    }, 250);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [q]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    close();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <Drawer open={open} onClose={close} side="right" hideHeader width="w-full sm:w-[520px]">
      <div className="flex h-full flex-col">
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
          <Search size={20} strokeWidth={1.5} className="shrink-0" />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Что ты ищешь?")} className="h-10 flex-1 bg-transparent text-md placeholder:text-gray-500" aria-label={t("Поиск")} />
          {q && <button type="button" onClick={() => setQ("")} aria-label={t("Очистить")} className="text-gray-500"><X size={16} /></button>}
          <button type="button" onClick={close} aria-label={t("Закрыть")} className="ml-2 transition-transform duration-300 hover:rotate-90"><X size={20} strokeWidth={1.5} /></button>
        </form>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!res && (
            <div>
              <p className="mb-3 text-xsm font-bold uppercase text-gray-500">{t("Популярные запросы")}</p>
              <ul className="flex flex-wrap gap-2">
                {POPULAR.map((p) => (
                  <li key={p}><button onClick={() => setQ(t(p))} className="rounded-full border border-gray-300 px-4 py-2 text-sm transition-colors hover:border-black hover:bg-black hover:text-white">{t(p)}</button></li>
                ))}
              </ul>
            </div>
          )}
          {res && (
            <div className="space-y-6 animate-fade-in">
              {res.queries.length > 0 && (
                <ul className="space-y-2">
                  {res.queries.map((s) => (
                    <li key={s}><button onClick={() => { close(); router.push(`/search?q=${encodeURIComponent(s)}`); }} className="flex items-center gap-2 text-sm hover:underline"><Search size={14} className="text-gray-400" /> {s}</button></li>
                  ))}
                </ul>
              )}
              {res.collections.length > 0 && (
                <div>
                  <p className="mb-2 text-xsm font-bold uppercase text-gray-500">{t("Категории")}</p>
                  <ul className="flex flex-wrap gap-2">
                    {res.collections.map((c) => (
                      <li key={c.handle}><Link href={`/search?q=${encodeURIComponent(c.title)}`} onClick={close} className="rounded-full border border-gray-300 px-3 py-1.5 text-xsm hover:border-black">{c.title}</Link></li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="mb-3 text-xsm font-bold uppercase text-gray-500">{t("Товары")}</p>
                {res.products.length === 0 && !loading && <p className="text-sm text-gray-500">{t("Ничего не найдено. Попробуй другой запрос.")}</p>}
                <ul className="divide-y divide-gray-100">
                  {res.products.map((p) => (
                    <li key={p.id}>
                      <Link href={`/product/${p.handle}`} onClick={close} className="flex items-center gap-4 py-3 group">
                        <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xs bg-off-white">
                          {p.images[0] && <Image src={p.images[0].url} alt={p.title} fill sizes="56px" className="object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm group-hover:underline">{p.title}</p>
                          <p className="text-xsm text-gray-500">{p.colorName}</p>
                          <p className="text-sm font-medium">{formatMoney(p.price)}</p>
                        </div>
                        <ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
                {res.products.length > 0 && (
                  <button onClick={submit} className="btn-outline mt-4 h-10 w-full text-xsm">{t("Показать все результаты")}</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
