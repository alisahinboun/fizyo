"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { yetkiGerekli } from "@/lib/auth";
import { kutu, metin, sayi, tamSayi, type EylemDurumu } from "@/lib/form";
import { danisanEkle, danisanGuncelle, danisanSil } from "@/lib/sorgular";

function formuOku(fd: FormData) {
  return {
    full_name: metin(fd, "full_name") ?? "",
    birth_date: metin(fd, "birth_date"),
    gender: metin(fd, "gender"),
    phone: metin(fd, "phone"),
    email: metin(fd, "email"),
    guardian_name: metin(fd, "guardian_name"),
    guardian_phone: metin(fd, "guardian_phone"),
    city: metin(fd, "city"),
    occupation: metin(fd, "occupation"),
    scoliosis_type: metin(fd, "scoliosis_type"),
    curve_pattern: metin(fd, "curve_pattern"),
    convexity: metin(fd, "convexity"),
    risser: tamSayi(fd, "risser"),
    menarche: metin(fd, "menarche"),
    brace: metin(fd, "brace"),
    brace_hours_target: sayi(fd, "brace_hours_target"),
    diagnosis_date: metin(fd, "diagnosis_date"),
    referring_doctor: metin(fd, "referring_doctor"),
    method: metin(fd, "method"),
    goals: metin(fd, "goals"),
    medical_notes: metin(fd, "medical_notes"),
    kvkk_consent: kutu(fd, "kvkk_consent"),
    status: metin(fd, "status") ?? "aktif",
  };
}

export async function danisanKaydet(
  _onceki: EylemDurumu,
  fd: FormData,
): Promise<EylemDurumu> {
  await yetkiGerekli();

  const veri = formuOku(fd);
  if (!veri.full_name) return { hata: "Ad soyad zorunludur." };

  const idAlani = metin(fd, "id");
  let id: number;
  if (idAlani) {
    id = Number(idAlani);
    danisanGuncelle(id, veri);
  } else {
    id = danisanEkle(veri);
  }

  revalidatePath("/panel/danisanlar");
  revalidatePath(`/panel/danisanlar/${id}`);
  redirect(`/panel/danisanlar/${id}`);
}

export async function danisanKaldir(fd: FormData) {
  await yetkiGerekli();
  const id = Number(fd.get("id"));
  if (Number.isFinite(id)) danisanSil(id);
  revalidatePath("/panel/danisanlar");
  redirect("/panel/danisanlar");
}

export async function danisanDurumuDegistir(fd: FormData) {
  await yetkiGerekli();
  const id = Number(fd.get("id"));
  const durum = String(fd.get("status") ?? "aktif");
  if (Number.isFinite(id)) danisanGuncelle(id, { status: durum });
  revalidatePath(`/panel/danisanlar/${id}`);
  revalidatePath("/panel/danisanlar");
}
