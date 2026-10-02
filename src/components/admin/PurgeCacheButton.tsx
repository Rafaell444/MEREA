"use client";
import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { purgeCache } from "@/lib/admin/actions";

export default function PurgeCacheButton() {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => start(async () => { await purgeCache(); setDone(true); setTimeout(() => setDone(false), 2000); })}
      disabled={pending}
      className="flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 py-2 text-xsm font-medium hover:border-black"
    >
      <RefreshCw size={14} className={pending ? "animate-spin" : ""} /> {done ? "Кэш обновлен" : "Обновить сайт (сбросить кэш)"}
    </button>
  );
}
