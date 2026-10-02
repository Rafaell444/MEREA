import { cn, discountPercent, formatMoney, type Money } from "@/lib/utils";

export default function Price({ price, compareAt, className, size = "sm" }: { price: Money; compareAt?: Money | null; className?: string; size?: "sm" | "md" }) {
  const pct = compareAt ? discountPercent(price.amount, compareAt.amount) : null;
  return (
    <div className={cn("flex items-baseline gap-2 font-medium", size === "md" ? "text-md" : "text-sm", className)}>
      {pct ? (
        <>
          <span className="text-gray-500 line-through font-normal">{formatMoney(compareAt)}</span>
          <span className="text-sale">{formatMoney(price)}</span>
          <span className="text-sale text-xsm">-{pct}%</span>
        </>
      ) : (
        <span>{formatMoney(price)}</span>
      )}
    </div>
  );
}
