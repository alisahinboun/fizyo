/**
 * Örnek (demo) veri yükleyici.
 *
 *   node scripts/ornek-veri.mjs [panel-parolasi]
 *
 * Var olan kayıtları SİLER ve yerine örnek danışan, ölçüm ve randevu koyar.
 * Yalnızca deneme amaçlıdır; gerçek klinik verisiyle çalıştırmayın.
 */
import Database from "better-sqlite3";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const kok = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbYolu = process.env.DATABASE_PATH || path.join(kok, "data", "fizyo.db");
const parola = process.argv[2] || "skolyoz2026";

// Şema tanımı tek kaynaktan (src/lib/db.ts) okunur ki kopyası sürüklenmesin.
const dbKaynak = fs.readFileSync(path.join(kok, "src", "lib", "db.ts"), "utf8");
const sema = dbKaynak.match(/db\.exec\(`([\s\S]*?)`\);/)?.[1];
if (!sema) throw new Error("src/lib/db.ts içinde şema bulunamadı.");

fs.mkdirSync(path.dirname(dbYolu), { recursive: true });
const db = new Database(dbYolu);
db.pragma("foreign_keys = ON");
db.exec(sema);

const ikiHane = (n) => String(n).padStart(2, "0");
const gunAnahtari = (d) =>
  `${d.getFullYear()}-${ikiHane(d.getMonth() + 1)}-${ikiHane(d.getDate())}`;
const gunEkle = (gun, adet) => {
  const [y, a, g] = gun.split("-").map(Number);
  const d = new Date(y, a - 1, g + adet);
  return gunAnahtari(d);
};
const bugun = gunAnahtari(new Date());
const an = `${bugun}T09:00`;

/* ------------------------------------------------------------ temizlik */
db.exec("DELETE FROM measurements; DELETE FROM appointments; DELETE FROM patients;");

/* -------------------------------------------------------------- ayarlar */
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(parola, salt, 64);

const ayarlar = {
  panel_parola_hash: `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`,
  klinik_adi: "Omurga Fizyoterapi Stüdyosu",
  uzman_adi: "Fzt. Elif Yıldırım",
  unvan: "Skolyoz ve Postür Fizyoterapisti",
  telefon: "0212 555 22 11",
  eposta: "randevu@ornekklinik.com",
  adres: "Bağdat Cad. No: 120, Kadıköy / İstanbul",
  instagram: "@ornekskolyoz",
  whatsapp_numarasi: "+90 555 111 22 33",
  seans_suresi: "45",
  mesai_baslangic: "09:00",
  mesai_bitis: "18:00",
  acik_hafta_sayisi: "3",
};

const ayarStmt = db.prepare(
  "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
);
for (const [k, v] of Object.entries(ayarlar)) ayarStmt.run(k, v);

/* ------------------------------------------------------------ danışanlar */
const danisanStmt = db.prepare(`
  INSERT INTO patients (full_name, birth_date, gender, phone, email, guardian_name,
    guardian_phone, city, occupation, scoliosis_type, curve_pattern, convexity, risser,
    menarche, brace, brace_hours_target, diagnosis_date, referring_doctor, method,
    goals, medical_notes, kvkk_consent, status, created_at, updated_at)
  VALUES (@full_name, @birth_date, @gender, @phone, @email, @guardian_name,
    @guardian_phone, @city, @occupation, @scoliosis_type, @curve_pattern, @convexity,
    @risser, @menarche, @brace, @brace_hours_target, @diagnosis_date, @referring_doctor,
    @method, @goals, @medical_notes, @kvkk_consent, @status, @created_at, @updated_at)
`);

