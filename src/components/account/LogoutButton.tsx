"use client";
import { useLocalizedRouter } from "@/lib/i18n/client";

export default function LogoutButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const router = useLocalizedRouter();
  return (
    <button
      className={className}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      {children}
    </button>
  );
}
