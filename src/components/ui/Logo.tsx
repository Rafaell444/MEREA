import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Brand logo. Uses the image configured in Settings → logo (upload your own in /admin/settings).
 * `invert` renders a white version over dark/hero backgrounds.
 */
export default function Logo({ src, invert, className }: { src?: string; invert?: boolean; className?: string }) {
  return (
    <Link href="/" title="Merea" className={cn("inline-flex items-center", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Merea" className={cn("h-7 w-auto max-w-full sm:h-[38px] transition-[filter] duration-500", invert && "invert")} />
      ) : (
        <span className={cn("flex flex-col items-center leading-none transition-colors duration-500", invert ? "text-white" : "text-black")}>
          <span className="text-[26px] sm:text-[32px] font-bold tracking-[0.12em]">MEREA</span>
          <span className="text-[8px] sm:text-[9px] font-medium tracking-[0.5em] -mt-0.5">underwear</span>
        </span>
      )}
    </Link>
  );
}
