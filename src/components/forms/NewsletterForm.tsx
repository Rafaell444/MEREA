"use client";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

export default function NewsletterForm({ source = "footer", className, light }: { source?: string; className?: string; light?: boolean }) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source, consent: true }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t("Ошибка"));
      setState("done");
      setMsg(json.message ?? t("Спасибо за подписку!"));
    } catch (err) {
      setState("error");
      setMsg((err as Error).message);
    }
  }

  if (state === "done") {
    return (
      <p className={cn("flex items-center gap-2 text-sm", className)}>
        <Check size={16} /> {t(msg)}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={cn("relative", className)}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("Электронная почта")}
        className={cn("h-11 w-full border-b bg-transparent pr-12 text-sm placeholder:text-gray-500 focus:border-black transition-colors", light ? "border-white/60 text-white placeholder:text-white/70 focus:border-white" : "border-gray-400")}
        aria-label={t("Электронная почта")}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        aria-label={t("Подписаться")}
        className={cn("absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-300 hover:translate-x-0.5 disabled:opacity-50", light ? "bg-white text-black" : "bg-black text-white")}
      >
        <ArrowRight size={16} />
      </button>
      {state === "error" && <p className="mt-2 text-xsm text-error">{t(msg)}</p>}
    </form>
  );
}
