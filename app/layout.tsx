import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Noto_Sans_Bengali, Noto_Serif_Bengali, Source_Sans_3, Source_Serif_4 } from "next/font/google";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap"
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap"
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-sans-bengali",
  display: "swap"
});

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-serif-bengali",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://banglanews-auto.vercel.app"),
  title: {
    default: "BanglaBriefing",
    template: "%s | BanglaBriefing"
  },
  description: "Bilingual Bangladesh and world news in Bangla and English."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${sourceSerif.variable} ${notoSansBengali.variable} ${notoSerifBengali.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
