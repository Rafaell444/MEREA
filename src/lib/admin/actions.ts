"use server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/session";
import { hashPassword, passwordIssues } from "@/lib/auth/password";
import { revalidateCms } from "@/lib/cms/content";
import { MODEL_BY_KEY, roleCan, type Field, type ModelDef } from "./registry";

type Result = { ok: true; id?: string } | { ok: false; error: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDelegate = { findUnique: (a: any) => Promise<any>; findMany: (a: any) => Promise<any[]>; create: (a: any) => Promise<any>; update: (a: any) => Promise<any>; delete: (a: any) => Promise<any>; aggregate: (a: any) => Promise<any> };

function delegate(model: ModelDef): AnyDelegate {
  return (db as unknown as Record<string, AnyDelegate>)[model.delegate];
}

async function requireRole(model: ModelDef, action: "read" | "write") {
  const s = await getAdminSession();
  if (!s) throw new Error("Требуется вход");
  if (!roleCan(s.role, model, action)) throw new Error("Недостаточно прав");
  return s;
}

async function audit(userId: string, action: string, entity: string, entityId?: string, details?: unknown) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? undefined;
  await db.auditLog.create({ data: { userId, action, entity, entityId, details: details ? JSON.stringify(details).slice(0, 4000) : undefined, ip } }).catch(() => undefined);
}

/** Coerce a raw form value according to its field type. Returns `undefined` to skip the field. */
function coerce(field: Field, raw: unknown): unknown {
  if (field.type === "readonly") return undefined;
  const str = raw == null ? "" : String(raw);
  switch (field.type) {
    case "number": {
      if (str.trim() === "") return field.required ? 0 : null;
      const n = Number(str);
      if (Number.isNaN(n)) throw new Error(`«${field.label}»: нужно число`);
      return n;
    }
    case "boolean":
      return raw === true || str === "true" || str === "on" || str === "1";
    case "date":
      return str.trim() ? new Date(str) : null;
    case "json": {
      const txt = str.trim();
      if (!txt) return JSON.stringify(field.default ?? {});
      try {
        return JSON.stringify(JSON.parse(txt));
      } catch {
        throw new Error(`«${field.label}»: некорректный JSON`);
      }
    }
    case "password":
      return undefined; // handled separately
    case "parent":
      return str.trim() ? str.trim() : null;
    case "color":
      if (str && !/^#[0-9a-fA-F]{6}$/.test(str)) throw new Error(`«${field.label}»: цвет в формате #RRGGBB`);
      return str || null;
    default: {
      const v = str.trim();
      if (field.required && !v) throw new Error(`«${field.label}»: обязательное поле`);
      if (v.length > 20000) throw new Error(`«${field.label}»: слишком длинное значение`);
      return v || (field.required ? "" : null);
    }
  }
}

export async function saveRecord(modelKey: string, id: string | null, values: Record<string, unknown>): Promise<Result> {
  try {
    const model = MODEL_BY_KEY[modelKey];
    if (!model) return { ok: false, error: "Неизвестная модель" };
    const session = await requireRole(model, "write");
    const data: Record<string, unknown> = {};
    for (const f of model.fields) {
      const v = coerce(f, values[f.name]);
      if (v !== undefined) data[f.name] = v;
    }
    if (model.key === "users") {
      const pw = String(values.password ?? "");
      if (pw) {
        const issues = passwordIssues(pw);
        if (issues.length) return { ok: false, error: `Пароль слишком простой: ${issues.join(", ")}` };
        data.passwordHash = await hashPassword(pw);
      } else if (!id) {
        return { ok: false, error: "Укажи пароль для нового администратора" };
      }
      data.email = String(data.email).toLowerCase();
    }
    const d = delegate(model);
    let saved;
    if (id) {
      saved = await d.update({ where: { id }, data });
    } else {
      if (model.orderable) {
        const agg = await d.aggregate({ _max: { sortOrder: true } });
        data.sortOrder = (agg?._max?.sortOrder ?? -1) + 1;
      }
      saved = await d.create({ data });
    }
    await audit(session.sub, id ? "update" : "create", model.key, saved.id, data);
    revalidateCms();
    return { ok: true, id: saved.id };
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("Unique constraint")) return { ok: false, error: "Такое значение уже существует (уникальное поле)" };
    return { ok: false, error: msg };
  }
}

export async function deleteRecord(modelKey: string, id: string): Promise<Result> {
  try {
    const model = MODEL_BY_KEY[modelKey];
    if (!model) return { ok: false, error: "Неизвестная модель" };
    const session = await requireRole(model, "write");
    if (model.key === "users" && id === session.sub) return { ok: false, error: "Нельзя удалить себя" };
    await delegate(model).delete({ where: { id } });
    await audit(session.sub, "delete", model.key, id);
    revalidateCms();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function toggleRecord(modelKey: string, id: string, field: string, value: boolean): Promise<Result> {
  try {
    const model = MODEL_BY_KEY[modelKey];
    if (!model || !model.fields.some((f) => f.name === field && f.type === "boolean")) return { ok: false, error: "Недопустимое поле" };
    const session = await requireRole(model, "write");
    await delegate(model).update({ where: { id }, data: { [field]: value } });
    await audit(session.sub, "toggle", model.key, id, { [field]: value });
    revalidateCms();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Move a record up/down within its sibling group (same parent/menu/column). */
export async function moveRecord(modelKey: string, id: string, dir: "up" | "down"): Promise<Result> {
  try {
    const model = MODEL_BY_KEY[modelKey];
    if (!model?.orderable) return { ok: false, error: "Модель не сортируется" };
    const session = await requireRole(model, "write");
    const d = delegate(model);
    const row = await d.findUnique({ where: { id } });
    if (!row) return { ok: false, error: "Запись не найдена" };
    const where: Record<string, unknown> = {};
    if ("parentId" in row) where.parentId = row.parentId;
    if ("menu" in row) where.menu = row.menu;
    if ("columnId" in row) where.columnId = row.columnId;
    const siblings = await d.findMany({ where, orderBy: { sortOrder: "asc" } });
    const idx = siblings.findIndex((s) => s.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= siblings.length) return { ok: true };
    // normalise sortOrder to indices, then swap (sequential updates; small sibling lists)
    for (let i = 0; i < siblings.length; i++) {
      const order = i === idx ? swapIdx : i === swapIdx ? idx : i;
      if (siblings[i].sortOrder !== order) await d.update({ where: { id: siblings[i].id }, data: { sortOrder: order } });
    }
    await audit(session.sub, "reorder", model.key, id, { dir });
    revalidateCms();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function saveSettings(values: Record<string, unknown>): Promise<Result> {
  try {
    const s = await getAdminSession();
    if (!s || !["owner", "admin"].includes(s.role)) return { ok: false, error: "Недостаточно прав" };
    const entries = Object.entries(values).filter(([k]) => /^[a-zA-Z0-9_]{1,60}$/.test(k));
    await db.$transaction(entries.map(([key, value]) => db.setting.upsert({ where: { key }, update: { value: JSON.stringify(value) }, create: { key, value: JSON.stringify(value) } })));
    await audit(s.sub, "update", "settings", undefined, Object.keys(values));
    revalidateCms();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function purgeCache(): Promise<Result> {
  const s = await getAdminSession();
  if (!s) return { ok: false, error: "Требуется вход" };
  revalidateCms();
  await audit(s.sub, "purge-cache", "system");
  return { ok: true };
}
