import { getDb } from "./db";
import { bugun, gunEkle, simdi } from "./tarih";
import type { Danisan, Olcum, Randevu, RandevuDetayli } from "./tipler";

/* -------------------------------------------------------------- danışan */

export function danisanlariListele(arama = "", durum = "aktif"): Danisan[] {
  const db = getDb();
  const kosullar: string[] = [];
  const parametreler: unknown[] = [];

  if (durum && durum !== "hepsi") {
    kosullar.push("status = ?");
    parametreler.push(durum);
  }
  if (arama.trim()) {
    kosullar.push("(full_name LIKE ? OR phone LIKE ? OR email LIKE ?)");
    const q = `%${arama.trim()}%`;
    parametreler.push(q, q, q);
  }
  const where = kosullar.length ? `WHERE ${kosullar.join(" AND ")}` : "";
  return db
    .prepare(`SELECT * FROM patients ${where} ORDER BY full_name COLLATE NOCASE`)
    .all(...parametreler) as Danisan[];
}

export function danisanGetir(id: number): Danisan | undefined {
  return getDb().prepare("SELECT * FROM patients WHERE id = ?").get(id) as
    | Danisan
    | undefined;
}

export function danisanOzetleri(): { id: number; full_name: string }[] {
  return getDb()
    .prepare(
      "SELECT id, full_name FROM patients WHERE status = 'aktif' ORDER BY full_name COLLATE NOCASE",
    )
    .all() as { id: number; full_name: string }[];
}

export function danisanEkle(veri: Partial<Danisan>): number {
  const db = getDb();
  const an = simdi();
  const sonuc = db
    .prepare(
      `INSERT INTO patients (
        full_name, birth_date, gender, phone, email, guardian_name, guardian_phone,
        city, occupation, scoliosis_type, curve_pattern, convexity, risser, menarche,
        brace, brace_hours_target, diagnosis_date, referring_doctor, method, goals,
        medical_notes, kvkk_consent, status, created_at, updated_at
      ) VALUES (
        @full_name, @birth_date, @gender, @phone, @email, @guardian_name, @guardian_phone,
        @city, @occupation, @scoliosis_type, @curve_pattern, @convexity, @risser, @menarche,
        @brace, @brace_hours_target, @diagnosis_date, @referring_doctor, @method, @goals,
        @medical_notes, @kvkk_consent, @status, @created_at, @updated_at
      )`,
    )
    .run({ ...bosDanisan(), ...temizle(veri), created_at: an, updated_at: an });
  return Number(sonuc.lastInsertRowid);
}

export function danisanGuncelle(id: number, veri: Partial<Danisan>) {
  const mevcut = danisanGetir(id);
  if (!mevcut) throw new Error("Danışan bulunamadı");
  getDb()
    .prepare(
      `UPDATE patients SET
        full_name=@full_name, birth_date=@birth_date, gender=@gender, phone=@phone,
        email=@email, guardian_name=@guardian_name, guardian_phone=@guardian_phone,
        city=@city, occupation=@occupation, scoliosis_type=@scoliosis_type,
        curve_pattern=@curve_pattern, convexity=@convexity, risser=@risser,
        menarche=@menarche, brace=@brace, brace_hours_target=@brace_hours_target,
        diagnosis_date=@diagnosis_date, referring_doctor=@referring_doctor,
        method=@method, goals=@goals, medical_notes=@medical_notes,
        kvkk_consent=@kvkk_consent, status=@status, updated_at=@updated_at
       WHERE id=@id`,
    )
    .run({ ...mevcut, ...temizle(veri), id, updated_at: simdi() });
}

export function danisanSil(id: number) {
  getDb().prepare("DELETE FROM patients WHERE id = ?").run(id);
}

function bosDanisan() {
  return {
    full_name: "",
    birth_date: null,
    gender: null,
    phone: null,
    email: null,
    guardian_name: null,
    guardian_phone: null,
    city: null,
    occupation: null,
    scoliosis_type: null,
    curve_pattern: null,
    convexity: null,
    risser: null,
    menarche: null,
    brace: null,
    brace_hours_target: null,
    diagnosis_date: null,
    referring_doctor: null,
    method: null,
    goals: null,
    medical_notes: null,
    kvkk_consent: 0,
    status: "aktif",
  };
}

/** undefined değerleri atar; better-sqlite3 undefined bağlamayı reddeder. */
function temizle<T extends object>(veri: T): Partial<T> {
  const sonuc: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(veri)) if (v !== undefined) sonuc[k] = v;
  return sonuc as Partial<T>;
}

/* ---------------------------------------------------------------- ölçüm */

export function olcumleriListele(danisanId: number): Olcum[] {
  return getDb()
    .prepare(
      "SELECT * FROM measurements WHERE patient_id = ? ORDER BY measured_on ASC, id ASC",
    )
    .all(danisanId) as Olcum[];
}

export function olcumGetir(id: number): Olcum | undefined {
  return getDb().prepare("SELECT * FROM measurements WHERE id = ?").get(id) as
    | Olcum
    | undefined;
}

