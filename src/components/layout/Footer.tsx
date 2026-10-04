import Link from "@/components/ui/Link";
import { getFooter, getSettings } from "@/lib/cms/content";
import NewsletterForm from "@/components/forms/NewsletterForm";
import StoreFinderForm from "@/components/forms/StoreFinderForm";
import FooterAccordion from "./FooterAccordion";
import SocialIcons from "@/components/ui/SocialIcons";
import LanguageSwitcher from "./LanguageSwitcher";
import { getT } from "@/lib/i18n/server";

export default async function Footer() {
  const [columns, settings] = await Promise.all([getFooter(), getSettings()]);
  const { t } = await getT();
  const categoryCols = columns.slice(0, 2);
  const infoCols = columns.slice(2);

  return (
    <footer className="mt-6 sm:mt-8 border-t border-gray-300">
      {/* Category columns */}
      <div className="sm:px-10 sm:pt-8 sm:pb-8">
        <div className="sm:hidden">
          <FooterAccordion columns={categoryCols} />
        </div>
        <div className="hidden sm:grid sm:grid-cols-4 sm:gap-9">
          {categoryCols.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-sm font-bold uppercase">{t(col.title)}</p>
              <div className="group flex flex-col gap-4">
                {col.links.map((l) => (
                  <Link key={l.href + l.label} href={l.href} className="block text-sm text-black transition-colors duration-200 group-hover:text-silver-grey hover:!text-black">
                    {t(l.label)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter + store finder */}
      <div className="grid grid-cols-1 gap-8 border-t border-gray-300 px-4 py-8 sm:grid-cols-2 sm:gap-10 sm:px-10">
        <div>
          <p className="mb-4 text-sm font-bold">{t(settings.newsletterTitle)}</p>
          <NewsletterForm source="footer" />
        </div>
        <div>
          <p className="mb-4 text-sm font-bold">{t(settings.storeFinderTitle)}</p>
          <StoreFinderForm placeholder={settings.storeFinderPlaceholder ? t(settings.storeFinderPlaceholder) : undefined} />
        </div>
      </div>

      {/* Socials + info columns */}
      <div className="border-t border-gray-300 px-4 py-8 sm:px-10">
        <div className="mb-8">
          <p className="mb-4 text-sm font-bold">{t("Социальные сети")}</p>
          <SocialIcons socials={settings.socials} />
        </div>
        <div className="sm:hidden">
          <FooterAccordion columns={infoCols} />
        </div>
        <div className="hidden sm:grid sm:grid-cols-4 sm:gap-9">
          {infoCols.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-sm font-bold">{t(col.title)}</p>
              <div className="group flex flex-col gap-3">
                {col.links.map((l) => (
                  <Link key={l.href + l.label} href={l.href} className="block text-sm text-black transition-colors duration-200 group-hover:text-silver-grey hover:!text-black">
                    {t(l.label)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Region + legal */}
      <div className="flex flex-col gap-4 border-t border-gray-300 px-4 py-6 text-xsm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="flex gap-6 text-black">
          <span className="flex items-center gap-1 font-medium">{t(settings.region)}</span>
          <LanguageSwitcher variant="footer" />
        </div>
        <p className="max-w-3xl">{t(settings.legalEntity)}</p>
      </div>
    </footer>
  );
}
