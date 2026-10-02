"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Field, ModelDef } from "@/lib/admin/registry";
import { saveRecord, deleteRecord } from "@/lib/admin/actions";
import ImageField from "./ImageField";
import { cn } from "@/lib/utils";

type Props = { model: ModelDef; id: string | null; initial: Record<string, unknown>; fieldOptions: Record<string, { value: string; label: string }[]>; canWrite: boolean };

export const inputCls = "w-full rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-black disabled:bg-off-white disabled:text-gray-500";

export default function RecordForm({ model, id, initial, fieldOptions, canWrite }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (name: string, v: unknown) => setValues((s) => ({ ...s, [name]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await saveRecord(model.key, id, values);
      if (r.ok) {
        setMsg({ ok: true, text: "Сохранено" });
        if (!id) router.push(`/admin/${model.key}/${r.id}`);
        router.refresh();
      } else setMsg({ ok: false, text: r.error });
    });
  }

  return (
    <form onSubmit={submit} className="rounded-sm border border-gray-200 bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {model.fields.map((f) => (
          <div key={f.name} className={cn(f.width === "half" ? "sm:col-span-1" : "sm:col-span-2")}>
            <FieldInput field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} options={fieldOptions[f.name] ?? f.options} disabled={!canWrite} />
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-5">
        {canWrite && <button type="submit" disabled={pending} className="btn-primary h-10 rounded-sm px-6 text-xsm">{pending ? "Сохраняем…" : "Сохранить"}</button>}
        {canWrite && id && (
          <button type="button" onClick={() => { if (confirm("Удалить запись?")) start(async () => { const r = await deleteRecord(model.key, id); if (r.ok) router.push(`/admin/${model.key}`); else setMsg({ ok: false, text: r.error }); }); }} className="h-10 rounded-sm border border-error/40 px-4 text-xsm text-error hover:bg-error/5">Удалить</button>
        )}
        {msg && <span className={cn("text-xsm", msg.ok ? "text-success" : "text-error")}>{msg.text}</span>}
      </div>
    </form>
  );
}

export function FieldInput({ field, value, onChange, options, disabled }: { field: Field; value: unknown; onChange: (v: unknown) => void; options?: { value: string; label: string }[]; disabled?: boolean }) {
  const label = (
    <label className="mb-1 block text-xsm font-medium">
      {field.label}{field.required && <span className="text-error"> *</span>}
      {field.help && <span className="ml-2 font-normal text-gray-500">{field.help}</span>}
    </label>
  );
  const str = value == null ? "" : String(value);
  switch (field.type) {
    case "boolean":
      return (
        <label className="flex items-center gap-3 pt-6 text-sm">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="h-4 w-4 accent-black" /> {field.label}
        </label>
      );
    case "textarea":
      return <div>{label}<textarea value={str} onChange={(e) => onChange(e.target.value)} rows={4} disabled={disabled} className={cn(inputCls, "py-2")} placeholder={field.placeholder} /></div>;
    case "html":
      return (
        <div>{label}
          <textarea value={str} onChange={(e) => onChange(e.target.value)} rows={12} disabled={disabled} className={cn(inputCls, "py-2 font-mono text-xsm")} placeholder="<p>Текст…</p>" />
          {str && <details className="mt-2 text-xsm"><summary className="cursor-pointer text-gray-500">Предпросмотр</summary><div className="prose-cms mt-2 rounded-sm border border-gray-200 p-4" dangerouslySetInnerHTML={{ __html: str }} /></details>}
        </div>
      );
    case "json":
      return <div>{label}<textarea value={str} onChange={(e) => onChange(e.target.value)} rows={8} disabled={disabled} className={cn(inputCls, "py-2 font-mono text-xsm")} placeholder="{}" spellCheck={false} /></div>;
    case "number":
      return <div>{label}<input type="number" step="any" value={str} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={cn(inputCls, "h-10")} /></div>;
    case "select":
    case "parent":
      return (
        <div>{label}
          <select value={str} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={cn(inputCls, "h-10")}>
            {(field.type === "parent" || !field.required) && <option value="">— {field.type === "parent" ? "верхний уровень" : "не выбрано"} —</option>}
            {(options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );
    case "color":
      return (
        <div>{label}
          <div className="flex items-center gap-2">
            <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(str) ? str : "#000000"} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="h-10 w-12 cursor-pointer rounded-sm border border-gray-300 bg-white p-1" />
            <input value={str} onChange={(e) => onChange(e.target.value)} placeholder="#000000" disabled={disabled} className={cn(inputCls, "h-10 font-mono")} />
          </div>
        </div>
      );
    case "image":
      return <div>{label}<ImageField value={str} onChange={onChange} disabled={disabled} /></div>;
    case "date":
      return <div>{label}<input type="datetime-local" value={str ? str.slice(0, 16) : ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={cn(inputCls, "h-10")} /></div>;
    case "password":
      return <div>{label}<input type="password" autoComplete="new-password" value={str} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={cn(inputCls, "h-10")} /></div>;
    case "readonly":
      return <div>{label}<div className="min-h-10 whitespace-pre-wrap rounded-sm bg-off-white px-3 py-2 text-sm">{str || "—"}</div></div>;
    default:
      return <div>{label}<input value={str} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} disabled={disabled} className={cn(inputCls, "h-10")} /></div>;
  }
}
