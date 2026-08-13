"use client";

import { useActionState, useState } from "react";
import { ayarlariKaydet } from "@/app/actions/ayarlar";
import { parolaDegistir } from "@/app/actions/kimlik";
import { Bildirim, GonderDugmesi } from "@/components/Gonder";
import { IkonWhatsapp } from "@/components/Ikonlar";
import type { Settings } from "@/lib/settings";
import { tarihUzun } from "@/lib/tarih";
import { mesajiDoldur, numarayiNormalle, whatsappBaglantisi } from "@/lib/whatsapp";

function Bolum({
  baslik,
  aciklama,
  children,
}: {
  baslik: string;
  aciklama?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="kart p-5">
      <h2 className="text-[0.9375rem] font-semibold text-murekkep">{baslik}</h2>
      {aciklama && <p className="mt-0.5 text-[0.8125rem] text-ikincil">{aciklama}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Alan({
  ad,
  etiket,
  deger,
  genis,
  ipucu,
  ...rest
}: {
  ad: string;
  etiket: string;
  deger?: string;
  genis?: boolean;
  ipucu?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={genis ? "sm:col-span-2" : undefined}>
      <label className="etiket" htmlFor={ad}>
        {etiket}
      </label>
      <input id={ad} name={ad} defaultValue={deger ?? ""} className="alan" {...rest} />
      {ipucu && <p className="mt-1 text-[0.75rem] text-soluk">{ipucu}</p>}
    </div>
  );
}

function MetinAlani({
  ad,
  etiket,
  deger,
  satir = 3,
  ipucu,
}: {
  ad: string;
  etiket: string;
  deger?: string;
  satir?: number;
  ipucu?: string;
}) {
  return (
    <div className="sm:col-span-2">
      <label className="etiket" htmlFor={ad}>
        {etiket}
      </label>
      <textarea id={ad} name={ad} rows={satir} defaultValue={deger ?? ""} className="alan" />
      {ipucu && <p className="mt-1 text-[0.75rem] text-soluk">{ipucu}</p>}
    </div>
  );
}

export function AyarlarFormu({ ayarlar }: { ayarlar: Settings }) {
  const [durum, eylem] = useActionState(ayarlariKaydet, null);

  const [numara, setNumara] = useState(ayarlar.whatsapp_numarasi);
  const [sablon, setSablon] = useState(ayarlar.whatsapp_mesaji);
  const [klinik, setKlinik] = useState(ayarlar.klinik_adi);

  const ornekMesaj = mesajiDoldur(sablon, {
    tarih: tarihUzun("2026-09-14"),
    saat: "14:30",
    gun: "Pazartesi",
    klinik,
    uzman: ayarlar.uzman_adi,
  });
  const normalNumara = numarayiNormalle(numara);

  return (
    <form action={eylem} className="space-y-4">
      <Bolum baslik="Klinik kimliği" aciklama="Sitenin başlığında ve mesajlarda görünür.">
        <div>
          <label className="etiket" htmlFor="klinik_adi">
            Klinik / marka adı
          </label>
          <input
            id="klinik_adi"
            name="klinik_adi"
            value={klinik}
            onChange={(e) => setKlinik(e.target.value)}
            className="alan"
          />
        </div>
        <Alan ad="uzman_adi" etiket="Uzman adı" deger={ayarlar.uzman_adi} />
        <Alan ad="unvan" etiket="Ünvan" deger={ayarlar.unvan} genis />
      </Bolum>

      <Bolum baslik="Site metinleri" aciklama="Ana sayfada gösterilen tanıtım içerikleri.">
        <Alan ad="hero_baslik" etiket="Ana başlık" deger={ayarlar.hero_baslik} genis />
        <MetinAlani ad="hero_metin" etiket="Ana başlık altı metin" deger={ayarlar.hero_metin} />
        <MetinAlani
          ad="hakkinda_metin"
          etiket="Hakkında metni"
          deger={ayarlar.hakkinda_metin}
          satir={4}
        />
        <MetinAlani
          ad="kvkk_metni"
          etiket="KVKK bilgilendirme metni"
          deger={ayarlar.kvkk_metni}
          satir={3}
          ipucu="Danışan kayıt formunda referans alınmak üzere saklanır."
        />
      </Bolum>

      <Bolum baslik="İletişim">
        <Alan ad="telefon" etiket="Telefon" deger={ayarlar.telefon} placeholder="0212 000 00 00" />
        <Alan ad="eposta" etiket="E-posta" type="email" deger={ayarlar.eposta} />
        <Alan ad="adres" etiket="Adres" deger={ayarlar.adres} genis />
        <Alan
          ad="instagram"
          etiket="Instagram"
          deger={ayarlar.instagram}
          placeholder="@kullaniciadi"
        />
      </Bolum>

      <Bolum
        baslik="WhatsApp randevu akışı"
        aciklama="Danışan bir slot seçtiğinde açılacak hazır mesaj."
      >
        <div>
          <label className="etiket" htmlFor="whatsapp_numarasi">
            WhatsApp numarası
          </label>
          <input
            id="whatsapp_numarasi"
            name="whatsapp_numarasi"
            value={numara}
            onChange={(e) => setNumara(e.target.value)}
            className="alan"
            placeholder="+90 5xx xxx xx xx"
          />
          <p className="mt-1 text-[0.75rem] text-soluk">
            {normalNumara
              ? `Gönderim numarası: ${normalNumara}`
              : "Numara boşken buton kişi seçme ekranını açar."}
          </p>
        </div>
        <Alan
          ad="acik_hafta_sayisi"
          etiket="Kaç haftalık slot yayımlansın?"
          type="number"
          min={1}
          max={12}
          deger={ayarlar.acik_hafta_sayisi}
        />
        <div className="sm:col-span-2">
          <label className="etiket" htmlFor="whatsapp_mesaji">
            Slot seçildiğinde gönderilecek mesaj
          </label>
          <textarea
            id="whatsapp_mesaji"
            name="whatsapp_mesaji"
            rows={3}
            value={sablon}
            onChange={(e) => setSablon(e.target.value)}
            className="alan"
          />
          <p className="mt-1 text-[0.75rem] text-soluk">
            Kullanılabilir yer tutucular: <code>{"{tarih}"}</code> <code>{"{saat}"}</code>{" "}
            <code>{"{gun}"}</code> <code>{"{klinik}"}</code> <code>{"{uzman}"}</code>
          </p>
        </div>
        <MetinAlani
          ad="whatsapp_genel_mesaji"
          etiket="Genel 'bilgi al' mesajı"
          deger={ayarlar.whatsapp_genel_mesaji}
          satir={2}
          ipucu="Slot seçilmeden WhatsApp butonuna basıldığında kullanılır."
        />

        <div className="sm:col-span-2">
          <p className="etiket">Önizleme</p>
          <div className="rounded-xl border border-cizgi bg-zemin p-4">
            <div className="max-w-md rounded-xl rounded-tl-sm bg-[#dcf8c6] px-3 py-2 text-[0.875rem] leading-relaxed text-[#0b3d20]">
              {ornekMesaj || <span className="text-soluk">Mesaj metni boş.</span>}
            </div>
            <a
              href={whatsappBaglantisi(numara, ornekMesaj)}
              target="_blank"
              rel="noopener noreferrer"
              className="dugme dugme-wa mt-3"
            >
              <IkonWhatsapp width={16} height={16} /> Önizlemeyi WhatsApp&apos;ta aç
            </a>
          </div>
        </div>
      </Bolum>

      <Bolum baslik="Çalışma düzeni" aciklama="Toplu slot üretiminde varsayılan olarak kullanılır.">
        <Alan
          ad="seans_suresi"
          etiket="Seans süresi (dk)"
          type="number"
          min={5}
          max={240}
          step={5}
          deger={ayarlar.seans_suresi}
        />
        <div />
        <Alan ad="mesai_baslangic" etiket="Mesai başlangıcı" type="time" deger={ayarlar.mesai_baslangic} />
        <Alan ad="mesai_bitis" etiket="Mesai bitişi" type="time" deger={ayarlar.mesai_bitis} />
      </Bolum>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-xl border border-cizgi bg-yuzey px-4 py-3 shadow-lg shadow-black/5">
        <GonderDugmesi>Ayarları kaydet</GonderDugmesi>
        <Bildirim durum={durum} />
      </div>
    </form>
  );
}

export function ParolaFormu() {
  const [durum, eylem] = useActionState(parolaDegistir, null);
  return (
    <form action={eylem} className="grid gap-4 px-5 py-5 sm:grid-cols-3">
      <div>
        <label className="etiket" htmlFor="mevcut_parola">
          Mevcut parola
        </label>
        <input
          id="mevcut_parola"
          name="mevcut_parola"
          type="password"
          autoComplete="current-password"
          required
          className="alan"
        />
      </div>
      <div>
        <label className="etiket" htmlFor="yeni_parola">
          Yeni parola
        </label>
        <input
          id="yeni_parola"
          name="yeni_parola"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="alan"
        />
      </div>
      <div>
        <label className="etiket" htmlFor="yeni_parola_tekrar">
          Yeni parola tekrar
        </label>
        <input
          id="yeni_parola_tekrar"
          name="yeni_parola_tekrar"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="alan"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
        <GonderDugmesi>Parolayı değiştir</GonderDugmesi>
        <Bildirim durum={durum} />
      </div>
    </form>
  );
}
