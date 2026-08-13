import { tarihGunlu, zamaniAyir } from "./tarih";

/** '+90 (532) 111 22 33' -> '905321112233' */
export function numarayiNormalle(ham: string): string {
  const rakamlar = (ham || "").replace(/\D/g, "");
  if (!rakamlar) return "";
  if (rakamlar.startsWith("90")) return rakamlar;
  if (rakamlar.startsWith("0")) return `90${rakamlar.slice(1)}`;
  if (rakamlar.length === 10) return `90${rakamlar}`;
  return rakamlar;
}

export function mesajiDoldur(
  sablon: string,
  degerler: { tarih?: string; saat?: string; gun?: string; klinik?: string; uzman?: string },
): string {
  return sablon
    .replaceAll("{tarih}", degerler.tarih ?? "")
    .replaceAll("{saat}", degerler.saat ?? "")
    .replaceAll("{gun}", degerler.gun ?? "")
    .replaceAll("{klinik}", degerler.klinik ?? "")
    .replaceAll("{uzman}", degerler.uzman ?? "");
}

export function whatsappBaglantisi(numara: string, mesaj: string): string {
  const n = numarayiNormalle(numara);
  const metin = encodeURIComponent(mesaj);
  return n ? `https://wa.me/${n}?text=${metin}` : `https://wa.me/?text=${metin}`;
}

/** Bir slot için hazır WhatsApp bağlantısı üretir. */
export function slotIcinBaglanti(
  numara: string,
  sablon: string,
  baslangic: string,
  klinik: string,
  uzman: string,
): string {
  const { gun, saat } = zamaniAyir(baslangic);
  return whatsappBaglantisi(
    numara,
    mesajiDoldur(sablon, { tarih: tarihGunlu(gun), saat, gun, klinik, uzman }),
  );
}
