import { getDb } from "./db";

export type Settings = Record<string, string>;

export const VARSAYILAN_AYARLAR: Settings = {
  klinik_adi: "Skolyoz Fizyoterapi",
  uzman_adi: "Fzt. Ad Soyad",
  unvan: "Skolyoz ve Postür Fizyoterapisti",
  hero_baslik: "Skolyozda kişiye özel, ölçüme dayalı fizyoterapi",
  hero_metin:
    "Schroth temelli üç boyutlu egzersiz yaklaşımıyla, her danışman için ayrı bir program kurgulanır. Cobb açısı, gövde rotasyonu ve postür ölçümleri her kontrolde kayıt altına alınır; ilerleme grafiklerle takip edilir.",
  hakkinda_metin:
    "Skolyoz, sadece bir eğrilik değil; duruş, solunum ve günlük yaşam alışkanlıklarını birlikte etkileyen üç boyutlu bir tablodur. Değerlendirme seansında eğrilik paterni, gövde rotasyonu ve esneklik ölçülür; hedefler danışan ve ailesiyle birlikte belirlenir.",
  adres: "",
  telefon: "",
  eposta: "",
  instagram: "",
  whatsapp_numarasi: "",
  whatsapp_mesaji:
    "Merhaba, {klinik} için {tarih} {saat} saatindeki randevu slotundan randevu almak istiyorum.",
  whatsapp_genel_mesaji:
    "Merhaba, skolyoz değerlendirmesi hakkında bilgi almak istiyorum.",
  seans_suresi: "45",
  mesai_baslangic: "09:00",
  mesai_bitis: "18:00",
  acik_hafta_sayisi: "3",
  kvkk_metni:
    "Paylaştığınız kişisel ve sağlık verileri yalnızca tedavi süreci kapsamında işlenir, üçüncü kişilerle paylaşılmaz.",
};

export function getSettings(): Settings {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const stored: Settings = {};
  for (const r of rows) stored[r.key] = r.value;
  return { ...VARSAYILAN_AYARLAR, ...stored };
}

export function getSetting(key: string): string {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? VARSAYILAN_AYARLAR[key] ?? "";
}

export function setSetting(key: string, value: string) {
  getDb()
    .prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .run(key, value);
}

export function setSettings(values: Settings) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );
  db.transaction(() => {
    for (const [k, v] of Object.entries(values)) stmt.run(k, v);
  })();
}
