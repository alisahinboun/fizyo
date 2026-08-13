import Link from "next/link";
import {
  IkonArti,
  IkonGrafik,
  IkonKisiler,
  IkonSaat,
  IkonTakvim,
} from "@/components/Ikonlar";
import {
  BosDurum,
  IstatistikKutusu,
  Kart,
  KartBaslik,
  Rozet,
  SayfaBasligi,
} from "@/components/ui";
import {
  bugunkuRandevular,
  olcumGecikenler,
  panelOzeti,
  yaklasanRandevular,
} from "@/lib/sorgular";
import { goreli, tarihGunlu, tarihUzun, zamaniAyir, bugun } from "@/lib/tarih";
import { randevuTuruEtiketi } from "@/lib/tipler";

export const metadata = { title: "Genel bakış" };

const DURUM_ROZETI = {
  bos: { ton: "notr", metin: "Boş" },
  dolu: { ton: "marka", metin: "Dolu" },
  kapali: { ton: "notr", metin: "Kapalı" },
} as const;

export default function PanelAnaSayfa() {
  const ozet = panelOzeti();
  const bugunku = bugunkuRandevular();
  const yaklasan = yaklasanRandevular(6);
  const geciken = olcumGecikenler();

  return (
    <>
      <SayfaBasligi
        baslik="Genel bakış"
        aciklama={tarihUzun(bugun())}
        sag={
          <>
            <Link href="/panel/danisanlar/yeni" className="dugme dugme-birincil">
              <IkonArti width={16} height={16} /> Yeni danışan
            </Link>
            <Link href="/panel/randevular" className="dugme dugme-ikincil">
              <IkonTakvim width={16} height={16} /> Randevu takvimi
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IstatistikKutusu
          etiket="Aktif danışan"
          deger={ozet.aktifDanisan}
          alt={`Toplam ${ozet.toplamDanisan} kayıt`}
          ikon={<IkonKisiler width={17} height={17} />}
        />
        <IstatistikKutusu
          etiket="Bugünkü randevu"
          deger={ozet.bugunkuRandevu}
          alt={`${ozet.yaklasanDolu} yaklaşan randevu`}
          ikon={<IkonTakvim width={17} height={17} />}
        />
        <IstatistikKutusu
          etiket="Yayımdaki boş slot"
          deger={ozet.acikSlot}
          alt="Sitede görünen uygun saatler"
          ikon={<IkonSaat width={17} height={17} />}
        />
        <IstatistikKutusu
          etiket="Bu ayki ölçüm"
          deger={ozet.buAyOlcum}
          alt="Kaydedilen değerlendirme"
          ikon={<IkonGrafik width={17} height={17} />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Kart>
          <KartBaslik
            baslik="Bugünün programı"
            aciklama={`${bugunku.length} kayıtlı saat`}
            sag={
              <Link
                href="/panel/randevular"
                className="text-[0.8125rem] text-marka-700 hover:underline"
              >
                Takvim
              </Link>
            }
          />
          {bugunku.length === 0 ? (
            <BosDurum
              baslik="Bugün için kayıt yok"
              aciklama="Randevular sayfasından slot üretebilir veya tek tek ekleyebilirsiniz."
            />
          ) : (
            <ul className="divide-y divide-cizgi">
              {bugunku.map((r) => {
                const { saat } = zamaniAyir(r.starts_at);
                const rozet = DURUM_ROZETI[r.status] ?? DURUM_ROZETI.bos;
                return (
                  <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="w-14 shrink-0 text-[0.9375rem] font-semibold tabular-nums text-murekkep">
                      {saat}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.875rem] text-murekkep">
                        {r.danisan_adi ?? r.patient_name ?? (
                          <span className="text-soluk">— boş —</span>
                        )}
                      </span>
                      <span className="block text-[0.75rem] text-soluk">
                        {randevuTuruEtiketi(r.kind)} · {r.duration_min} dk
                      </span>
                    </span>
                    <Rozet ton={rozet.ton}>{rozet.metin}</Rozet>
                  </li>
                );
              })}
            </ul>
          )}
        </Kart>

        <Kart>
          <KartBaslik baslik="Yaklaşan randevular" aciklama="Dolu olarak işaretlenmiş saatler" />
          {yaklasan.length === 0 ? (
            <BosDurum
              baslik="Yaklaşan dolu randevu yok"
              aciklama="WhatsApp'tan gelen talepleri takvimde dolu olarak işaretleyin."
            />
          ) : (
            <ul className="divide-y divide-cizgi">
              {yaklasan.map((r) => {
                const { gun, saat } = zamaniAyir(r.starts_at);
                return (
                  <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.875rem] font-medium text-murekkep">
                        {r.danisan_adi ?? r.patient_name ?? "İsimsiz randevu"}
                      </span>
                      <span className="block text-[0.75rem] text-soluk">
                        {tarihGunlu(gun)} · {saat} · {randevuTuruEtiketi(r.kind)}
                      </span>
                    </span>
                    <span className="shrink-0 text-[0.75rem] text-ikincil">{goreli(gun)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Kart>
      </div>

      <Kart className="mt-4">
        <KartBaslik
          baslik="Ölçümü gecikenler"
          aciklama="Son 4 aydır yeni ölçümü olmayan aktif danışanlar"
        />
        {geciken.length === 0 ? (
          <BosDurum baslik="Takip güncel" aciklama="Tüm aktif danışanların yakın tarihli ölçümü var." />
        ) : (
          <ul className="divide-y divide-cizgi">
            {geciken.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <Link
                  href={`/panel/danisanlar/${d.id}`}
                  className="truncate text-[0.875rem] font-medium text-murekkep hover:text-marka-700"
                >
                  {d.full_name}
                </Link>
                <span className="shrink-0 text-[0.8125rem] text-ikincil">
                  {d.son_olcum ? `Son ölçüm ${tarihUzun(d.son_olcum)}` : "Hiç ölçüm yok"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Kart>
    </>
  );
}