const OLCUM_SUTUNLARI = [
  "cobb_thoracic",
  "cobb_thoracolumbar",
  "cobb_lumbar",
  "atr_thoracic",
  "atr_lumbar",
  "kyphosis",
  "lordosis",
  "shoulder_asym",
  "pelvis_asym",
  "height_cm",
  "sitting_height_cm",
  "weight_kg",
  "vas_pain",
  "srs22",
  "brace_hours",
  "risser",
] as const;

export function olcumEkle(danisanId: number, veri: Record<string, unknown>): number {
  const satir: Record<string, unknown> = {
    patient_id: danisanId,
    measured_on: veri.measured_on || bugun(),
    notes: veri.notes ?? null,
    created_at: simdi(),
  };
  for (const s of OLCUM_SUTUNLARI) satir[s] = veri[s] ?? null;
  const sonuc = getDb()
    .prepare(
      `INSERT INTO measurements (patient_id, measured_on, ${OLCUM_SUTUNLARI.join(", ")}, notes, created_at)
       VALUES (@patient_id, @measured_on, ${OLCUM_SUTUNLARI.map((s) => `@${s}`).join(", ")}, @notes, @created_at)`,
    )
    .run(satir);
  return Number(sonuc.lastInsertRowid);
}

export function olcumGuncelle(id: number, veri: Record<string, unknown>) {
  const mevcut = olcumGetir(id);
  if (!mevcut) throw new Error("Ölçüm bulunamadı");
  const satir: Record<string, unknown> = {
    id,
    measured_on: veri.measured_on || mevcut.measured_on,
    notes: veri.notes ?? null,
  };
  for (const s of OLCUM_SUTUNLARI) satir[s] = veri[s] ?? null;
  getDb()
    .prepare(
      `UPDATE measurements SET measured_on=@measured_on, notes=@notes,
       ${OLCUM_SUTUNLARI.map((s) => `${s}=@${s}`).join(", ")} WHERE id=@id`,
    )
    .run(satir);
}

export function olcumSil(id: number) {
  getDb().prepare("DELETE FROM measurements WHERE id = ?").run(id);
}

/* -------------------------------------------------------------- randevu */

export function randevulariListele(
  baslangicGun: string,
  bitisGun: string,
): RandevuDetayli[] {
  return getDb()
    .prepare(
      `SELECT a.*, p.full_name AS danisan_adi
       FROM appointments a LEFT JOIN patients p ON p.id = a.patient_id
       WHERE a.starts_at >= ? AND a.starts_at < ?
       ORDER BY a.starts_at ASC`,
    )
    .all(`${baslangicGun}T00:00`, `${gunEkle(bitisGun, 1)}T00:00`) as RandevuDetayli[];
}

/** Herkese açık sayfada gösterilecek boş slotlar. */
export function acikSlotlar(haftaSayisi: number): RandevuDetayli[] {
  const son = gunEkle(bugun(), haftaSayisi * 7);
  return getDb()
    .prepare(
      `SELECT a.*, NULL AS danisan_adi FROM appointments a
       WHERE a.status = 'bos' AND a.is_public = 1
         AND a.starts_at >= ? AND a.starts_at < ?
       ORDER BY a.starts_at ASC`,
    )
    .all(simdi(), `${son}T00:00`) as RandevuDetayli[];
}

export function randevuGetir(id: number): RandevuDetayli | undefined {
  return getDb()
    .prepare(
      `SELECT a.*, p.full_name AS danisan_adi FROM appointments a
       LEFT JOIN patients p ON p.id = a.patient_id WHERE a.id = ?`,
    )
    .get(id) as RandevuDetayli | undefined;
}

export function danisanRandevulari(danisanId: number): Randevu[] {
  return getDb()
    .prepare(
      "SELECT * FROM appointments WHERE patient_id = ? ORDER BY starts_at DESC LIMIT 100",
    )
    .all(danisanId) as Randevu[];
}

export function randevuEkle(veri: {
  starts_at: string;
  duration_min?: number;
  status?: string;
  patient_id?: number | null;
  patient_name?: string | null;
  kind?: string;
  is_public?: number;
  notes?: string | null;
}): number {
  const an = simdi();
  const sonuc = getDb()
    .prepare(
      `INSERT INTO appointments (starts_at, duration_min, status, patient_id, patient_name, kind, is_public, notes, created_at, updated_at)
       VALUES (@starts_at, @duration_min, @status, @patient_id, @patient_name, @kind, @is_public, @notes, @created_at, @updated_at)`,
    )
    .run({
      starts_at: veri.starts_at,
      duration_min: veri.duration_min ?? 45,
      status: veri.status ?? "bos",
      patient_id: veri.patient_id ?? null,
      patient_name: veri.patient_name ?? null,
      kind: veri.kind ?? "seans",
      is_public: veri.is_public ?? 1,
      notes: veri.notes ?? null,
      created_at: an,
      updated_at: an,
    });
  return Number(sonuc.lastInsertRowid);
}

