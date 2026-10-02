"use client";
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ImageField({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function upload(file: File) {
    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Ошибка загрузки");
      onChange(j.url);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <div className="flex gap-3">
      <div className={cn("relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-dashed border-gray-300 bg-off-white", busy && "animate-pulse")}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <Upload size={18} className="text-gray-400" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… или /uploads/…" disabled={disabled} className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-black" />
        <div className="flex items-center gap-2">
          <input ref={ref} type="file" accept="image/*,video/mp4" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <button type="button" disabled={disabled || busy} onClick={() => ref.current?.click()} className="rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xsm hover:border-black disabled:opacity-50">{busy ? "Загружаем…" : "Загрузить файл"}</button>
          {value && <button type="button" disabled={disabled} onClick={() => onChange("")} className="flex items-center gap-1 text-xsm text-gray-500 hover:text-error"><X size={12} /> Очистить</button>}
        </div>
        {err && <p className="text-xsm text-error">{err}</p>}
      </div>
    </div>
  );
}
