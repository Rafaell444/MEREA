"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import type { CustomerAddress, AddressInput } from "@/lib/catalog/types";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

const EMPTY: AddressInput = { firstName: "", lastName: "", address1: "", address2: "", city: "", province: "", zip: "", country: "Россия", phone: "" };
const input = "h-11 w-full border-b border-gray-400 bg-transparent text-sm placeholder:text-gray-500 focus:border-black";
const label = "block text-xsm text-gray-500";

export default function AddressBook({ addresses, customer }: { addresses: CustomerAddress[]; customer: { firstName?: string; lastName?: string; phone?: string } }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CustomerAddress | "new" | null>(null);
  const [form, setForm] = useState<AddressInput>(EMPTY);
  const [makeDefault, setMakeDefault] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function openNew() {
    setForm({ ...EMPTY, firstName: customer.firstName ?? "", lastName: customer.lastName ?? "", phone: customer.phone ?? "" });
    setMakeDefault(addresses.length === 0); setErr(""); setEditing("new");
  }
  function openEdit(a: CustomerAddress) {
    const { id: _id, isDefault, ...rest } = a; void _id;
    setForm({ ...EMPTY, ...rest }); setMakeDefault(!!isDefault); setErr(""); setEditing(a);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const r = await fetch("/api/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing && editing !== "new" ? editing.id : undefined, makeDefault, address: form }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setEditing(null); router.refresh();
    } catch (e2) { setErr((e2 as Error).message); } finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm("Удалить адрес?")) return;
    await fetch("/api/account/addresses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }
  async function setDefault(a: CustomerAddress) {
    const { id, isDefault: _d, ...rest } = a; void _d;
    await fetch("/api/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, makeDefault: true, address: rest }) });
    router.refresh();
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className={cn("relative rounded-sm border p-5", a.isDefault ? "border-black" : "border-gray-200")}>
            {a.isDefault && <span className="absolute right-3 top-3 rounded-full bg-black px-2 py-0.5 text-[10px] font-medium uppercase text-white">Основной</span>}
            <p className="text-sm font-bold">{[a.firstName, a.lastName].filter(Boolean).join(" ")}</p>
            <p className="mt-2 text-sm leading-6">{a.address1}{a.address2 ? `, ${a.address2}` : ""}<br />{a.zip ? `${a.zip}, ` : ""}{a.city}{a.province ? `, ${a.province}` : ""}<br />{a.country}</p>
            {a.phone && <p className="mt-1 text-xsm text-gray-500">{a.phone}</p>}
            <div className="mt-4 flex flex-wrap gap-3 text-xsm">
              <button onClick={() => openEdit(a)} className="flex items-center gap-1 underline underline-offset-4"><Pencil size={12} /> Изменить</button>
              {!a.isDefault && <button onClick={() => setDefault(a)} className="flex items-center gap-1 underline underline-offset-4"><Star size={12} /> Сделать основным</button>}
              <button onClick={() => remove(a.id)} className="flex items-center gap-1 text-error underline underline-offset-4"><Trash2 size={12} /> Удалить</button>
            </div>
          </div>
        ))}
        <button onClick={openNew} className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-gray-300 p-5 text-sm transition-colors hover:border-black">
          <Plus size={20} strokeWidth={1.5} /> Добавить адрес
        </button>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} size="md">
        <form onSubmit={save} className="p-6 sm:p-8">
          <h2 className="mb-5 text-lg font-bold">{editing === "new" ? "Новый адрес" : "Изменить адрес"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>Имя<input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={input} /></label>
            <label className={label}>Фамилия<input value={form.lastName ?? ""} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={input} /></label>
            <label className={cn(label, "sm:col-span-2")}>Улица, дом, квартира<input required value={form.address1} onChange={(e) => setForm({ ...form, address1: e.target.value })} className={input} /></label>
            <label className={cn(label, "sm:col-span-2")}>Подъезд, этаж, домофон<input value={form.address2 ?? ""} onChange={(e) => setForm({ ...form, address2: e.target.value })} className={input} /></label>
            <label className={label}>Город<input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={input} /></label>
            <label className={label}>Регион<input value={form.province ?? ""} onChange={(e) => setForm({ ...form, province: e.target.value })} className={input} /></label>
            <label className={label}>Индекс<input value={form.zip ?? ""} onChange={(e) => setForm({ ...form, zip: e.target.value })} className={input} inputMode="numeric" /></label>
            <label className={label}>Страна<input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={input} /></label>
            <label className={cn(label, "sm:col-span-2")}>Телефон<input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} inputMode="tel" /></label>
          </div>
          <label className="mt-4 flex items-center gap-2 text-xsm"><input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} className="accent-black" /> Использовать как основной адрес</label>
          {err && <p className="mt-3 text-xsm text-error">{err}</p>}
          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={busy} className="btn-primary h-11 flex-1 text-xsm">Сохранить</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-outline h-11 px-6 text-xsm">Отмена</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
