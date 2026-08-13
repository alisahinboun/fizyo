"use server";

import { revalidatePath } from "next/cache";
import { yetkiGerekli } from "@/lib/auth";
import { metin, tamSayi, type EylemDurumu } from "@/lib/form";
import {
  bosSlotlariSil,
  randevuEkle,
  randevuGuncelle,
  randevuSil,
  slotlariUret,
} from "@/lib/sorgular";
import { gunEkle, gunuCoz, saatAraligi } from "@/lib/tarih";

function tazele() {
  revalidatePath("/panel/randevular");
  revalidatePath("/panel");
  revalidatePath("/");
}

/** Tek bir slot ekler. */
export async function slotEkle(_onceki: EylemDurumu, fd: FormData): Promise<EylemDurumu> {
  await yetkiGerekli();

  const gun = metin(fd, "gun");
  const saat = metin(fd, "saat");
  if (!gun || !saat) return { hata: "Tarih ve saat zorunludur." };

  try {
    randevuEkle({
      starts_at: `${gun}T${saat}`,
      duration_min: tamSayi(fd, "duration_min") ?? 45,
      kind: metin(fd, "kind") ?? "seans",
      status: metin(fd, "status") ?? "bos",
      patient_id: tamSayi(fd, "patient_id"),
      patient_name: metin(fd, "patient_name"),
      notes: metin(fd, "notes"),
      is_public: fd.get("is_public") ? 1 : 0,
    });
  } catch {
    return { hata: "Bu saatte zaten bir kayıt var." };
  }

  tazele();
  return { basari: "Slot eklendi." };
}

/**
 * Bir tarih aralığında, seçilen haftanın günlerine ve saat aralığına göre
 * toplu boş slot üretir. Var olan saatler atlanır.
 */
export async function slotlariTopluUret(
  _onceki: EylemDurumu,
  fd: FormData,
): Promise<EylemDurumu> {
  await yetkiGerekli();

  const baslangic = metin(fd, "baslangic");
  const bitis = metin(fd, "bitis");
  const mesaiBaslangic = metin(fd, "mesai_baslangic") ?? "09:00";
  const mesaiBitis = metin(fd, "mesai_bitis") ?? "18:00";
  const sure = tamSayi(fd, "duration_min") ?? 45;
  const tur = metin(fd, "kind") ?? "seans";
  const gunNumaralari = fd.getAll("haftaninGunleri").map((g) => Number(g));

  if (!baslangic || !bitis) return { hata: "Başlangıç ve bitiş tarihi zorunludur." };
  if (bitis < baslangic) return { hata: "Bitiş tarihi başlangıçtan önce olamaz." };
  if (gunNumaralari.length === 0) return { hata: "En az bir gün seçin." };
  if (sure < 5 || sure > 240) return { hata: "Seans süresi 5–240 dakika arasında olmalı." };
  if (mesaiBitis <= mesaiBaslangic) return { hata: "Mesai bitişi başlangıçtan sonra olmalı." };

  const saatler = saatAraligi(mesaiBaslangic, mesaiBitis, sure);
  if (saatler.length === 0) return { hata: "Seçilen aralığa hiç slot sığmıyor." };

  const gunler: string[] = [];
  for (let g = baslangic; g <= bitis; g = gunEkle(g, 1)) {
    if (gunNumaralari.includes(gunuCoz(g).getDay())) gunler.push(g);
    if (gunler.length > 400) break;
  }
  if (gunler.length === 0) return { hata: "Aralıkta seçilen günlerden hiç yok." };

  const eklenen = slotlariUret(gunler, saatler, sure, tur);
  tazele();
  return {
    basari:
      eklenen > 0
        ? `${eklenen} slot eklendi. (${gunler.length} gün × ${saatler.length} saat)`
        : "Yeni slot eklenmedi; bu saatler zaten tanımlı.",
  };
}

/** Slot durumunu değiştirir: boş ↔ dolu ↔ kapalı. */
export async function randevuDurumunuAyarla(fd: FormData) {
  await yetkiGerekli();
  const id = Number(fd.get("id"));
  const durum = String(fd.get("status") ?? "bos");
  if (!Number.isFinite(id)) return;

  const guncelleme: Record<string, unknown> = { status: durum };
  if (durum !== "dolu") {
    guncelleme.patient_id = null;
    guncelleme.patient_name = null;
  }
  randevuGuncelle(id, guncelleme);
  tazele();
}

export async function randevuKaydet(
  _onceki: EylemDurumu,
  fd: FormData,
): Promise<EylemDurumu> {
  await yetkiGerekli();

  const id = Number(fd.get("id"));
  if (!Number.isFinite(id)) return { hata: "Randevu bulunamadı." };

  const gun = metin(fd, "gun");
  const saat = metin(fd, "saat");
  const durum = metin(fd, "status") ?? "bos";
  const danisanId = tamSayi(fd, "patient_id");

  try {
    randevuGuncelle(id, {
      ...(gun && saat ? { starts_at: `${gun}T${saat}` } : {}),
      duration_min: tamSayi(fd, "duration_min") ?? 45,
      status: durum as never,
      kind: metin(fd, "kind") ?? "seans",
      patient_id: durum === "dolu" ? danisanId : null,
      patient_name: durum === "dolu" ? metin(fd, "patient_name") : null,
      notes: metin(fd, "notes"),
      is_public: fd.get("is_public") ? 1 : 0,
    });
  } catch {
    return { hata: "Bu saatte başka bir kayıt var." };
  }

  tazele();
  return { basari: "Randevu güncellendi." };
}

export async function randevuKaldir(fd: FormData) {
  await yetkiGerekli();
  const id = Number(fd.get("id"));
  if (Number.isFinite(id)) randevuSil(id);
  tazele();
}

export async function bosSlotlariTemizle(
  _onceki: EylemDurumu,
  fd: FormData,
): Promise<EylemDurumu> {
  await yetkiGerekli();
  const baslangic = metin(fd, "baslangic");
  const bitis = metin(fd, "bitis");
  if (!baslangic || !bitis) return { hata: "Tarih aralığı zorunludur." };

  const silinen = bosSlotlariSil(baslangic, bitis);
  tazele();
  return { basari: `${silinen} boş slot silindi. Dolu randevulara dokunulmadı.` };
}