const danisanlar = [
  {
    full_name: "Zeynep Arslan",
    birth_date: "2011-04-18",
    gender: "Kadın",
    phone: "0532 111 22 33",
    email: "veli.arslan@example.com",
    guardian_name: "Serpil Arslan",
    guardian_phone: "0532 111 22 34",
    city: "İstanbul",
    occupation: "8. sınıf öğrencisi",
    scoliosis_type: "İdiyopatik (adölesan)",
    curve_pattern: "Tek torasik",
    convexity: "Sağ konveks",
    risser: 2,
    menarche: "12 yaş",
    brace: "Chêneau",
    brace_hours_target: 20,
    diagnosis_date: "2024-02-10",
    referring_doctor: "Dr. M. Kaya",
    method: "Schroth",
    goals:
      "Cobb açısının büyüme atağı boyunca stabil kalması, korse uyumunun 20 saat/gün seviyesinde tutulması.",
    medical_notes: "Ek tanı yok. Egzersiz sırasında sağ omuzda hafif yorgunluk tarifliyor.",
    kvkk_consent: 1,
  },
  {
    full_name: "Mert Doğan",
    birth_date: "2009-09-02",
    gender: "Erkek",
    phone: "0533 444 55 66",
    email: null,
    guardian_name: "Hakan Doğan",
    guardian_phone: "0533 444 55 67",
    city: "İstanbul",
    occupation: "Lise öğrencisi",
    scoliosis_type: "İdiyopatik (adölesan)",
    curve_pattern: "Çift majör",
    convexity: "Karışık",
    risser: 4,
    menarche: null,
    brace: null,
    brace_hours_target: null,
    diagnosis_date: "2023-11-05",
    referring_doctor: null,
    method: "BSPTS",
    goals: "Gövde rotasyonunun azaltılması, sırt ağrısının kontrol altına alınması.",
    medical_notes: null,
    kvkk_consent: 1,
  },
  {
    full_name: "Ayşe Kılıç",
    birth_date: "1978-06-25",
    gender: "Kadın",
    phone: "0542 777 88 99",
    email: "ayse.kilic@example.com",
    guardian_name: null,
    guardian_phone: null,
    city: "İstanbul",
    occupation: "Öğretmen",
    scoliosis_type: "Erişkin dejeneratif",
    curve_pattern: "Tek lomber",
    convexity: "Sol konveks",
    risser: 5,
    menarche: null,
    brace: null,
    brace_hours_target: null,
    diagnosis_date: "2022-03-14",
    referring_doctor: "Dr. S. Aydın",
    method: "SEAS",
    goals: "Bel ağrısının azalması, günlük yaşam aktivitelerinde bağımsızlığın korunması.",
    medical_notes: "L4-L5 dejeneratif değişiklikler. Uzun süreli ayakta durmada ağrı artıyor.",
    kvkk_consent: 1,
  },
  {
    full_name: "Elif Şahin",
    birth_date: "2013-01-30",
    gender: "Kadın",
    phone: "0505 222 33 44",
    email: null,
    guardian_name: "Nihal Şahin",
    guardian_phone: "0505 222 33 45",
    city: "Kocaeli",
    occupation: "6. sınıf öğrencisi",
    scoliosis_type: "İdiyopatik (juvenil)",
    curve_pattern: "Tek torakolomber",
    convexity: "Sol konveks",
    risser: 0,
    menarche: "yok",
    brace: "Providence (gece)",
    brace_hours_target: 8,
    diagnosis_date: "2025-05-20",
    referring_doctor: null,
    method: "Schroth",
    goals: "Büyüme döneminde eğriliğin ilerlemesinin engellenmesi.",
    medical_notes: null,
    kvkk_consent: 0,
  },
  {
    full_name: "Can Yalçın",
    birth_date: "2007-12-11",
    gender: "Erkek",
    phone: "0537 909 10 11",
    email: "can.yalcin@example.com",
    guardian_name: null,
    guardian_phone: null,
    city: "İstanbul",
    occupation: "Üniversite öğrencisi",
    scoliosis_type: "Postüral / fonksiyonel",
    curve_pattern: "Belirsiz",
    convexity: null,
    risser: 5,
    menarche: null,
    brace: null,
    brace_hours_target: null,
    diagnosis_date: null,
    referring_doctor: null,
    method: "Klinik pilates",
    goals: "Masa başı çalışmaya bağlı postür bozukluğunun düzeltilmesi.",
    medical_notes: null,
    kvkk_consent: 1,
    status: "pasif",
  },
];

const danisanIdleri = danisanlar.map((d) =>
  Number(
    danisanStmt.run({
      guardian_name: null,
      guardian_phone: null,
      email: null,
      city: null,
      occupation: null,
      convexity: null,
      menarche: null,
      brace: null,
      brace_hours_target: null,
      diagnosis_date: null,
      referring_doctor: null,
      medical_notes: null,
      status: "aktif",
      ...d,
      created_at: an,
      updated_at: an,
    }).lastInsertRowid,
  ),
);

