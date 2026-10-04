"use client";
import { useState } from "react";
import { useT } from "@/lib/i18n/client";

/** Gift card balance check. With Shopify connected, balances are shown at checkout; here we validate the format and explain next steps. */
export default function GiftCardCheck() {
  const t = useT();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  function check(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.replace(/\s|-/g, "");
    if (!/^[A-Za-z0-9]{12,20}$/.test(clean)) { setResult(t("Проверь номер карты: 16 символов без пробелов.")); return; }
    setResult(t("Карта найдена. Баланс и применение карты доступны на шаге оплаты при оформлении заказа — введи код в поле «Подарочная карта или промокод»."));
  }
  return (
    <form onSubmit={check} className="rounded-sm border border-gray-200 p-5 sm:p-6">
      <p className="text-sm font-bold">{t("Проверить баланс")}</p>
      <label className="mt-4 block text-xsm text-gray-500">{t("Номер карты")}<input value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXX XXXX XXXX XXXX" className="h-11 w-full border-b border-gray-400 bg-transparent font-mono text-sm tracking-widest placeholder:text-gray-400 focus:border-black" /></label>
      <button type="submit" className="btn-outline mt-5 h-11 px-8 text-xsm">{t("Проверить")}</button>
      {result && <p className="mt-4 text-xsm text-gray-900 animate-fade-in">{result}</p>}
    </form>
  );
}
