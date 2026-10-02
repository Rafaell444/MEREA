import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await destroyAdminSession();
  return NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
}