/* ---------------------------------------------------------------- ölçüm */
const olcumStmt = db.prepare(`
  INSERT INTO measurements (patient_id, measured_on, cobb_thoracic, cobb_thoracolumbar,
    cobb_lumbar, atr_thoracic, atr_lumbar, kyphosis, lordosis, shoulder_asym, pelvis_asym,
    height_cm, sitting_height_cm, weight_kg, vas_pain, srs22, brace_hours, risser, notes, created_at)
  VALUES (@patient_id, @measured_on, @cobb_thoracic, @cobb_thoracolumbar, @cobb_lumbar,
    @atr_thoracic, @atr_lumbar, @kyphosis, @lordosis, @shoulder_asym, @pelvis_asym,
    @height_cm, @sitting_height_cm, @weight_kg, @vas_pain, @srs22, @brace_hours, @risser,
    @notes, @created_at)
`);

const bosOlcum = {
  cobb_thoracic: null,
  cobb_thoracolumbar: null,
  cobb_lumbar: null,
  atr_thoracic: null,
  atr_lumbar: null,
  kyphosis: null,
  lordosis: null,
  shoulder_asym: null,
  pelvis_asym: null,
  height_cm: null,
  sitting_height_cm: null,
  weight_kg: null,
  vas_pain: null,
  srs22: null,
  brace_hours: null,
  risser: null,
  notes: null,
};

const olcumler = [
  // Zeynep — düzenli takip, hafif iyileşme
  [0, -540, { cobb_thoracic: 32, cobb_lumbar: 18, atr_thoracic: 11, atr_lumbar: 5, kyphosis: 28, lordosis: 42, shoulder_asym: 14, pelvis_asym: 6, height_cm: 148, sitting_height_cm: 76, weight_kg: 38.5, vas_pain: 3, srs22: 3.6, brace_hours: 16, risser: 1, notes: "İlk değerlendirme. Korse yeni verildi, uyum süreci başladı." }],
  [0, -420, { cobb_thoracic: 33, cobb_lumbar: 19, atr_thoracic: 11.5, atr_lumbar: 5, kyphosis: 27, lordosis: 43, shoulder_asym: 13, pelvis_asym: 6, height_cm: 151, sitting_height_cm: 77.5, weight_kg: 40, vas_pain: 3, srs22: 3.7, brace_hours: 18, risser: 1 }],
  [0, -300, { cobb_thoracic: 31, cobb_lumbar: 18, atr_thoracic: 10, atr_lumbar: 4.5, kyphosis: 29, lordosis: 41, shoulder_asym: 11, pelvis_asym: 5, height_cm: 154, sitting_height_cm: 79, weight_kg: 42, vas_pain: 2, srs22: 3.9, brace_hours: 20, risser: 2, notes: "Korse uyumu belirgin arttı. Ev programı düzenli." }],
  [0, -180, { cobb_thoracic: 29, cobb_lumbar: 17, atr_thoracic: 9, atr_lumbar: 4, kyphosis: 30, lordosis: 40, shoulder_asym: 9, pelvis_asym: 4, height_cm: 156, sitting_height_cm: 80, weight_kg: 43.5, vas_pain: 1.5, srs22: 4.1, brace_hours: 20, risser: 2 }],
  [0, -60, { cobb_thoracic: 28, cobb_lumbar: 16, atr_thoracic: 8, atr_lumbar: 3.5, kyphosis: 31, lordosis: 40, shoulder_asym: 8, pelvis_asym: 4, height_cm: 157, sitting_height_cm: 80.5, weight_kg: 44, vas_pain: 1, srs22: 4.2, brace_hours: 21, risser: 2, notes: "Büyüme yavaşlıyor. Program üst gövde stabilizasyonuna kaydırıldı." }],

  // Mert — ağrı odaklı, rotasyon takibi
  [1, -400, { cobb_thoracic: 24, cobb_lumbar: 26, atr_thoracic: 7, atr_lumbar: 8, kyphosis: 34, lordosis: 48, height_cm: 172, weight_kg: 61, vas_pain: 5, srs22: 3.2, risser: 3, notes: "Çift majör eğrilik. Uzun oturmada ağrı." }],
  [1, -280, { cobb_thoracic: 25, cobb_lumbar: 26, atr_thoracic: 7, atr_lumbar: 7.5, kyphosis: 35, lordosis: 47, height_cm: 175, weight_kg: 63, vas_pain: 4, srs22: 3.5, risser: 4 }],
  [1, -140, { cobb_thoracic: 24, cobb_lumbar: 25, atr_thoracic: 6, atr_lumbar: 6.5, kyphosis: 36, lordosis: 46, height_cm: 177, weight_kg: 65, vas_pain: 2.5, srs22: 4.0, risser: 4 }],
  [1, -30, { cobb_thoracic: 24, cobb_lumbar: 25, atr_thoracic: 5.5, atr_lumbar: 6, kyphosis: 36, lordosis: 45, height_cm: 177, weight_kg: 65.5, vas_pain: 2, srs22: 4.2, risser: 4, notes: "Ağrı belirgin azaldı, spora dönüş planlandı." }],

  // Ayşe — erişkin, ağrı ve yaşam kalitesi
  [2, -365, { cobb_lumbar: 34, atr_lumbar: 9, lordosis: 52, pelvis_asym: 12, height_cm: 164, weight_kg: 68, vas_pain: 7, srs22: 2.8, risser: 5, notes: "Günlük ağrı şikayeti belirgin." }],
  [2, -240, { cobb_lumbar: 34, atr_lumbar: 8.5, lordosis: 50, pelvis_asym: 11, height_cm: 164, weight_kg: 67, vas_pain: 5.5, srs22: 3.1, risser: 5 }],
  [2, -120, { cobb_lumbar: 35, atr_lumbar: 8, lordosis: 49, pelvis_asym: 10, height_cm: 163.5, weight_kg: 66, vas_pain: 4, srs22: 3.5, risser: 5 }],
  [2, -20, { cobb_lumbar: 35, atr_lumbar: 8, lordosis: 48, pelvis_asym: 9, height_cm: 163.5, weight_kg: 65.5, vas_pain: 3, srs22: 3.8, risser: 5, notes: "Yürüyüş mesafesi arttı." }],

  // Elif — yeni başlayan takip
  [3, -90, { cobb_thoracolumbar: 21, atr_lumbar: 6, kyphosis: 26, lordosis: 38, height_cm: 139, sitting_height_cm: 72, weight_kg: 31, vas_pain: 0, srs22: 4.3, brace_hours: 6, risser: 0, notes: "İlk değerlendirme. Gece korsesi başlandı." }],
  [3, -15, { cobb_thoracolumbar: 20, atr_lumbar: 5.5, kyphosis: 27, lordosis: 38, height_cm: 141, sitting_height_cm: 72.5, weight_kg: 32, vas_pain: 0, srs22: 4.4, brace_hours: 8, risser: 0 }],
];

