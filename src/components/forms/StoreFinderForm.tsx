"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function StoreFinderForm({ placeholder = "Введи город или почтовый индекс" }: { placeholder?: string }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/stores?q=${encodeURIComponent(q.trim())}`);
      }}
      className="relative"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full border-b border-gray-400 bg-transparent pr-12 text-sm placeholder:text-gray-500 focus:border-black transition-colors"
        aria-label={placeholder}
      />
      <button type="submit" aria-label="Найти магазин" className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 hover:translate-x-0.5">
        <ArrowRight size={16} />
      </button>
    </form>
  );
}
