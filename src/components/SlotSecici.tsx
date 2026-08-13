"use client";

import { useMemo, useState } from "react";
import { IkonSaat, IkonWhatsapp } from "@/components/Ikonlar";
import { goreli, gunAdi, tarihUzun } from "@/lib/tarih";
import { mesajiDoldur, whatsappBaglantisi } from "@/lib/whatsapp";

export type AcikSlot = { id: number; gun: string; saat: string; sureDk: number; tur: string };

type Props = {
  slotlar: AcikSlot[];
  whatsappNumarasi: string;
  mesajSablonu: string;
  genelMesaj: string;
  klinikAdi: string;
  uzmanAdi: string;
};

export default function SlotSecici({
  slotlar,
  whatsappNumarasi,
  mesajSablonu,
  genelMesaj,
  klinikAdi,
  uzmanAdi,
}: Props) {
  const gunler = useMemo(() => {
    const harita = new Map<string, AcikSlot[]>();
    for (const s of slotlar) {
      if (!harita.has(s.gun)) harita.set(s.gun, []);
      harita.get(s.gun)!.push(s);
    }
    return [...harita.entries()].map(([gun, liste]) => ({ gun, liste }));
  }, [slotlar]);

  const [secili, setSecili] = useState<AcikSlot | null>(null);
  const [hepsiAcik, setHepsiAcik] = useState(false);

  const ILK_GOSTERIM = 5;
  const gorunenGunler = hepsiAcik ? gunler : gunler.slice(0, ILK_GOSTERIM);
  const gizliGunSayisi = gunler.length - gorunenGunler.length;

  const baglanti = secili
    ? whatsappBaglantisi(
        whatsappNumarasi,
        mesajiDoldur(mesajSablonu, {
          tarih: tarihUzun(secili.gun),
          saat: secili.saat,
          gun: gunAdi(secili.gun),
          klinik: klinikAdi,
          uzman: uzmanAdi,
        }),
      )
    : whatsappBaglantisi(whatsappNumarasi, genelMesaj);

  if (gunler.length === 0) {
    return (
      <div className="kart px-6 py-10 text-center">
        <p className="text-[0.9375rem] font-medium text-murekkep">
          Şu an yayımlanmış boş slot bulunmuyor.
        </p>
        <p className="mx-auto mt-1 max-w-md text-[0.875rem] text-ikincil">
          Takvim düzenli olarak güncelleniyor. Uygun saatleri öğrenmek için WhatsApp
          üzerinden yazabilirsiniz.
        </p>
        <a
          href={baglanti}
          target="_blank"
          rel="noopener noreferrer"
          className="dugme dugme-wa mt-5"
        >
          <IkonWhatsapp /> WhatsApp&apos;tan yaz
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {gorunenGunler.map(({ gun, liste }) => (
          <div key={gun} className="kart px-5 py-4">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="text-[0.9375rem] font-semibold text-murekkep">
                {tarihUzun(gun)}
                <span className="ml-2 font-normal text-ikincil">{gunAdi(gun)}</span>
              </h3>
              <span className="text-[0.75rem] text-soluk">{goreli(gun)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {liste.map((s) => {
                const aktif = secili?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={aktif}
                    onClick={() => setSecili(aktif ? null : s)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[0.875rem] font-medium transition ${
                      aktif
                        ? "border-marka-600 bg-marka-600 text-white"
                        : "border-cizgi bg-yuzey text-murekkep hover:border-marka-300 hover:bg-marka-50"
                    }`}
                  >
                    <IkonSaat width={15} height={15} className={aktif ? "" : "text-marka-500"} />
                    {s.saat}
                    <span className={`text-[0.75rem] ${aktif ? "text-marka-100" : "text-soluk"}`}>
                      {s.sureDk} dk
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {gizliGunSayisi > 0 && (
        <button
          type="button"
          onClick={() => setHepsiAcik(true)}
          className="dugme dugme-ikincil mt-3 w-full py-3"
        >
          {gizliGunSayisi} gün daha göster
        </button>
      )}

      {/* Seçim özeti — sayfanın altına sabitlenir */}
      <div className="sticky bottom-4 z-20 mt-4">
        <div className="kart flex flex-wrap items-center justify-between gap-3 px-5 py-4 shadow-lg shadow-black/5">
          <div>
            <p className="text-[0.8125rem] text-ikincil">
              {secili ? "Seçilen randevu saati" : "Bir saat seçin"}
            </p>
            <p className="text-[0.9375rem] font-semibold text-murekkep">
              {secili
                ? `${tarihUzun(secili.gun)} ${gunAdi(secili.gun)} · ${secili.saat}`
                : "Randevu talebiniz WhatsApp üzerinden iletilir"}
            </p>
          </div>
          <a
            href={baglanti}
            target="_blank"
            rel="noopener noreferrer"
            className="dugme dugme-wa"
          >
            <IkonWhatsapp />
            {secili ? "Bu saat için WhatsApp'tan yaz" : "WhatsApp'tan yaz"}
          </a>
        </div>
      </div>

      <p className="mt-3 text-center text-[0.75rem] text-soluk">
        Slotlar online olarak rezerve edilmez. Seçtiğiniz saat, WhatsApp üzerinden
        onaylandığında kesinleşir.
      </p>
    </div>
  );
}
