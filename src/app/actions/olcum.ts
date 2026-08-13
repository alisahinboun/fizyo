"use server";

import { revalidatePath } from "next/cache";
import { yetkiGerekli } from "@/lib/auth";
import { metin, sayi, tamSayi, type EylemDurumu } from "@/lib/form";
import { olcumEkle, olcumGuncelle, olcumSil } from "@/lib/sorgular";
import { OLCUM_ALANLARI } from "@/lib/tipler";

export async function olcumKaydet(
  _onceki: EylemDurumu,
  fd: FormData,
): Promise<EylemDurumu> {
  await yetkiGerekli();

  const danisanId = Number(fd.get("patient_id"));
  if (!Number.isFinite(danisanId)) return { hata: "Danışan bulunamadı." };

  const olcumTarihi = metin(fd, "measured_on");
  if (!olcumTarihi) return { hata: "Ölçüm tarihi zorunludur." };

  const veri: Record<string, unknown> = {
    measured_on: olcumTarihi,
    notes: metin(fd, "notes"),
  };

  let doluAlanVar = false;
  for (const alan of OLCUM_ALANLARI) {
    const deger = alan.anahtar === "risser" ? tamSayi(fd, alan.anahtar) : sayi(fd, alan.anahtar);
    if (deger !== null) {
      if (alan.min !== undefined && deger < alan.min)
        return { hata: `${alan.etiket} en az ${alan.min} olabilir.` };
      if (alan.max !== undefined && deger > alan.max)
        return { hata: `${alan.etiket} en fazla ${alan.max} olabilir.` };
      doluAlanVar = true;
    }
    veri[alan.anahtar] = deger;
  }

  if (!doluAlanVar && !veri.notes)
    return { hata: "En az bir ölçüm değeri ya da not girin." };

  const idAlani = metin(fd, "id");
  if (idAlani) olcumGuncelle(Number(idAlani), veri);
  else olcumEkle(danisanId, veri);

  revalidatePath(`/panel/danisanlar/${danisanId}`);
  return { basari: idAlani ? "Ölçüm güncellendi." : "Ölçüm kaydedildi." };
}

export async function olcumKaldir(fd: FormData) {
  await yetkiGerekli();
  const id = Number(fd.get("id"));
  const danisanId = Number(fd.get("patient_id"));
  if (Number.isFinite(id)) olcumSil(id);
  revalidatePath(`/panel/danisanlar/${danisanId}`);
}
