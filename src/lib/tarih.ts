/**
 * Tek klinikli bir uygulama olduğu için tüm zamanlar "duvar saati" olarak,
 * yani `YYYY-MM-DDTHH:mm` biçiminde metin olarak saklanır. Böylece sunucu
 * saat dilimi ile tarayıcı saat dilimi arasındaki kaymalar oluşmaz.
 */

export const GUNLER = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
] as const;

export const GUNLER_KISA = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] as const;

export const AYLAR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

export function ikiHane(n: number): string {
  return String(n).padStart(2, "0");
}

/** Date -> 'YYYY-MM-DD' (yerel) */
export function gunAnahtari(d: Date): string {
  return `${d.getFullYear()}-${ikiHane(d.getMonth() + 1)}-${ikiHane(d.getDate())}`;
}

/** 'YYYY-MM-DD' -> Date (yerel gece yarısı) */
export function gunuCoz(gun: string): Date {
  const [y, a, g] = gun.split("-").map(Number);
  return new Date(y, (a || 1) - 1, g || 1);
}

/** 'YYYY-MM-DDTHH:mm' -> { gun, saat } */
export function zamaniAyir(zaman: string): { gun: string; saat: string } {
  const [gun, saat = "00:00"] = zaman.split("T");
  return { gun, saat: saat.slice(0, 5) };
}

export function bugun(): string {
  return gunAnahtari(new Date());
}

export function simdi(): string {
  const d = new Date();
  return `${gunAnahtari(d)}T${ikiHane(d.getHours())}:${ikiHane(d.getMinutes())}`;
}

export function gunEkle(gun: string, adet: number): string {
  const d = gunuCoz(gun);
  d.setDate(d.getDate() + adet);
  return gunAnahtari(d);
}

/** Haftanın pazartesisi */
export function haftaBasi(gun: string): string {
  const d = gunuCoz(gun);
  const fark = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - fark);
  return gunAnahtari(d);
}

/** '2026-08-15' -> '15 Ağustos 2026' */
export function tarihUzun(gun: string): string {
  if (!gun) return "—";
  const d = gunuCoz(gun);
  return `${d.getDate()} ${AYLAR[d.getMonth()]} ${d.getFullYear()}`;
}

/** '2026-08-15' -> '15 Ağustos Cumartesi' */
export function tarihGunlu(gun: string): string {
  if (!gun) return "—";
  const d = gunuCoz(gun);
  return `${d.getDate()} ${AYLAR[d.getMonth()]} ${GUNLER[d.getDay()]}`;
}

/** '2026-08-15' -> '15.08.2026' */
export function tarihKisa(gun: string): string {
  if (!gun) return "—";
  const [y, a, g] = gun.split("-");
  return `${g}.${a}.${y}`;
}

export function gunAdi(gun: string): string {
  return GUNLER[gunuCoz(gun).getDay()];
}

export function yasHesapla(dogumTarihi?: string | null): number | null {
  if (!dogumTarihi) return null;
  const d = gunuCoz(dogumTarihi);
  const bugunD = new Date();
  let yas = bugunD.getFullYear() - d.getFullYear();
  const ayFark = bugunD.getMonth() - d.getMonth();
  if (ayFark < 0 || (ayFark === 0 && bugunD.getDate() < d.getDate())) yas--;
  return yas >= 0 && yas < 130 ? yas : null;
}

/** İki 'HH:mm' arasına, verilen adımla saat üretir. */
export function saatAraligi(baslangic: string, bitis: string, adimDk: number): string[] {
  const dk = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const sonuc: string[] = [];
  const son = dk(bitis);
  for (let t = dk(baslangic); t + adimDk <= son; t += adimDk) {
    sonuc.push(`${ikiHane(Math.floor(t / 60))}:${ikiHane(t % 60)}`);
  }
  return sonuc;
}

export function saatEkle(saat: string, dakika: number): string {
  const [h, m] = saat.split(":").map(Number);
  const t = h * 60 + m + dakika;
  return `${ikiHane(Math.floor(t / 60) % 24)}:${ikiHane(t % 60)}`;
}

/** Göreli ifade: "bugün", "yarın", "3 gün sonra" */
export function goreli(gun: string): string {
  const fark = Math.round(
    (gunuCoz(gun).getTime() - gunuCoz(bugun()).getTime()) / 86_400_000,
  );
  if (fark === 0) return "bugün";
  if (fark === 1) return "yarın";
  if (fark === -1) return "dün";
  if (fark > 1) return `${fark} gün sonra`;
  return `${Math.abs(fark)} gün önce`;
}
