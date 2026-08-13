import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * Tek kullanıcılı (tek fizyoterapist) klinik uygulaması olduğu için
 * gömülü SQLite yeterli. Dosya yolu DATABASE_PATH ile değiştirilebilir.
 */
const DB_PATH =
  process.env.DATABASE_PATH || path.join(process.cwd(), "data", "fizyo.db");

declare global {
  // eslint-disable-next-line no-var
  var __fizyoDb: Database.Database | undefined;
}

function create(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS patients (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name       TEXT NOT NULL,
      birth_date      TEXT,
      gender          TEXT,
      phone           TEXT,
      email           TEXT,
      guardian_name   TEXT,
      guardian_phone  TEXT,
      city            TEXT,
      occupation      TEXT,
      scoliosis_type  TEXT,
      curve_pattern   TEXT,
      convexity       TEXT,
      risser          INTEGER,
      menarche        TEXT,
      brace           TEXT,
      brace_hours_target REAL,
      diagnosis_date  TEXT,
      referring_doctor TEXT,
      method          TEXT,
      goals           TEXT,
      medical_notes   TEXT,
      kvkk_consent    INTEGER NOT NULL DEFAULT 0,
      status          TEXT NOT NULL DEFAULT 'aktif',
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS measurements (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id         INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      measured_on        TEXT NOT NULL,
      cobb_thoracic      REAL,
      cobb_thoracolumbar REAL,
      cobb_lumbar        REAL,
      atr_thoracic       REAL,
      atr_lumbar         REAL,
      kyphosis           REAL,
      lordosis           REAL,
      shoulder_asym      REAL,
      pelvis_asym        REAL,
      height_cm          REAL,
      sitting_height_cm  REAL,
      weight_kg          REAL,
      vas_pain           REAL,
      srs22              REAL,
      brace_hours        REAL,
      risser             INTEGER,
      notes              TEXT,
      created_at         TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_meas_patient ON measurements(patient_id, measured_on);

    CREATE TABLE IF NOT EXISTS appointments (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      starts_at     TEXT NOT NULL,
      duration_min  INTEGER NOT NULL DEFAULT 45,
      status        TEXT NOT NULL DEFAULT 'bos',
      patient_id    INTEGER REFERENCES patients(id) ON DELETE SET NULL,
      patient_name  TEXT,
      kind          TEXT NOT NULL DEFAULT 'seans',
      is_public     INTEGER NOT NULL DEFAULT 1,
      notes         TEXT,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_appt_starts ON appointments(starts_at);
  `);
}

export function getDb(): Database.Database {
  if (!global.__fizyoDb) global.__fizyoDb = create();
  return global.__fizyoDb;
}