/** Aynı saatte kayıt varsa atlar; eklenen slot sayısını döner. */
export function slotlariUret(
  gunler: string[],
  saatler: string[],
  sureDk: number,
  tur: string,
): number {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO appointments
     (starts_at, duration_min, status, kind, is_public, created_at, updated_at)
     VALUES (?, ?, 'bos', ?, 1, ?, ?)`,
  );
  const an = simdi();
  let eklenen = 0;
  db.transaction(() => {
    for (const gun of gunler) {
      for (const saat of saatler) {
        const sonuc = stmt.run(`${gun}T${saat}`, sureDk, tur, an, an);
        eklenen += sonuc.changes;
      }
    }
  })();
  return eklenen;
}

export function randevuGuncelle(id: number, veri: Partial<Randevu>) {
  const mevcut = randevuGetir(id);
  if (!mevcut) throw new Error("Randevu bulunamadı");
  const yeni = { ...mevcut, ...temizle(veri), id, updated_at: simdi() };
  getDb()
    .prepare(
      `UPDATE appointments SET starts_at=@starts_at, duration_min=@duration_min,
        status=@status, patient_id=@patient_id, patient_name=@patient_name,
        kind=@kind, is_public=@is_public, notes=@notes, updated_at=@updated_at
       WHERE id=@id`,
    )
    .run({
      starts_at: yeni.starts_at,
      duration_min: yeni.duration_min,
      status: yeni.status,
      patient_id: yeni.patient_id,
      patient_name: yeni.patient_name,
      kind: yeni.kind,
      is_public: yeni.is_public,
      notes: yeni.notes,
      updated_at: yeni.updated_at,
      id,
    });
}

export function randevuSil(id: number) {
  getDb().prepare("DELETE FROM appointments WHERE id = ?").run(id);
}

export function bosSlotlariSil(baslangicGun: string, bitisGun: string): number {
  return getDb()
    .prepare(
      "DELETE FROM appointments WHERE status = 'bos' AND starts_at >= ? AND starts_at < ?",
    )
    .run(`${baslangicGun}T00:00`, `${gunEkle(bitisGun, 1)}T00:00`).changes;
}

/* ------------------------------------------------------------ gösterge */

export function panelOzeti() {
  const db = getDb();
  const an = simdi();
  const b = bugun();
  const say = (sql: string, ...p: unknown[]) =>
    (db.prepare(sql).get(...p) as { n: number }).n;

  return {
    aktifDanisan: say("SELECT COUNT(*) n FROM patients WHERE status = 'aktif'"),
    toplamDanisan: say("SELECT COUNT(*) n FROM patients"),
    bugunkuRandevu: say(
      "SELECT COUNT(*) n FROM appointments WHERE status = 'dolu' AND starts_at >= ? AND starts_at < ?",
      `${b}T00:00`,
      `${gunEkle(b, 1)}T00:00`,
    ),
    yaklasanDolu: say(
      "SELECT COUNT(*) n FROM appointments WHERE status = 'dolu' AND starts_at >= ?",
      an,
    ),
    acikSlot: say(
      "SELECT COUNT(*) n FROM appointments WHERE status = 'bos' AND is_public = 1 AND starts_at >= ?",
      an,
    ),
    buAyOlcum: say(
      "SELECT COUNT(*) n FROM measurements WHERE measured_on >= ?",
      `${b.slice(0, 7)}-01`,
    ),
  };
}

export function bugunkuRandevular(): RandevuDetayli[] {
  const b = bugun();
  return getDb()
    .prepare(
      `SELECT a.*, p.full_name AS danisan_adi FROM appointments a
       LEFT JOIN patients p ON p.id = a.patient_id
       WHERE a.starts_at >= ? AND a.starts_at < ? ORDER BY a.starts_at`,
    )
    .all(`${b}T00:00`, `${gunEkle(b, 1)}T00:00`) as RandevuDetayli[];
}

export function yaklasanRandevular(adet = 8): RandevuDetayli[] {
  return getDb()
    .prepare(
      `SELECT a.*, p.full_name AS danisan_adi FROM appointments a
       LEFT JOIN patients p ON p.id = a.patient_id
       WHERE a.status = 'dolu' AND a.starts_at >= ? ORDER BY a.starts_at LIMIT ?`,
    )
    .all(simdi(), adet) as RandevuDetayli[];
}

/** Uzun süredir ölçümü olmayan aktif danışanlar. */
export function olcumGecikenler(gunEsigi = 120) {
  return getDb()
    .prepare(
      `SELECT p.id, p.full_name, MAX(m.measured_on) AS son_olcum
       FROM patients p LEFT JOIN measurements m ON m.patient_id = p.id
       WHERE p.status = 'aktif'
       GROUP BY p.id
       HAVING son_olcum IS NULL OR son_olcum < ?
       ORDER BY son_olcum IS NOT NULL, son_olcum ASC
       LIMIT 6`,
    )
    .all(gunEkle(bugun(), -gunEsigi)) as {
    id: number;
    full_name: string;
    son_olcum: string | null;
  }[];
}
