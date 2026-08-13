import Link from "next/link";
import type { ReactNode } from "react";

export function Kart({
  children,
  className = "",
  as: As = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return <As className={`kart ${className}`}>{children}</As>;
}

export function KartBaslik({
  baslik,
  aciklama,
  sag,
}: {
  baslik: string;
  aciklama?: string;
  sag?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cizgi px-5 py-4">
      <div>
        <h2 className="text-[0.9375rem] font-semibold text-murekkep">{baslik}</h2>
        {aciklama && <p className="mt-0.5 text-[0.8125rem] text-ikincil">{aciklama}</p>}
      </div>
      {sag && <div className="flex items-center gap-2">{sag}</div>}
    </div>
  );
}

const ROZET_RENKLERI = {
  notr: "bg-zemin text-ikincil border-cizgi",
  marka: "bg-marka-50 text-marka-700 border-marka-200",
  iyi: "bg-[#eaf7ea] text-[#0a6b0a] border-[#c3e6c3]",
  uyari: "bg-[#fdf4e0] text-[#8a5d00] border-[#f3ddab]",
  kritik: "bg-[#fdecec] text-[#a52626] border-[#f2c4c4]",
} as const;

export function Rozet({
  children,
  ton = "notr",
  className = "",
}: {
  children: ReactNode;
  ton?: keyof typeof ROZET_RENKLERI;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.75rem] font-medium ${ROZET_RENKLERI[ton]} ${className}`}
    >
      {children}
    </span>
  );
}

export function BosDurum({
  baslik,
  aciklama,
  eylem,
}: {
  baslik: string;
  aciklama?: string;
  eylem?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
      <p className="text-[0.9375rem] font-medium text-murekkep">{baslik}</p>
      {aciklama && <p className="max-w-sm text-[0.8125rem] text-ikincil">{aciklama}</p>}
      {eylem && <div className="mt-2">{eylem}</div>}
    </div>
  );
}

export function IstatistikKutusu({
  etiket,
  deger,
  alt,
  ikon,
}: {
  etiket: string;
  deger: string | number;
  alt?: string;
  ikon?: ReactNode;
}) {
  return (
    <div className="kart px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.8125rem] text-ikincil">{etiket}</p>
        {ikon && <span className="text-marka-500">{ikon}</span>}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-murekkep">{deger}</p>
      {alt && <p className="mt-1 text-[0.75rem] text-soluk">{alt}</p>}
    </div>
  );
}

export function SayfaBasligi({
  baslik,
  aciklama,
  sag,
}: {
  baslik: string;
  aciklama?: string;
  sag?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-murekkep">{baslik}</h1>
        {aciklama && <p className="mt-1 text-[0.875rem] text-ikincil">{aciklama}</p>}
      </div>
      {sag && <div className="flex flex-wrap items-center gap-2">{sag}</div>}
    </div>
  );
}

export function GeriBaglantisi({ href, metin }: { href: string; metin: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-[0.8125rem] text-ikincil hover:text-marka-700"
    >
      ← {metin}
    </Link>
  );
}

export function BilgiSatiri({ etiket, deger }: { etiket: string; deger: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-cizgi py-2 last:border-0">
      <dt className="shrink-0 text-[0.8125rem] text-ikincil">{etiket}</dt>
      <dd className="text-right text-[0.875rem] font-medium text-murekkep">
        {deger || <span className="font-normal text-soluk">—</span>}
      </dd>
    </div>
  );
}

export function Uyari({
  ton = "bilgi",
  children,
}: {
  ton?: "bilgi" | "uyari";
  children: ReactNode;
}) {
  const stil =
    ton === "uyari"
      ? "border-[#f3ddab] bg-[#fdf9ef] text-[#7a5300]"
      : "border-marka-200 bg-marka-50 text-marka-800";
  return (
    <div className={`rounded-xl border px-4 py-3 text-[0.8125rem] ${stil}`}>{children}</div>
  );
}
