export type Danisan = {
  id: number;
  full_name: string;
  birth_date: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  city: string | null;
  occupation: string | null;
  scoliosis_type: string | null;
  curve_pattern: string | null;
  convexity: string | null;
  risser: number | null;
  menarche: string | null;
  brace: string | null;
  brace_hours_target: number | null;
  diagnosis_date: string | null;
  referring_doctor: string | null;
  method: string | null;
  goals: string | null;
  medical_notes: string | null;
  kvkk_consent: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Olcum = {
  id: number;
  patient_id: number;
  measured_on: string;
  cobb_thoracic: number | null;
  cobb_thoracolumbar: number | null;
  cobb_lumbar: number | null;
  atr_thoracic: number | null;
  atr_lumbar: number | null;
  kyphosis: number | null;
  lordosis: number | null;
  shoulder_asym: number | null;
  pelvis_asym: number | null;
  height_cm: number | null;
  sitting_height_cm: number | null;
  weight_kg: number | null;
  vas_pain: number | null;
  srs22: number | null;
  brace_hours: number | null;
  risser: number | null;
  notes: string | null;
  created_at: string;
};

export type RandevuDurumu = "bos" | "dolu" | "kapali";

export type Randevu = {
  id: number;
  starts_at: string;
  duration_min: number;
  status: RandevuDurumu;
  patient_id: number | null;
  patient_name: string | null;
  kind: string;
  is_public: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RandevuDetayli = Randevu & { danisan_adi: string | null };

export const SKOLYOZ_TIPLERI = [
  "İdiyopatik (adölesan)",
  "İdiyopatik (juvenil)",
  "İdiyopatik (infantil)",
  "Erişkin dejeneratif",
  "Konjenital",
  "Nöromusküler",
  "Sindromik",
  "Postüral / fonksiyonel",
  "Diğer",
] as const;

export const EGRILIK_PATERNLERI = [
  "Tek torasik",
  "Tek torakolomber",
  "Tek lomber",
  "Çift majör",
  "Çift torasik",
  "Üçlü eğrilik",
  "Belirsiz",
] as const;

export const KONVEKSITE = ["Sağ konveks", "Sol konveks", "Karışık"] as const;

export const YONTEMLER = [
  "Schroth",
  "SEAS",
  "BSPTS",
  "Side-shift",
  "Dobomed",
  "Klinik pilates",
  "Karma program",
] as const;

export const RANDEVU_TURLERI = [
  { deger: "degerlendirme", etiket: "İlk değerlendirme" },
  { deger: "seans", etiket: "Egzersiz seansı" },
  { deger: "kontrol", etiket: "Kontrol / ölçüm" },
  { deger: "online", etiket: "Online seans" },
] as const;

export function randevuTuruEtiketi(deger: string): string {
  return RANDEVU_TURLERI.find((t) => t.deger === deger)?.etiket ?? deger;
}

/** Ölçüm formunda ve grafiklerde kullanılan alan tanımları. */
export type OlcumAlani = {
  anahtar: keyof Olcum;
  etiket: string;
  birim: string;
  grup: "Cobb açısı" | "Rotasyon & postür" | "Antropometri" | "Klinik durum";
  adim?: string;
  min?: number;
  max?: number;
  ipucu?: string;
};

export const OLCUM_ALANLARI: OlcumAlani[] = [
  { anahtar: "cobb_thoracic", etiket: "Cobb — torakal", birim: "°", grup: "Cobb açısı", adim: "0.1", min: 0, max: 130 },
  { anahtar: "cobb_thoracolumbar", etiket: "Cobb — torakolomber", birim: "°", grup: "Cobb açısı", adim: "0.1", min: 0, max: 130 },
  { anahtar: "cobb_lumbar", etiket: "Cobb — lomber", birim: "°", grup: "Cobb açısı", adim: "0.1", min: 0, max: 130 },
  { anahtar: "atr_thoracic", etiket: "ATR — torakal", birim: "°", grup: "Rotasyon & postür", adim: "0.5", min: 0, max: 40, ipucu: "Skolyometre ile Adams testi" },
  { anahtar: "atr_lumbar", etiket: "ATR — lomber", birim: "°", grup: "Rotasyon & postür", adim: "0.5", min: 0, max: 40 },
  { anahtar: "kyphosis", etiket: "Torakal kifoz", birim: "°", grup: "Rotasyon & postür", adim: "0.5", min: 0, max: 120 },
  { anahtar: "lordosis", etiket: "Lomber lordoz", birim: "°", grup: "Rotasyon & postür", adim: "0.5", min: 0, max: 120 },
  { anahtar: "shoulder_asym", etiket: "Omuz asimetrisi", birim: "mm", grup: "Rotasyon & postür", adim: "1", min: 0, max: 100 },
  { anahtar: "pelvis_asym", etiket: "Pelvis asimetrisi", birim: "mm", grup: "Rotasyon & postür", adim: "1", min: 0, max: 100 },
  { anahtar: "height_cm", etiket: "Boy", birim: "cm", grup: "Antropometri", adim: "0.1", min: 40, max: 230 },
  { anahtar: "sitting_height_cm", etiket: "Oturma yüksekliği", birim: "cm", grup: "Antropometri", adim: "0.1", min: 30, max: 130 },
  { anahtar: "weight_kg", etiket: "Kilo", birim: "kg", grup: "Antropometri", adim: "0.1", min: 5, max: 250 },
  { anahtar: "vas_pain", etiket: "Ağrı (VAS)", birim: "/10", grup: "Klinik durum", adim: "0.5", min: 0, max: 10 },
  { anahtar: "srs22", etiket: "SRS-22r", birim: "/5", grup: "Klinik durum", adim: "0.1", min: 1, max: 5 },
  { anahtar: "brace_hours", etiket: "Korse kullanımı", birim: "sa/gün", grup: "Klinik durum", adim: "0.5", min: 0, max: 24 },
  { anahtar: "risser", etiket: "Risser evresi", birim: "", grup: "Klinik durum", adim: "1", min: 0, max: 5 },
];
