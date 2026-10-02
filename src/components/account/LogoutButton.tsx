"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const router = useRouter();
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
