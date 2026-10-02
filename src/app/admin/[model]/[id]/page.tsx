import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/session";
import { MODEL_BY_KEY, roleCan } from "@/lib/admin/registry";
import RecordForm from "@/components/admin/RecordForm";

export default async function ModelEditPage({ params, searchParams }: { params: Promise<{ model: string; id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { model: key, id } = await params;
  const model = MODEL_BY_KEY[key];
  if (!model) notFound();
  const session = (await getAdminSession())!;
  if (!roleCan(session.role, model, "read")) notFound();
  const sp = await searchParams;
  const isNew = id === "new";

  let record: Record<string, unknown> | null = null;
  if (!isNew) {
    const d = (db as unknown as Record<string, { findUnique: (a: unknown) => Promise<Record<string, unknown> | null> }>)[model.delegate];
    record = await d.findUnique({ where: { id } });
    if (!record) notFound();
  }

  // Runtime select options (parents, footer columns)
  const fieldOptions: Record<string, { value: string; label: string }[]> = {};
  if (model.key === "menus") {
    const menu = (record?.menu as string) ?? sp.menu ?? "women";
    const items = await db.menuItem.findMany({ where: { menu }, orderBy: { sortOrder: "asc" } });
    fieldOptions.parentId = items.filter((i) => i.id !== id).map((i) => ({ value: i.id, label: i.label }));
  }
  if (model.key === "footer-links") {
    const cols = await db.footerColumn.findMany({ orderBy: { sortOrder: "asc" } });
    fieldOptions.columnId = cols.map((c) => ({ value: c.id, label: c.title }));
  }

  const initial: Record<string, unknown> = {};
  for (const f of model.fields) {
    const v = record ? record[f.name] : sp[f.name] ?? f.default;
    initial[f.name] = v instanceof Date ? v.toISOString() : v ?? (f.type === "boolean" ? false : "");
    if (f.type === "json" && typeof initial[f.name] === "string") {
      try { initial[f.name] = JSON.stringify(JSON.parse(initial[f.name] as string), null, 2); } catch { /* keep raw */ }
    } else if (f.type === "json" && typeof initial[f.name] === "object") {
      initial[f.name] = JSON.stringify(initial[f.name], null, 2);
    }
  }

  const title = isNew ? `Новый: ${model.label}` : String(record?.[model.titleField ?? "id"] ?? model.label);
  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/admin/${model.key}`} className="mb-4 inline-flex items-center gap-1 text-xsm text-gray-500 hover:text-black"><ChevronLeft size={14} /> {model.labelPlural}</Link>
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>
      <RecordForm model={model} id={isNew ? null : id} initial={initial} fieldOptions={fieldOptions} canWrite={roleCan(session.role, model, "write")} />
    </div>
  );
}
