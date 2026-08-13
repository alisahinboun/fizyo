import Link from "next/link";
import { getDb } from "@/lib/db";
import {
  BosSlotTemizleme,
  SlotDuzenleyici,
  TekSlotFormu,
  TopluSlotFormu,
  type DanisanSecenegi,
} from "@/components/RandevuAraclari";
import { IkonSol, IkonSag } from "@/components/Ikonlar";
import { Kart, KartBaslik, Rozet, SayfaBasligi } from "@/components/ui";
import { randevuGetir, randevulariListele } from "@/lib/sorgular";
import { getSettings } from "@/lib/settings";
import {
  GUNLER_KISA,
  bugun,
  gunEkle,
  gunuCoz,
  haftaBasi,
  tarihUzun,
  zamaniAyir,
} from "@/lib/tarih";
import { randevuTuruEtiketi } from "@/lib/tipler";

export const metadata = { title: "Randevular" };

/**
 * Dolu randevu vurgulanır, boş slot sessiz kalır: takvime bakan kişi önce
 * "kim geliyor?" sorusunu okur. Durum yalnızca renkle değil, ikinci satırdaki
 * metinle de belirtilir.
 */
const SLOT_STILI = {
  bos: "border-dashed border-cizgi bg-yuzey text-ikincil hover:border-marka-400 hover:bg-marka-50",
  dolu: "border-marka-300 bg-marka-50 text-marka-800 hover:border-marka-500",
  kapali: "border-cizgi bg-zemin text-soluk hover:border-soluk",
} as const;

function danisanSecenekleri(): DanisanSecenegi[] {
  return getDb()
    .prepare(
      "SELECT id, full_name, phone FROM patients WHERE status = 'aktif' ORDER BY full_name COLLATE NOCASE",
    )
    .all() as DanisanSecenegi[];
}

