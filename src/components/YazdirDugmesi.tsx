"use client";

import { IkonYazdir } from "@/components/Ikonlar";

export default function YazdirDugmesi({ etiket = "Yazdır" }: { etiket?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="dugme dugme-ikincil">
      <IkonYazdir width={16} height={16} /> {etiket}
    </button>
  );
}