for (const [danisanIndeks, gunFarki, degerler] of olcumler) {
  olcumStmt.run({
    ...bosOlcum,
    patient_id: danisanIdleri[danisanIndeks],
    measured_on: gunEkle(bugun, gunFarki),
    ...degerler,
    created_at: an,
  });
}

/* ------------------------------------------------------------- randevu */
const randevuStmt = db.prepare(`
  INSERT OR IGNORE INTO appointments (starts_at, duration_min, status, patient_id,
    patient_name, kind, is_public, notes, created_at, updated_at)
  VALUES (?, 45, ?, ?, ?, ?, ?, NULL, ?, ?)
`);

// Bu haftanın pazartesisinden başlayarak 4 hafta, hafta içi 09:00–17:00
const pazartesi = gunEkle(bugun, -((new Date(bugun).getDay() + 6) % 7));
const saatler = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

let sayac = 0;
for (let i = 0; i < 28; i++) {
  const gun = gunEkle(pazartesi, i);
  const haftaninGunu = new Date(gun).getDay();
  if (haftaninGunu === 0 || haftaninGunu === 6) continue; // hafta sonu kapalı

  for (const saat of saatler) {
    sayac++;
    const gecmis = gun < bugun;
    // Yaklaşık her üçüncü slot dolu; geçmiş günlerin tamamı geçmiş randevu sayılır.
    const dolu = gecmis || sayac % 3 === 0;
    const danisanId = dolu ? danisanIdleri[sayac % 4] : null;
    randevuStmt.run(
      `${gun}T${saat}`,
      dolu ? "dolu" : "bos",
      danisanId,
      null,
      sayac % 7 === 0 ? "degerlendirme" : "seans",
      dolu ? 0 : 1,
      an,
      an,
    );
  }
}

// Bir günü izinli işaretleyelim
db.prepare(
  "UPDATE appointments SET status = 'kapali', patient_id = NULL, is_public = 0 WHERE starts_at LIKE ?",
).run(`${gunEkle(pazartesi, 10)}T%`);

const say = (t) => db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n;
console.log(`✓ Örnek veri yüklendi: ${dbYolu}`);
console.log(`  danışan: ${say("patients")} · ölçüm: ${say("measurements")} · randevu: ${say("appointments")}`);
console.log(`  panel parolası: ${parola}`);
