"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Trash2, Search } from "lucide-react";
import type { ModelDef } from "@/lib/admin/registry";
import { deleteRecord, moveRecord, toggleRecord } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

type Row = Record<string, unknown> & { id: string; __depth?: number };

function cell(v: unknown): string {
  if (v == null || v === "") return "—";
  if (typeof v === "boolean") return v ? "Да" : "Нет";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
  const s = String(v);
  return s.length > 70 ? s.slice(0, 70) + "…" : s;
}

export default function RecordList({ model, rows, total, q, filter, canWrite, extra }: { model: ModelDef; rows: Row[]; total: number; q: string; filter: string; canWrite: boolean; extra: Record<string, Record<string, string>> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [query, setQuery] = useState(q);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Ошибка");
      else { setError(""); router.refresh(); }
    });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {model.search && (
          <form onSubmit={(e) => { e.preventDefault(); router.push(`/admin/${model.key}?q=${encodeURIComponent(query)}${filter ? `&filter=${filter}` : ""}`); }} className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск…" className="h-9 w-64 rounded-sm border border-gray-300 bg-white pl-8 pr-3 text-xsm focus:border-black" />
          </form>
        )}
        {model.filterField && (
          <div className="flex gap-1">
            <Link href={`/admin/${model.key}`} className={cn("rounded-sm border px-3 py-1.5 text-xsm", !filter ? "border-black bg-black text-white" : "border-gray-300 bg-white")}>Все</Link>
            {model.filterField.options?.map((o) => (
              <Link key={o.value} href={`/admin/${model.key}?filter=${o.value}`} className={cn("rounded-sm border px-3 py-1.5 text-xsm", filter === o.value ? "border-black bg-black text-white" : "border-gray-300 bg-white")}>{o.label}</Link>
            ))}
          </div>
        )}
        <span className="ml-auto text-xsm text-gray-500">{total} записей</span>
      </div>
      {error && <p className="mb-3 rounded-sm bg-error/10 px-3 py-2 text-xsm text-error">{error}</p>}

      <div className={cn("overflow-x-auto rounded-sm border border-gray-200 bg-white", pending && "opacity-60")}>
        <table className="w-full text-left text-xsm">
          <thead className="bg-off-white text-[10px] uppercase tracking-wider text-gray-500">
            <tr>
              {model.toggle && <th className="px-3 py-2 w-16">Вкл</th>}
              {model.listColumns.map((c) => <th key={c} className="px-3 py-2">{model.fields.find((f) => f.name === c)?.label ?? c}</th>)}
              <th className="px-3 py-2 w-40 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 hover:bg-off-white/60">
                {model.toggle && (
                  <td className="px-3 py-2">
                    <button
                      disabled={!canWrite}
                      onClick={() => run(() => toggleRecord(model.key, r.id, model.toggle!, !r[model.toggle!]))}
                      className={cn("relative h-5 w-9 rounded-full transition-colors", r[model.toggle] ? "bg-success" : "bg-gray-300")}
                      aria-label="Переключить"
                    >
                      <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", r[model.toggle] ? "left-[18px]" : "left-0.5")} />
                    </button>
                  </td>
                )}
                {model.listColumns.map((c, i) => (
                  <td key={c} className={cn("px-3 py-2 align-top", i === 0 && "font-medium")} style={i === 0 && r.__depth ? { paddingLeft: `${12 + r.__depth * 18}px` } : undefined}>
                    {i === 0 && r.__depth ? <span className="mr-1 text-gray-400">↳</span> : null}
                    {c === "url" && typeof r[c] === "string" && /\.(jpe?g|png|webp|gif|svg)$/i.test(r[c] as string) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <span className="flex items-center gap-2"><img src={r[c] as string} alt="" className="h-10 w-10 rounded-xs object-cover" /><code className="text-[10px]">{r[c] as string}</code></span>
                    ) : extra[c] ? extra[c][String(r[c])] ?? cell(r[c]) : cell(r[c])}
                  </td>
                ))}
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    {model.orderable && canWrite && (
                      <>
                        <button onClick={() => run(() => moveRecord(model.key, r.id, "up"))} className="rounded-sm p-1.5 hover:bg-gray-200" aria-label="Выше"><ArrowUp size={14} /></button>
                        <button onClick={() => run(() => moveRecord(model.key, r.id, "down"))} className="rounded-sm p-1.5 hover:bg-gray-200" aria-label="Ниже"><ArrowDown size={14} /></button>
                      </>
                    )}
                    <Link href={`/admin/${model.key}/${r.id}`} className="rounded-sm p-1.5 hover:bg-gray-200" aria-label="Редактировать"><Pencil size={14} /></Link>
                    {canWrite && (
                      <button onClick={() => { if (confirm("Удалить запись?")) run(() => deleteRecord(model.key, r.id)); }} className="rounded-sm p-1.5 text-error hover:bg-error/10" aria-label="Удалить"><Trash2 size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={model.listColumns.length + 2} className="px-3 py-6 text-center text-gray-500">Пока нет записей</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