export default async function RandevularSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hafta?: string; slot?: string }>;
}) {
  const sp = await searchParams;
  const ayarlar = getSettings();

  const haftaninBasi = haftaBasi(sp.hafta && /^\d{4}-\d{2}-\d{2}$/.test(sp.hafta) ? sp.hafta : bugun());
  const haftaninSonu = gunEkle(haftaninBasi, 6);

  const randevular = randevulariListele(haftaninBasi, haftaninSonu);
  const danisanlar = danisanSecenekleri();
  const secilen = sp.slot ? randevuGetir(Number(sp.slot)) : undefined;

  const gunler = Array.from({ length: 7 }, (_, i) => gunEkle(haftaninBasi, i));
  const gunlukKayitlar = new Map(gunler.map((g) => [g, [] as typeof randevular]));
  for (const r of randevular) {
    const { gun } = zamaniAyir(r.starts_at);
    gunlukKayitlar.get(gun)?.push(r);
  }

  const sayilar = {
    bos: randevular.filter((r) => r.status === "bos").length,
    dolu: randevular.filter((r) => r.status === "dolu").length,
    kapali: randevular.filter((r) => r.status === "kapali").length,
  };

  const haftaBaglantisi = (gun: string, slot?: number) =>
    `/panel/randevular?hafta=${gun}${slot ? `&slot=${slot}` : ""}`;

  return (
    <>
      <SayfaBasligi
        baslik="Randevular"
        aciklama={`${tarihUzun(haftaninBasi)} – ${tarihUzun(haftaninSonu)}`}
        sag={
          <>
            <Link
              href={haftaBaglantisi(gunEkle(haftaninBasi, -7))}
              className="dugme dugme-ikincil"
              aria-label="Önceki hafta"
            >
              <IkonSol width={16} height={16} />
            </Link>
            <Link href={haftaBaglantisi(bugun())} className="dugme dugme-ikincil">
              Bu hafta
            </Link>
            <Link
              href={haftaBaglantisi(gunEkle(haftaninBasi, 7))}
              className="dugme dugme-ikincil"
              aria-label="Sonraki hafta"
            >
              <IkonSag width={16} height={16} />
            </Link>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Rozet ton="marka">{sayilar.dolu} dolu</Rozet>
        <Rozet>{sayilar.bos} boş</Rozet>
        <Rozet>{sayilar.kapali} kapalı</Rozet>
      </div>

      {secilen && (
        <div className="mb-4">
          <SlotDuzenleyici
            randevu={secilen}
            danisanlar={danisanlar}
            geriBaglantisi={haftaBaglantisi(haftaninBasi)}
            whatsapp={{
              numara: ayarlar.whatsapp_numarasi,
              sablon: ayarlar.whatsapp_mesaji,
              klinik: ayarlar.klinik_adi,
              uzman: ayarlar.uzman_adi,
            }}
          />
        </div>
      )}

      <Kart className="mb-4 overflow-hidden">
        <KartBaslik
          baslik="Haftalık program"
          aciklama="Bir saate tıklayarak durumunu değiştirebilir, danışan atayabilirsiniz."
        />
        <div className="grid grid-cols-1 divide-y divide-cizgi sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 xl:grid-cols-7">
          {gunler.map((gun) => {
            const kayitlar = gunlukKayitlar.get(gun) ?? [];
            const bugunMu = gun === bugun();
            return (
              <div
                key={gun}
                className="min-w-0 border-cizgi p-3 sm:border-l sm:first:border-l-0"
              >
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <span
                    className={`text-[0.8125rem] font-semibold ${
                      bugunMu ? "text-marka-700" : "text-murekkep"
                    }`}
                  >
                    {GUNLER_KISA[gunuCoz(gun).getDay()]}
                  </span>
                  <span
                    className={`text-[0.75rem] tabular-nums ${
                      bugunMu ? "font-semibold text-marka-700" : "text-soluk"
                    }`}
                  >
                    {gun.slice(8)}.{gun.slice(5, 7)}
                  </span>
                </div>

                {kayitlar.length === 0 ? (
                  <p className="rounded-lg bg-zemin px-2 py-3 text-center text-[0.75rem] text-soluk">
                    Kayıt yok
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {kayitlar.map((r) => {
                      const { saat } = zamaniAyir(r.starts_at);
                      const ad = r.danisan_adi ?? r.patient_name;
                      return (
                        <li key={r.id}>
                          <Link
                            href={haftaBaglantisi(haftaninBasi, r.id)}
                            className={`block rounded-lg border px-2.5 py-2 text-[0.8125rem] transition ${
                              SLOT_STILI[r.status] ?? SLOT_STILI.bos
                            } ${secilen?.id === r.id ? "ring-2 ring-marka-500" : ""}`}
                          >
                            <span className="flex items-baseline justify-between gap-1.5">
                              <span className="font-semibold tabular-nums">{saat}</span>
                              {r.status === "bos" && !r.is_public && (
                                <span className="text-[0.6875rem] opacity-70">gizli</span>
                              )}
                            </span>
                            <span className="mt-0.5 block truncate">
                              {r.status === "dolu"
                                ? (ad ?? "İsimsiz")
                                : r.status === "kapali"
                                  ? "Kapalı"
                                  : "Boş"}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </Kart>

      <div className="space-y-4">
        <TopluSlotFormu
          varsayilan={{
            baslangic: haftaninBasi,
            bitis: gunEkle(haftaninBasi, 27),
            mesaiBaslangic: ayarlar.mesai_baslangic,
            mesaiBitis: ayarlar.mesai_bitis,
            sure: Number(ayarlar.seans_suresi) || 45,
          }}
        />
        <TekSlotFormu
          varsayilanGun={haftaninBasi}
          varsayilanSure={Number(ayarlar.seans_suresi) || 45}
        />
        <BosSlotTemizleme
          varsayilan={{ baslangic: haftaninBasi, bitis: haftaninSonu }}
        />
      </div>
    </>
  );
}
