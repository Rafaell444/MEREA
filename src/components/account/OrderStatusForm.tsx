"use client";
import { useState } from "react";
import Link from "@/components/ui/Link";
import { useT } from "@/lib/i18n/client";

export default function OrderStatusForm() {
  const [order, setOrder] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const t = useT();
  // Sentence with an inline link: translators keep the <a>…</a> marker.
  const doneParts = t("Статус заказа и трек-номер доступны в <a>личном кабинете</a>. Если ты оформляла заказ без регистрации — проверь письмо с подтверждением: в нем есть ссылка для отслеживания.").split(/<\/?a>/);
  const input = "h-11 w-full border-b border-gray-400 bg-transparent text-sm placeholder:text-gray-500 focus:border-black";
  return (
    <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="mt-8 space-y-4">
      <input required value={order} onChange={(e) => setOrder(e.target.value)} placeholder={t("Номер заказа")} className={input} />
      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("Электронная почта")} className={input} />
      <button type="submit" className="btn-primary w-full">{t("Проверить статус")}</button>
      {done && (
        <div className="rounded-sm bg-off-white p-4 text-sm animate-fade-in">
          {doneParts[0]}<Link href="/myprofile?next=/orders" className="underline underline-offset-4">{doneParts[1]}</Link>{doneParts[2]}
        </div>
      )}
    </form>
  );
}
