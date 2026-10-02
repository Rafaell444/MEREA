import type { Metadata, Viewport } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], variable: "--font-montserrat", display: "swap", weight: ["300", "400", "500", "600", "700"] });
const poppins = Poppins({ subsets: ["latin"], variable: "--font-poppins", display: "swap", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Merea — Официальный интернет-магазин в России", template: "%s | Merea" },
  description: "Женское нижнее белье, пижамы и одежда Merea — купить в официальном интернет-магазине в России.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${montserrat.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-white text-black antialiased">{children}</body>
    </html>
  );
}
