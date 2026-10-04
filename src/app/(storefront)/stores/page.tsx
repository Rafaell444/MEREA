import type { Metadata } from "next";
import { MapPin, Clock, Phone } from "lucide-react";
import { getStores } from "@/lib/cms/content";
import StoreFinderForm from "@/components/forms/StoreFinderForm";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Магазины Merey") };
}

export default async function StoresPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const stores = await getStores();
  const { t } = await getT();
  const needle = q.trim().toLowerCase();
  const list = needle ? stores.filter((s) => `${s.city} ${s.address} ${s.name}`.toLowerCase().includes(needle)) : stores;
  const cities = [...new Set(list.map((s) => s.city))];

  return (
    <div className="px-4 py-8 sm:px-10">
      <h1 className="text-2xl font-normal sm:text-[32px]">{t("Найти магазин")}</h1>
      <div className="mt-6 max-w-md"><StoreFinderForm /></div>
      {q && <p className="mt-4 text-xsm text-gray-500">{t("Результаты по запросу «{q}»: {n}", { q, n: list.length })}</p>}
      {cities.map((city) => (
        <section key={city} className="mt-10">
          <h2 className="text-lg font-bold">{t(city)}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.filter((s) => s.city === city).map((s) => (
              <li key={s.id ?? s.name} className="rounded-sm border border-gray-200 p-5 transition-colors hover:border-black">
                <p className="text-sm font-bold">{t(s.name)}</p>
                <p className="mt-2 flex items-start gap-2 text-sm text-gray-900"><MapPin size={14} className="mt-1 shrink-0" /> {t(s.address)}</p>
                {s.hours && <p className="mt-1 flex items-center gap-2 text-xsm text-gray-500"><Clock size={14} /> {t(s.hours)}</p>}
                {s.phone && <p className="mt-1 flex items-center gap-2 text-xsm text-gray-500"><Phone size={14} /> {s.phone}</p>}
                {s.lat && s.lng && (
                  <a href={`https://www.google.com/maps?q=${s.lat},${s.lng}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xsm underline underline-offset-4">{t("Открыть на карте")}</a>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {list.length === 0 && <p className="mt-8 text-sm text-gray-500">{t("Магазинов не найдено. Попробуй другой город.")}</p>}
    </div>
  );
}
