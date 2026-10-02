import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/session";
import { MODEL_BY_KEY, roleCan } from "@/lib/admin/registry";
import RecordList from "@/components/admin/RecordList";

type Row = Record<string, unknown> & { id: string };

export default async function ModelListPage({ params, searchParams }: { params: Promise<{ model: string }>; searchParams: Promise<{ q?: string; filter?: string; page?: string }> }) {
  const { model: key } = await params;
  const model = MODEL_BY_KEY[key];
  if (!model) notFound();
  const session = (await getAdminSession())!;
  if (!roleCan(session.role, model, "read")) notFound();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const filter = sp.filter ?? "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const take = 100;

  const where: Record<string, unknown> = {};
  if (q && model.search?.length) where.OR = model.search.map((f) => ({ [f]: { contains: q } }));
  if (model.filterField && filter) where[model.filterField.name] = filter;

  const d = (db as unknown as Record<string, { findMany: (a: unknown) => Promise<Row[]>; count: (a: unknown) => Promise<number> }>)[model.delegate];
  const orderBy = model.orderable ? [{ sortOrder: "asc" }] : [{ createdAt: "desc" }];
  let rows: Row[] = [];
  let total = 0;
  try {
    [rows, total] = await Promise.all([d.findMany({ where, orderBy, take, skip: (page - 1) * take }), d.count({ where })]);
  } catch {
    rows = await d.findMany({ where, take, skip: (page - 1) * take });
    total = rows.length;
  }

  // Menu tree: indent children under parents for readability
  if (model.key === "menus") rows = treeOrder(rows);

  // Footer link column names
  const extra: Record<string, Record<string, string>> = {};
  if (model.key === "footer-links") {
    const cols = await db.footerColumn.findMany();
    extra.columnId = Object.fromEntries(cols.map((c) => [c.id, c.title]));
  }

  const canWrite = roleCan(session.role, model, "write");
  const serializable = rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{model.labelPlural}</h1>
          {model.help && <p className="mt-1 max-w-3xl text-xsm text-gray-500">{model.help}</p>}
        </div>
        {canWrite && !model.readonly && (
          <Link href={`/admin/${model.key}/new${filter ? `?${model.filterField?.name}=${filter}` : ""}`} className="btn-primary h-10 rounded-sm px-5 text-xsm"><Plus size={14} className="mr-1" /> Добавить</Link>
        )}
      </div>
      <RecordList model={model} rows={serializable as Row[]} total={total} q={q} filter={filter} canWrite={canWrite} extra={extra} />
    </div>
  );
}

function treeOrder(rows: Row[]): Row[] {
  const byParent = new Map<string | null, Row[]>();
  rows.forEach((r) => {
    const p = (r.parentId as string | null) ?? null;
    byParent.set(p, [...(byParent.get(p) ?? []), r]);
  });
  const out: Row[] = [];
  const walk = (parent: string | null, depth: number) => {
    (byParent.get(parent) ?? []).forEach((r) => {
      out.push({ ...r, __depth: depth });
      walk(r.id, depth + 1);
    });
  };
  walk(null, 0);
  // rows whose parent is filtered out
  rows.forEach((r) => { if (!out.some((o) => o.id === r.id)) out.push({ ...r, __depth: 0 }); });
  return out;
}
