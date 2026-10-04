import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/site-url";
import { Montserrat, Poppins, Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";
import { HTML_LANG } from "@/lib/i18n/config";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], variable: "--font-montserrat", display: "swap", weight: ["300", "400", "500", "600", "700"] });
const poppins = Poppins({ subsets: ["latin"], variable: "--font-poppins", display: "swap", weight: ["400", "500"] });
// Montserrat has no Georgian glyphs: Noto Sans Georgian is the fallback in the font stack (see globals.css)
const georgian = Noto_Sans_Georgian({ subsets: ["georgian"], variable: "--font-georgian", display: "swap", weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Merey", template: "%s | Merey" },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1, colorScheme: "only light" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={HTML_LANG[locale]} className={`${montserrat.variable} ${poppins.variable} ${georgian.variable}`}>
      <body className="min-h-screen bg-white text-black antialiased">{children}</body>
    </html>
  );
}
