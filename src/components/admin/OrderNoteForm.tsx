"use client";
import { useState } from "react";

export default function OrderNoteForm({ orderId, note }: { orderId: string; note: string }) {
  const [value, setValue] = useState(note);
  const [msg, setMsg] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/shopify/order-note", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: orderId, note: value }) });
    const j = await r.json();
    setMsg(r.ok ? "Заметка сохранена в Shopify" : j.error ?? "Ошибка");
  }
  return (
    <form onSubmit={save} className="rounded-sm border border-gray-200 bg-white p-4 text-sm">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Заметка к заказу</p>
      <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} className="w-full rounded-sm border border-gray-300 p-2 text-xsm focus:border-black" />
      <div className="mt-2 flex items-center gap-3"><button className="btn-primary h-9 rounded-sm px-4 text-xsm">Сохранить</button>{msg && <span className="text-xsm text-gray-500">{msg}</span>}</div>
    </form>
  );
}
