import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Stars({ value = 0, size = 13, className }: { value?: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-label={`${value} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} strokeWidth={1.5} className="absolute inset-0 text-black" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} strokeWidth={1.5} className="text-black fill-black" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
