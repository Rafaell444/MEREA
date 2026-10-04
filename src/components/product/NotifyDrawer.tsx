"use client";
import { useState } from "react";
import { Bell, Check } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import { useUI } from "@/store/ui";
import { useT } from "@/lib/i18n/client";

type Payload = { productHandle: string; variantId: string; size?: string; title?: string };

export default function NotifyDrawer() {
  const t = useT();
  const { drawer, close, drawerPayload } = useUI();
  const open = drawer === "notify";
  const p = (drawerPayload ?? {}) as Payload;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const r = await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, ...p }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? t("Ошибка"));
      setState("done");
    } catch (e) {
      setErr((e as Error).message);
      setState("error");
    }
  }

  return (
    <Drawer open={open} onClose={() => { close(); setState("idle"); setEmail(""); }} side="right" title={t("Сообщить о поступлении")} width="w-full sm:w-[420px]">
      <div className="px-6 py-6">
        {state === "done" ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Check size={28} />
            <p className="text-sm font-medium">{t("Готово! Мы напишем, как только размер появится.")}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="flex items-start gap-3 rounded-sm bg-off-white p-4">
              <Bell size={18} strokeWidth={1.5} className="mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">{p.title}</p>
                {p.size && <p className="text-xsm text-gray-500">{t("Размер {size} сейчас нет в наличии", { size: p.size })}</p>}
              </div>
            </div>
            <p className="text-sm text-gray-900">{t("Оставь e-mail — пришлем письмо, когда товар снова будет доступен.")}</p>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("Электронная почта")} className="h-11 w-full border-b border-gray-400 text-sm focus:border-black" />
            {state === "error" && <p className="text-xsm text-error">{err}</p>}
            <button type="submit" disabled={state === "loading"} className="btn-primary w-full">{t("Уведомить меня")}</button>
          </form>
        )}
      </div>
    </Drawer>
  );
}
