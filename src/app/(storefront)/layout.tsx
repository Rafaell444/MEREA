import Marquee from "@/components/layout/Marquee";
import Footer from "@/components/layout/Footer";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { getAnnouncements, getMenu, getPopups, getSettings, getSizeGuides } from "@/lib/cms/content";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [announcements, women, girls, service, popups, settings, sizeGuides] = await Promise.all([
    getAnnouncements(),
    getMenu("women"),
    getMenu("girls"),
    getMenu("service"),
    getPopups(),
    getSettings(),
    getSizeGuides(),
  ]);

  const menus: Record<string, { label: string; items: typeof women }> = { women: { label: "Женщинам", items: women } };
  if (settings.showGirlsMenu) menus.girls = { label: "Девочкам", items: girls };

  return (
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
  );
}
