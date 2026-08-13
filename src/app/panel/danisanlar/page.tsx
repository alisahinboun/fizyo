import Link from "next/link";
import { IkonArama, IkonArti } from "@/components/Ikonlar";
import { BosDurum, Kart, Rozet, SayfaBasligi } from "@/components/ui";
import { danisanlariListele } from "@/lib/sorgular";
import { getDb } from "@/lib/db";
import { tarihUzun, yasHesapla } from "@/lib/tarih";

export const metadata = { title: "Danışanlar" };

const DURUMLAR = [
  { deger: "aktif", etiket: "Aktif" },
  { deger: "pasif", etiket: "Pasif" },
  { deger: "hepsi", etiket: "Tümü" },
];

/** Listede göstermek için son ölçüm tarihlerini tek sorguda getirir. */
function sonOlcumler(): Map<number, string> {
  const satirlar = getDb()
    .prepare(
      "SELECT patient_id, MAX(measured_on) AS son FROM measurements GROUP BY patient_id",
    )
    .all() as { patient_id: number; son: string }[];
  return new Map(satirlar.map((s) => [s.patient_id, s.son]));
}

export default async function DanisanlarSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; durum?: string }>;
}) {
  const sp = await searchParams;
  const arama = sp.q ?? "";
  const durum = sp.durum ?? "aktif";

  const danisanlar = danisanlariListele(arama, durum);
  const olcumHaritasi = sonOlcumler();

  return (
    <>
      <SayfaBasligi
        baslik="Danışanlar"
        aciklama={`${danisanlar.length} kayıt listeleniyor`}
        sag={
          <Link href="/panel/danisanlar/yeni" className="dugme dugme-birincil">
            <IkonArti width={16} height={16} /> Yeni danışan
          </Link>
        }
      />

      <form method="get" className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <IkonArama
            width={16}
            height={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soluk"
          />
          <input
            type="search"
            name="q"
            defaultValue={arama}
            placeholder="Ad, telefon veya e-posta ile ara"
            className="alan pl-9"
            aria-label="Danışan ara"
          />
        </div>
        <select name="durum" defaultValue={durum} className="alan w-auto" aria-label="Durum">
          {DURUMLAR.map((d) => (
            <option key={d.deger} value={d.deger}>
              {d.etiket}
            </option>
          ))}
        </select>
        <button type="submit" className="dugme dugme-ikincil">
          Filtrele
        </button>
      </form>

      <Kart>
        {danisanlar.length === 0 ? (
          <BosDurum
            baslik={arama ? "Eşleşen danışan bulunamadı" : "Henüz danışan kaydı yok"}
            aciklama={
              arama
                ? "Farklı bir arama deneyin ya da durum filtresini genişletin."
                : "İlk danışanı ekleyerek ölçüm takibine başlayabilirsiniz."
            }
            eylem={
              <Link href="/panel/danisanlar/yeni" className="dugme dugme-birincil">
                <IkonArti width={16} height={16} /> Yeni danışan
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.875rem]">
              <thead>
                <tr className="border-b border-cizgi text-[0.75rem] uppercase tracking-wide text-soluk">
                  <th className="px-5 py-3 font-medium">Ad soyad</th>
                  <th className="px-5 py-3 font-medium">Yaş</th>
                  <th className="px-5 py-3 font-medium">Eğrilik</th>
                  <th className="px-5 py-3 font-medium">Telefon</th>
                  <th className="px-5 py-3 font-medium">Son ölçüm</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cizgi">
                {danisanlar.map((d) => {
                  const yas = yasHesapla(d.birth_date);
                  const son = olcumHaritasi.get(d.id);
                  return (
                    <tr key={d.id} className="transition hover:bg-zemin">
                      <td className="px-5 py-3">
                        <Link
                          href={`/panel/danisanlar/${d.id}`}
                          className="font-medium text-murekkep hover:text-marka-700"
                        >
                          {d.full_name}
                        </Link>
                        {d.scoliosis_type && (
                          <span className="block text-[0.75rem] text-soluk">
                            {d.scoliosis_type}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 tabular-nums text-ikincil">
                        {yas !== null ? yas : "—"}
                      </td>
                      <td className="px-5 py-3 text-ikincil">
                        {d.curve_pattern ?? "—"}
                        {d.convexity && (
                          <span className="block text-[0.75rem] text-soluk">{d.convexity}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 tabular-nums text-ikincil">{d.phone ?? "—"}</td>
                      <td className="px-5 py-3 text-ikincil">
                        {son ? tarihUzun(son) : <span className="text-soluk">Yok</span>}
                      </td>
                      <td className="px-5 py-3">
                        <Rozet ton={d.status === "aktif" ? "iyi" : "notr"}>
                          {d.status === "aktif" ? "Aktif" : "Pasif"}
                        </Rozet>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Kart>
    </>
  );
}
