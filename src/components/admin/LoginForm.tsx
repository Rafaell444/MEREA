"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Ошибка входа");
      router.push(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const input = "h-11 w-full rounded-sm border border-gray-300 px-3 text-sm focus:border-black";
  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-xsm font-medium">E-mail<input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={`${input} mt-1`} /></label>
      <label className="block text-xsm font-medium">Пароль<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${input} mt-1`} /></label>
      {error && <p className="text-xsm text-error">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary h-11 w-full rounded-sm">{loading ? "Входим…" : "Войти"}</button>
    </form>
  );
}
