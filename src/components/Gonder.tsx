"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function GonderDugmesi({
  children,
  bekleyen,
  className = "dugme dugme-birincil",
}: {
  children: ReactNode;
  bekleyen?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? (bekleyen ?? "Kaydediliyor…") : children}
    </button>
  );
}

/** Onay isteyen tek düğmelik form aksiyonları için. */
export function OnayliDugme({
  children,
  soru,
  className = "dugme dugme-sessiz",
  title,
}: {
  children: ReactNode;
  soru: string;
  className?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      title={title}
      disabled={pending}
      onClick={(e) => {
        if (!confirm(soru)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function Bildirim({ durum }: { durum: { hata?: string; basari?: string } | null }) {
  if (!durum?.hata && !durum?.basari) return null;
  const hata = Boolean(durum.hata);
  return (
    <p
      role="status"
      className={`rounded-lg border px-3 py-2 text-[0.8125rem] ${
        hata
          ? "border-[#f2c4c4] bg-[#fdecec] text-[#a52626]"
          : "border-[#c3e6c3] bg-[#eaf7ea] text-[#0a6b0a]"
      }`}
    >
      {hata ? durum.hata : durum.basari}
    </p>
  );
}
