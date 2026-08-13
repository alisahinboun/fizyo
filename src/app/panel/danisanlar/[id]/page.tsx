import Link from "next/link";
import { notFound } from "next/navigation";
import { danisanKaldir, danisanDurumuDegistir } from "@/app/actions/danisan";
import { olcumKaldir } from "@/app/actions/olcum";
import { OnayliDugme } from "@/components/Gonder";
import { IkonKalem, IkonCop } from "@/components/Ikonlar";
import OlcumFormu from "@/components/OlcumFormu";
import OlcumGrafikleri from "@/components/OlcumGrafikleri";
import YazdirDugmesi from "@/components/YazdirDugmesi";
import {
  BilgiSatiri,
  BosDurum,
  GeriBaglantisi,
  Kart,
  KartBaslik,
  Rozet,
  SayfaBasligi,
} from "@/components/ui";
import { danisanGetir, danisanRandevulari, olcumleriListele } from "@/lib/sorgular";
import { goreli, tarihUzun, yasHesapla, zamaniAyir } from "@/lib/tarih";
import { OLCUM_ALANLARI, randevuTuruEtiketi, type Olcum } from "@/lib/tipler";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = danisanGetir(Number(id));
  return { title: d?.full_name ?? "Danışan" };
}

/** Cobb / ATR / VAS için ilk-son karşılaştırması. */
function degisimOzeti(olcumler: Olcum[]) {
  const alanlar: { anahtar: keyof Olcum; etiket: string; birim: string; azalmaIyi: boolean }[] = [
    { anahtar: "cobb_thoracic", etiket: "Cobb — torakal", birim: "°", azalmaIyi: true },
    { anahtar: "cobb_lumbar", etiket: "Cobb — lomber", birim: "°", azalmaIyi: true },
    { anahtar: "atr_thoracic", etiket: "ATR — torakal", birim: "°", azalmaIyi: true },
    { anahtar: "vas_pain", etiket: "Ağrı (VAS)", birim: "/10", azalmaIyi: true },
  ];

  return alanlar
    .map((a) => {
      const dolu = olcumler.filter((o) => o[a.anahtar] !== null);
      if (dolu.length === 0) return null;
      const ilk = dolu[0][a.anahtar] as number;
      const son = dolu[dolu.length - 1][a.anahtar] as number;
      return {
        ...a,
        ilk,
        son,
        fark: dolu.length > 1 ? son - ilk : null,
        olcumSayisi: dolu.length,
        sonTarih: dolu[dolu.length - 1].measured_on,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

function farkRozeti(fark: number, azalmaIyi: boolean, birim: string) {
  if (Math.abs(fark) < 0.05)
    return { ton: "notr" as const, metin: `değişim yok`, isaret: "→" };
  const iyi = azalmaIyi ? fark < 0 : fark > 0;
  const yon = fark > 0 ? "↑" : "↓";
  const mutlak = Math.abs(fark);
  const deger = Number.isInteger(mutlak) ? String(mutlak) : mutlak.toFixed(1);
  return {
    ton: iyi ? ("iyi" as const) : ("uyari" as const),
    metin: `${deger}${birim.startsWith("/") ? "" : ` ${birim}`}`,
    isaret: yon,
  };
}

export default async function DanisanDetaySayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ olcum?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const danisanId = Number(id);
  const danisan = danisanGetir(danisanId);
  if (!danisan) notFound();

  const olcumler = olcumleriListele(danisanId);
  const randevular = danisanRandevulari(danisanId);
  const ozet = degisimOzeti(olcumler);
  const duzenlenen = sp.olcum
    ? olcumler.find((o) => o.id === Number(sp.olcum))
    : undefined;

  const yas = yasHesapla(danisan.birth_date);

  // Tabloda yalnızca en az bir kez doldurulmuş sütunlar gösterilir.
  const doluAlanlar = OLCUM_ALANLARI.filter((a) =>
    olcumler.some((o) => o[a.anahtar] !== null),
  );

  return (
    <>
      <div className="yazdirma-gizle">
        <GeriBaglantisi href="/panel/danisanlar" metin="Danışanlar" />
      </div>

      <div className="mt-3">
        <SayfaBasligi
          baslik={danisan.full_name}
          aciklama={[
            yas !== null ? `${yas} yaş` : null,
            danisan.gender,
            danisan.scoliosis_type,
          ]
            .filter(Boolean)
            .join(" · ")}
          sag={
            <div className="yazdirma-gizle flex flex-wrap items-center gap-2">
              <YazdirDugmesi etiket="Dosyayı yazdır" />
              <Link
                href={`/panel/danisanlar/${danisan.id}/duzenle`}
                className="dugme dugme-ikincil"
              >
                <IkonKalem width={16} height={16} /> Düzenle
              </Link>
              <form action={danisanDurumuDegistir}>
                <input type="hidden" name="id" value={danisan.id} />
                <input
                  type="hidden"
                  name="status"
                  value={danisan.status === "aktif" ? "pasif" : "aktif"}
                />
                <button type="submit" className="dugme dugme-ikincil">
                  {danisan.status === "aktif" ? "Pasife al" : "Aktife al"}
                </button>
              </form>
            </div>
          }
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Rozet ton={danisan.status === "aktif" ? "iyi" : "notr"}>
          {danisan.status === "aktif" ? "Aktif takip" : "Pasif kayıt"}
        </Rozet>
        {danisan.curve_pattern && <Rozet ton="marka">{danisan.curve_pattern}</Rozet>}
        {danisan.convexity && <Rozet>{danisan.convexity}</Rozet>}
        {danisan.method && <Rozet>{danisan.method}</Rozet>}
        {danisan.risser !== null && <Rozet>Risser {danisan.risser}</Rozet>}
        {danisan.brace && <Rozet>Korse: {danisan.brace}</Rozet>}
        {!danisan.kvkk_consent && <Rozet ton="uyari">KVKK onayı alınmadı</Rozet>}
      </div>

      {/* ------------------------------------------------------- değişim özeti */}
      {ozet.length > 0 && (
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ozet.map((o) => {
            const rozet = o.fark !== null ? farkRozeti(o.fark, o.azalmaIyi, o.birim) : null;
            return (
              <div key={String(o.anahtar)} className="kart px-5 py-4">
                <p className="text-[0.8125rem] text-ikincil">{o.etiket}</p>
                <p className="mt-1.5 text-3xl font-semibold tracking-tight text-murekkep">
                  {o.son}
                  <span className="ml-1 text-base font-normal text-soluk">{o.birim}</span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {rozet ? (
                    <Rozet ton={rozet.ton}>
                      <span aria-hidden="true">{rozet.isaret}</span>
                      {rozet.metin}
                      <span className="font-normal">· ilk ölçüme göre</span>
                    </Rozet>
                  ) : (
                    <Rozet>tek ölçüm</Rozet>
                  )}
                </div>
                <p className="mt-2 text-[0.75rem] text-soluk">
                  Son ölçüm {tarihUzun(o.sonTarih)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        {/* -------------------------------------------------------- ana sütun */}
        <div className="min-w-0 space-y-4">
          <div className="yazdirma-gizle">
            <OlcumFormu
              danisanId={danisan.id}
              olcum={duzenlenen}
              acikBasla={olcumler.length === 0}
            />
          </div>

          <OlcumGrafikleri olcumler={olcumler} />

          {/* Grafiklerin tablo karşılığı — erişilebilirlik ve yazdırma için */}
          <Kart>
            <KartBaslik
              baslik="Ölçüm kayıtları"
              aciklama={`${olcumler.length} kayıt · grafiklerin tablo karşılığı`}
            />
            {olcumler.length === 0 ? (
              <BosDurum
                baslik="Henüz ölçüm yok"
                aciklama="Yukarıdaki formdan ilk değerlendirme sonuçlarını girebilirsiniz."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[0.8125rem]">
                  <thead>
                    <tr className="border-b border-cizgi text-[0.6875rem] uppercase tracking-wide text-soluk">
                      <th className="w-56 min-w-56 whitespace-nowrap px-4 py-2.5 font-medium">
                        Tarih
                      </th>
                      {doluAlanlar.map((a) => (
                        <th
                          key={String(a.anahtar)}
                          className="whitespace-nowrap px-4 py-2.5 text-right font-medium"
                          title={a.etiket}
                        >
                          {a.etiket}
                          {a.birim && <span className="ml-1 normal-case">({a.birim})</span>}
                        </th>
                      ))}
                      <th className="yazdirma-gizle px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cizgi">
                    {[...olcumler].reverse().map((o) => (
                      <tr key={o.id} className="transition hover:bg-zemin">
                        <td className="whitespace-nowrap px-4 py-2.5 align-top font-medium text-murekkep">
                          {tarihUzun(o.measured_on)}
                          {/* Not, satırı uzatmamak için tarihin altında yer alır. */}
                          {o.notes && (
                            <span className="mt-1 block whitespace-normal text-[0.75rem] font-normal text-ikincil">
                              {o.notes}
                            </span>
                          )}
                        </td>
                        {doluAlanlar.map((a) => (
                          <td
                            key={String(a.anahtar)}
                            className="whitespace-nowrap px-4 py-2.5 text-right align-top tabular-nums text-ikincil"
                          >
                            {o[a.anahtar] !== null ? String(o[a.anahtar]) : "—"}
                          </td>
                        ))}
                        <td className="yazdirma-gizle whitespace-nowrap px-4 py-2.5 text-right align-top">
                          <Link
                            href={`/panel/danisanlar/${danisan.id}?olcum=${o.id}`}
                            className="dugme dugme-sessiz px-2 py-1"
                            title="Düzenle"
                          >
                            <IkonKalem width={15} height={15} />
                          </Link>
                          <form action={olcumKaldir} className="inline">
                            <input type="hidden" name="id" value={o.id} />
                            <input type="hidden" name="patient_id" value={danisan.id} />
                            <OnayliDugme
                              soru="Bu ölçüm kaydı silinsin mi?"
                              className="dugme dugme-sessiz px-2 py-1"
                              title="Sil"
                            >
                              <IkonCop width={15} height={15} />
                            </OnayliDugme>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Kart>
        </div>

        {/* ------------------------------------------------------- yan sütun */}
        <div className="space-y-4">
          <Kart>
            <KartBaslik baslik="Künye" />
            <dl className="px-5 py-2">
              <BilgiSatiri etiket="Doğum tarihi" deger={danisan.birth_date ? tarihUzun(danisan.birth_date) : ""} />
              <BilgiSatiri
                etiket="Telefon"
                deger={
                  danisan.phone ? (
                    <a href={`tel:${danisan.phone.replace(/\s/g, "")}`} className="hover:text-marka-700">
                      {danisan.phone}
                    </a>
                  ) : (
                    ""
                  )
                }
              />
              <BilgiSatiri
                etiket="E-posta"
                deger={
                  danisan.email ? (
                    <a href={`mailto:${danisan.email}`} className="hover:text-marka-700">
                      {danisan.email}
                    </a>
                  ) : (
                    ""
                  )
                }
              />
              <BilgiSatiri etiket="Veli / yakın" deger={danisan.guardian_name} />
              <BilgiSatiri etiket="Veli telefonu" deger={danisan.guardian_phone} />
              <BilgiSatiri etiket="Şehir" deger={danisan.city} />
              <BilgiSatiri etiket="Meslek / okul" deger={danisan.occupation} />
              <BilgiSatiri
                etiket="Tanı tarihi"
                deger={danisan.diagnosis_date ? tarihUzun(danisan.diagnosis_date) : ""}
              />
              <BilgiSatiri etiket="Menarş" deger={danisan.menarche} />
              <BilgiSatiri etiket="Yönlendiren hekim" deger={danisan.referring_doctor} />
              <BilgiSatiri
                etiket="Hedef korse süresi"
                deger={
                  danisan.brace_hours_target !== null
                    ? `${danisan.brace_hours_target} sa/gün`
                    : ""
                }
              />
            </dl>
          </Kart>

          {(danisan.goals || danisan.medical_notes) && (
            <Kart>
              <KartBaslik baslik="Hedefler ve notlar" />
              <div className="space-y-4 px-5 py-4 text-[0.875rem] leading-relaxed text-ikincil">
                {danisan.goals && (
                  <div>
                    <p className="mb-1 text-[0.75rem] font-semibold uppercase tracking-wide text-soluk">
                      Hedefler
                    </p>
                    <p className="whitespace-pre-line">{danisan.goals}</p>
                  </div>
                )}
                {danisan.medical_notes && (
                  <div>
                    <p className="mb-1 text-[0.75rem] font-semibold uppercase tracking-wide text-soluk">
                      Tıbbi notlar
                    </p>
                    <p className="whitespace-pre-line">{danisan.medical_notes}</p>
                  </div>
                )}
              </div>
            </Kart>
          )}

          <Kart>
            <KartBaslik baslik="Randevu geçmişi" aciklama={`${randevular.length} kayıt`} />
            {randevular.length === 0 ? (
              <BosDurum
                baslik="Randevu bağlanmamış"
                aciklama="Takvimde bir slotu bu danışana atadığınızda burada listelenir."
              />
            ) : (
              <ul className="divide-y divide-cizgi">
                {randevular.slice(0, 12).map((r) => {
                  const { gun, saat } = zamaniAyir(r.starts_at);
                  return (
                    <li key={r.id} className="flex items-baseline justify-between gap-3 px-5 py-2.5">
                      <span>
                        <span className="block text-[0.875rem] text-murekkep">
                          {tarihUzun(gun)} · {saat}
                        </span>
                        <span className="block text-[0.75rem] text-soluk">
                          {randevuTuruEtiketi(r.kind)}
                        </span>
                      </span>
                      <span className="shrink-0 text-[0.75rem] text-soluk">{goreli(gun)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Kart>

          <Kart className="yazdirma-gizle">
            <KartBaslik baslik="Tehlikeli bölge" />
            <div className="px-5 py-4">
              <p className="mb-3 text-[0.8125rem] text-ikincil">
                Kaydı silmek ölçüm geçmişini de kalıcı olarak siler. Takibi
                sonlandırmak için &laquo;Pasife al&raquo; genellikle yeterlidir.
              </p>
              <form action={danisanKaldir}>
                <input type="hidden" name="id" value={danisan.id} />
                <OnayliDugme
                  soru={`${danisan.full_name} ve tüm ölçüm kayıtları kalıcı olarak silinecek. Onaylıyor musunuz?`}
                  className="dugme dugme-ikincil text-[#a52626]"
                >
                  <IkonCop width={16} height={16} /> Danışanı sil
                </OnayliDugme>
              </form>
            </div>
          </Kart>
        </div>
      </div>
    </>
  );
}
