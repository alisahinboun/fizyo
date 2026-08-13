import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const a = getSettings();
  return {
    title: {
      default: `${a.klinik_adi} — ${a.unvan}`,
      template: `%s · ${a.klinik_adi}`,
    },
    description: a.hero_metin.slice(0, 180),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
