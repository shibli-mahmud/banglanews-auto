import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://yourdomain.com"),
  title: "BanglaBriefing",
  description: "AI powered bilingual Bangla and English news portal."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
