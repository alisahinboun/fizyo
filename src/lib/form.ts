/** FormData okuma yardımcıları — boş dizeleri null'a çevirir. */

export function metin(fd: FormData, ad: string): string | null {
  const v = fd.get(ad);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export function zorunluMetin(fd: FormData, ad: string, etiket: string): string {
  const v = metin(fd, ad);
  if (!v) throw new Error(`${etiket} zorunludur.`);
  return v;
}

export function sayi(fd: FormData, ad: string): number | null {
  const v = metin(fd, ad);
  if (v === null) return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function tamSayi(fd: FormData, ad: string): number | null {
  const n = sayi(fd, ad);
  return n === null ? null : Math.round(n);
}

export function kutu(fd: FormData, ad: string): number {
  return fd.get(ad) ? 1 : 0;
}

export type EylemDurumu = { hata?: string; basari?: string } | null;
