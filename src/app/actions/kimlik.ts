"use server";

import { redirect } from "next/navigation";
import {
  girisYapilmisMi,
  kurulumTamamMi,
  oturumAc,
  oturumKapat,
  parolaKaydet,
  parolaKontrol,
} from "@/lib/auth";
import type { EylemDurumu } from "@/lib/form";

export async function kurulumYap(
  _onceki: EylemDurumu,
  fd: FormData,
): Promise<EylemDurumu> {
  if (kurulumTamamMi()) return { hata: "Kurulum daha önce tamamlanmış." };

  const parola = String(fd.get("parola") ?? "");
  const tekrar = String(fd.get("parola_tekrar") ?? "");

  if (parola.length < 8) return { hata: "Parola en az 8 karakter olmalı." };
  if (parola !== tekrar) return { hata: "Parolalar birbiriyle eşleşmiyor." };

  parolaKaydet(parola);
  await oturumAc();
  redirect("/panel");
}

export async function girisYap(
  _onceki: EylemDurumu,
  fd: FormData,
): Promise<EylemDurumu> {
  const parola = String(fd.get("parola") ?? "");
  if (!parolaKontrol(parola)) return { hata: "Parola hatalı." };
  await oturumAc();
  redirect("/panel");
}

export async function cikisYap() {
  await oturumKapat();
  redirect("/");
}

export async function parolaDegistir(
  _onceki: EylemDurumu,
  fd: FormData,
): Promise<EylemDurumu> {
  if (!(await girisYapilmisMi())) return { hata: "Oturum bulunamadı." };

  const mevcut = String(fd.get("mevcut_parola") ?? "");
  const yeni = String(fd.get("yeni_parola") ?? "");
  const tekrar = String(fd.get("yeni_parola_tekrar") ?? "");

  if (!parolaKontrol(mevcut)) return { hata: "Mevcut parola hatalı." };
  if (yeni.length < 8) return { hata: "Yeni parola en az 8 karakter olmalı." };
  if (yeni !== tekrar) return { hata: "Yeni parolalar eşleşmiyor." };

  parolaKaydet(yeni);
  return { basari: "Parola güncellendi." };
}
