"use server";

import { revalidatePath } from "next/cache";
import { yetkiGerekli } from "@/lib/auth";
import type { EylemDurumu } from "@/lib/form";
import { setSettings, VARSAYILAN_AYARLAR } from "@/lib/settings";

/** Yalnızca bilinen ayar anahtarları yazılır. */
const YAZILABILIR = Object.keys(VARSAYILAN_AYARLAR);

export async function ayarlariKaydet(
  _onceki: EylemDurumu,
  fd: FormData,
): Promise<EylemDurumu> {
  await yetkiGerekli();

  const degerler: Record<string, string> = {};
  for (const anahtar of YAZILABILIR) {
    const v = fd.get(anahtar);
    if (typeof v === "string") degerler[anahtar] = v.trim();
  }

  const hafta = Number(degerler.acik_hafta_sayisi);
  if (degerler.acik_hafta_sayisi && (!Number.isFinite(hafta) || hafta < 1 || hafta > 12))
    return { hata: "Yayımlanacak hafta sayısı 1 ile 12 arasında olmalı." };

  const sure = Number(degerler.seans_suresi);
  if (degerler.seans_suresi && (!Number.isFinite(sure) || sure < 5 || sure > 240))
    return { hata: "Seans süresi 5 ile 240 dakika arasında olmalı." };

  setSettings(degerler);
  revalidatePath("/");
  revalidatePath("/panel/ayarlar");
  return { basari: "Ayarlar kaydedildi." };
}
