import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const ALLOWED: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg", "video/mp4": "mp4" };
const MAX_BYTES = 12 * 1024 * 1024;

/** Secure media upload: session required, MIME allowlist, size cap, random filename, raster images re-encoded via sharp. */
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Файл больше 12 МБ" }, { status: 413 });
  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "Недопустимый тип файла" }, { status: 415 });

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  let buffer: Buffer = Buffer.from(new Uint8Array(await file.arrayBuffer()));
  let width: number | undefined, height: number | undefined;

  if (["jpg", "png", "webp"].includes(ext)) {
    // Re-encode: strips metadata & any embedded payload, limits dimensions
    const img = sharp(buffer, { failOn: "error" }).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true });
    const out = ext === "png" ? img.png({ compressionLevel: 8 }) : ext === "webp" ? img.webp({ quality: 85 }) : img.jpeg({ quality: 85, mozjpeg: true });
    const { data, info } = await out.toBuffer({ resolveWithObject: true });
    buffer = Buffer.from(data); width = info.width; height = info.height;
  } else if (ext === "svg") {
    const txt = buffer.toString("utf8");
    if (/<script|on\w+=|javascript:/i.test(txt)) return NextResponse.json({ error: "SVG содержит скрипты" }, { status: 415 });
  }

  let url: string;
  // Vercel Blob token: default name, or the custom "MEREY" prefix chosen when the store was created
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN ?? process.env.MEREA_READ_WRITE_TOKEN;
  if (blobToken) {
    // Vercel: serverless filesystem is read-only, store in Vercel Blob
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${name}`, buffer, { access: "public", contentType: file.type, addRandomSuffix: false, token: blobToken });
    url = blob.url;
  } else {
    await fs.writeFile(path.join(dir, name), buffer);
    url = `/uploads/${name}`;
  }
  const media = await db.media.create({ data: { url, filename: file.name.slice(0, 180), mime: file.type, size: buffer.length, width, height } });
  await db.auditLog.create({ data: { userId: session.sub, action: "upload", entity: "media", entityId: media.id, details: JSON.stringify({ url }) } }).catch(() => undefined);
  return NextResponse.json({ ok: true, url, id: media.id, width, height });
}
