import type { Metadata } from "next";
import Marquee from "@/components/layout/Marquee";
import Footer from "@/components/layout/Footer";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { getAnnouncements, getMenu, getPopups, getSettings, getSizeGuides } from "@/lib/cms/content";
import { getT, getAlternates } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import { OG_LOCALE } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const [{ t, locale }, settings, alternates] = await Promise.all([getT(), getSettings(), getAlternates()]);
  const title = t(settings.seoTitle);
  const description = t(settings.seoDescription);
  return {
    alternates,
    title: { default: title, template: `%s | ${settings.siteName}` },
    description,
    openGraph: { siteName: settings.siteName, locale: OG_LOCALE[locale], type: "website", title, description },
  };
}

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [{ t, locale, dict }, announcements, women, girls, service, popups, settings, sizeGuides] = await Promise.all([
    getT(),
    getAnnouncements(),
    getMenu("women"),
    getMenu("girls"),
    getMenu("service"),
    getPopups(),
    getSettings(),
    getSizeGuides(),
  ]);

  const menus: Record<string, { label: string; items: typeof women }> = { women: { label: t("Женщинам"), items: women } };
  if (settings.showGirlsMenu) menus.girls = { label: t("Девочкам"), items: girls };

  // Long HTML bodies (CMS pages, SEO texts) are rendered on the server only — keep them out of the client bundle
  const clientDict = Object.fromEntries(Object.entries(dict).filter(([k]) => k.length <= 420 && !k.startsWith("<")));

  return (
    <I18nProvider locale={locale} dict={clientDict}>
      <div className="flex min-h-screen flex-col">
        <Marquee items={announcements} />
        <StorefrontShell
          menus={menus}
          service={service}
          popups={popups}
          sizeGuides={sizeGuides}
          logo={settings.logo || undefined}
          transparentOnHome={settings.headerTransparentOnHome}
          freeShippingFrom={settings.freeShippingFrom}
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
