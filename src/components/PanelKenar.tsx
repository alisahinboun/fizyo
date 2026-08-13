"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IkonAyar,
  IkonCikis,
  IkonKisiler,
  IkonOmurga,
  IkonPano,
  IkonTakvim,
} from "@/components/Ikonlar";
import { cikisYap } from "@/app/actions/kimlik";

const MENU = [
  { href: "/panel", etiket: "Genel bakış", ikon: IkonPano },
  { href: "/panel/danisanlar", etiket: "Danışanlar", ikon: IkonKisiler },
  { href: "/panel/randevular", etiket: "Randevular", ikon: IkonTakvim },
  { href: "/panel/ayarlar", etiket: "Ayarlar", ikon: IkonAyar },
];

export default function PanelKenar({ klinikAdi }: { klinikAdi: string }) {
  const yol = usePathname();

  const aktifMi = (href: string) =>
    href === "/panel" ? yol === "/panel" : yol.startsWith(href);

  return (
    <aside className="yazdirma-gizle border-b border-cizgi bg-yuzey md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-5 py-4 md:border-b md:border-cizgi"
          title="Siteyi görüntüle"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-marka-600 text-white">
            <IkonOmurga width={20} height={20} />
          </span>
          <span className="leading-tight">
            <span className="block text-[0.875rem] font-semibold text-murekkep">
              {klinikAdi}
            </span>
            <span className="block text-[0.75rem] text-soluk">Yönetim paneli</span>
          </span>
        </Link>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:py-4">
          {MENU.map(({ href, etiket, ikon: Ikon }) => {
            const aktif = aktifMi(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={aktif ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[0.875rem] font-medium transition ${
                  aktif
                    ? "bg-marka-50 text-marka-700"
                    : "text-ikincil hover:bg-zemin hover:text-murekkep"
                }`}
              >
                <Ikon width={17} height={17} />
                {etiket}
              </Link>
            );
          })}
        </nav>

        <form action={cikisYap} className="mt-auto hidden px-3 pb-4 md:block">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[0.875rem] text-ikincil transition hover:bg-zemin hover:text-murekkep"
          >
            <IkonCikis width={17} height={17} />
            Çıkış yap
          </button>
        </form>
      </div>
    </aside>
  );
}
