import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSetting, setSetting } from "./settings";

const COOKIE = "fizyo_oturum";
const OTURUM_SURESI = 60 * 60 * 12; // 12 saat

/* ---------------------------------------------------------------- parola */

export function parolaHash(parola: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(parola, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function parolaDogrula(parola: string, kayit: string): boolean {
  const [alg, saltHex, hashHex] = kayit.split("$");
  if (alg !== "scrypt" || !saltHex || !hashHex) return false;
  const beklenen = Buffer.from(hashHex, "hex");
  const hesap = crypto.scryptSync(parola, Buffer.from(saltHex, "hex"), beklenen.length);
  return crypto.timingSafeEqual(beklenen, hesap);
}

/** Panel parolası hiç kurulmadıysa false döner (kurulum ekranı gösterilir). */
export function kurulumTamamMi(): boolean {
  return Boolean(getSetting("panel_parola_hash"));
}

export function parolaKaydet(parola: string) {
  setSetting("panel_parola_hash", parolaHash(parola));
}

export function parolaKontrol(parola: string): boolean {
  const kayit = getSetting("panel_parola_hash");
  if (!kayit) return false;
  try {
    return parolaDogrula(parola, kayit);
  } catch {
    return false;
  }
}

/* --------------------------------------------------------------- oturum */

function gizliAnahtar(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  let s = getSetting("oturum_gizli_anahtar");
  if (!s) {
    s = crypto.randomBytes(32).toString("hex");
    setSetting("oturum_gizli_anahtar", s);
  }
  return s;
}

function imzala(veri: string): string {
  return crypto.createHmac("sha256", gizliAnahtar()).update(veri).digest("hex");
}

function jetonUret(): string {
  const sonGecerlilik = Math.floor(Date.now() / 1000) + OTURUM_SURESI;
  const govde = `panel.${sonGecerlilik}`;
  return `${govde}.${imzala(govde)}`;
}

function jetonGecerliMi(jeton: string | undefined): boolean {
  if (!jeton) return false;
  const parcalar = jeton.split(".");
  if (parcalar.length !== 3) return false;
  const [rol, sonGecerlilik, imza] = parcalar;
  const govde = `${rol}.${sonGecerlilik}`;
  const beklenen = imzala(govde);
  if (imza.length !== beklenen.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(imza), Buffer.from(beklenen))) return false;
  return Number(sonGecerlilik) > Math.floor(Date.now() / 1000);
}

export async function oturumAc() {
  const jar = await cookies();
  jar.set(COOKIE, jetonUret(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OTURUM_SURESI,
  });
}

export async function oturumKapat() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function girisYapilmisMi(): Promise<boolean> {
  const jar = await cookies();
  return jetonGecerliMi(jar.get(COOKIE)?.value);
}

/** Panel sayfaları ve sunucu eylemleri için giriş zorunluluğu. */
export async function yetkiGerekli() {
  if (!(await girisYapilmisMi())) redirect(kurulumTamamMi() ? "/giris" : "/kurulum");
}
