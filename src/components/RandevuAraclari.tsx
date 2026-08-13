"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  bosSlotlariTemizle,
  randevuKaldir,
  randevuKaydet,
  slotEkle,
  slotlariTopluUret,
} from "@/app/actions/randevu";
import { Bildirim, GonderDugmesi, OnayliDugme } from "@/components/Gonder";
import { IkonCop, IkonWhatsapp } from "@/components/Ikonlar";
import { KartBaslik } from "@/components/ui";
import { GUNLER_KISA, tarihUzun, zamaniAyir } from "@/lib/tarih";
import { RANDEVU_TURLERI, type RandevuDetayli } from "@/lib/tipler";
import { mesajiDoldur, whatsappBaglantisi } from "@/lib/whatsapp";

export type DanisanSecenegi = { id: number; full_name: string; phone: string | null };

/* ----------------------------------------------------------- toplu üretim */

const HAFTA_SIRASI = [1, 2, 3, 4, 5, 6, 0]; // Pazartesi → Pazar

export function TopluSlotFormu({
  varsayilan,
}: {
  varsayilan: {
    baslangic: string;
    bitis: string;
    mesaiBaslangic: string;
    mesaiBitis: string;
    sure: number;
  };
}) {
  const [durum, eylem] = useActionState(slotlariTopluUret, null);

  return (
    <details className="kart group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
        <span>
          <span className="block text-[0.9375rem] font-semibold text-murekkep">
            Toplu slot üret
          </span>
          <span className="block text-[0.8125rem] text-ikincil">
            Seçilen tarih aralığında, belirlediğiniz günlere boş randevu saatleri açar.
          </span>
        </span>
        <span className="dugme dugme-ikincil shrink-0 text-[0.8125rem]">
          <span className="group-open:hidden">Aç</span>
          <span className="hidden group-open:inline">Kapat</span>
        </span>
      </summary>

      <form action={eylem} className="space-y-4 border-t border-cizgi px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="etiket" htmlFor="baslangic">
              Başlangıç tarihi
            </label>
            <input
              id="baslangic"
              name="baslangic"
              type="date"
              required
              defaultValue={varsayilan.baslangic}
              className="alan"
            />
          </div>
          <div>
            <label className="etiket" htmlFor="bitis">
              Bitiş tarihi
            </label>
            <input
              id="bitis"
              name="bitis"
              type="date"
              required
              defaultValue={varsayilan.bitis}
              className="alan"
            />
          </div>
          <div>
            <label className="etiket" htmlFor="mesai_baslangic">
              Günlük başlangıç
            </label>
            <input
              id="mesai_baslangic"
              name="mesai_baslangic"
              type="time"
              required
              defaultValue={varsayilan.mesaiBaslangic}
              className="alan"
            />
          </div>
          <div>
            <label className="etiket" htmlFor="mesai_bitis">
              Günlük bitiş
            </label>
            <input
              id="mesai_bitis"
              name="mesai_bitis"
              type="time"
              required
              defaultValue={varsayilan.mesaiBitis}
              className="alan"
            />
          </div>
        </div>

        <fieldset>
          <legend className="etiket">Hangi günler?</legend>
          <div className="flex flex-wrap gap-2">
            {HAFTA_SIRASI.map((g) => (
              <label
                key={g}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-cizgi px-3 py-2 text-[0.875rem] text-murekkep has-checked:border-marka-500 has-checked:bg-marka-50"
              >
                <input
                  type="checkbox"
                  name="haftaninGunleri"
                  value={g}
                  defaultChecked={g >= 1 && g <= 5}
                  className="h-4 w-4"
                />
                {GUNLER_KISA[g]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="etiket" htmlFor="duration_min">
              Seans süresi (dk)
            </label>
            <input
              id="duration_min"
              name="duration_min"
              type="number"
              min={5}
              max={240}
              step={5}
              required
              defaultValue={varsayilan.sure}
              className="alan tabular-nums"
            />
          </div>
          <div>
            <label className="etiket" htmlFor="kind">
              Slot türü
            </label>
            <select id="kind" name="kind" defaultValue="seans" className="alan">
              {RANDEVU_TURLERI.map((t) => (
                <option key={t.deger} value={t.deger}>
                  {t.etiket}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <GonderDugmesi bekleyen="Üretiliyor…">Slotları üret</GonderDugmesi>
          <Bildirim durum={durum} />
        </div>
        <p className="text-[0.75rem] text-soluk">
          Aynı saatte kayıt varsa atlanır; mevcut randevularınız etkilenmez.
        </p>
      </form>
    </details>
  );
}

/* -------------------------------------------------------------- tek slot */

export function TekSlotFormu({
  varsayilanGun,
  varsayilanSure,
}: {
  varsayilanGun: string;
  varsayilanSure: number;
}) {
  const [durum, eylem] = useActionState(slotEkle, null);
  return (
    <details className="kart group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
        <span>
          <span className="block text-[0.9375rem] font-semibold text-murekkep">
            Tek slot ekle
          </span>
          <span className="block text-[0.8125rem] text-ikincil">
            Programa tek bir saat eklemek için.
          </span>
        </span>
        <span className="dugme dugme-ikincil shrink-0 text-[0.8125rem]">
          <span className="group-open:hidden">Aç</span>
          <span className="hidden group-open:inline">Kapat</span>
        </span>
      </summary>
      <form action={eylem} className="space-y-4 border-t border-cizgi px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="etiket" htmlFor="tek_gun">
              Tarih
            </label>
            <input
              id="tek_gun"
              name="gun"
              type="date"
              required
              defaultValue={varsayilanGun}
              className="alan"
            />
          </div>
          <div>
            <label className="etiket" htmlFor="tek_saat">
              Saat
            </label>
            <input id="tek_saat" name="saat" type="time" required className="alan" />
          </div>
          <div>
            <label className="etiket" htmlFor="tek_sure">
              Süre (dk)
            </label>
            <input
              id="tek_sure"
              name="duration_min"
              type="number"
              min={5}
              max={240}
              step={5}
              defaultValue={varsayilanSure}
              className="alan tabular-nums"
            />
          </div>
          <div>
            <label className="etiket" htmlFor="tek_kind">
              Tür
            </label>
            <select id="tek_kind" name="kind" defaultValue="seans" className="alan">
              {RANDEVU_TURLERI.map((t) => (
                <option key={t.deger} value={t.deger}>
                  {t.etiket}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-[0.875rem] text-ikincil">
          <input type="checkbox" name="is_public" defaultChecked className="h-4 w-4" />
          Sitede yayımlansın
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <GonderDugmesi>Slot ekle</GonderDugmesi>
          <Bildirim durum={durum} />
        </div>
      </form>
    </details>
  );
}

/* ------------------------------------------------------------- temizleme */

export function BosSlotTemizleme({
  varsayilan,
}: {
  varsayilan: { baslangic: string; bitis: string };
}) {
  const [durum, eylem] = useActionState(bosSlotlariTemizle, null);
  return (
    <details className="kart group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
        <span>
          <span className="block text-[0.9375rem] font-semibold text-murekkep">
            Boş slotları temizle
          </span>
          <span className="block text-[0.8125rem] text-ikincil">
            Tatil veya izin döneminde yayımlanan boş saatleri kaldırır.
          </span>
        </span>
        <span className="dugme dugme-ikincil shrink-0 text-[0.8125rem]">
          <span className="group-open:hidden">Aç</span>
          <span className="hidden group-open:inline">Kapat</span>
        </span>
      </summary>
      <form action={eylem} className="space-y-4 border-t border-cizgi px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiket" htmlFor="temizle_baslangic">
              Başlangıç
            </label>
            <input
              id="temizle_baslangic"
              name="baslangic"
              type="date"
              required
              defaultValue={varsayilan.baslangic}
              className="alan"
            />
          </div>
          <div>
            <label className="etiket" htmlFor="temizle_bitis">
              Bitiş
            </label>
            <input
              id="temizle_bitis"
              name="bitis"
              type="date"
              required
              defaultValue={varsayilan.bitis}
              className="alan"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <OnayliDugme
            soru="Seçilen aralıktaki boş slotlar silinecek. Devam edilsin mi?"
            className="dugme dugme-ikincil text-[#a52626]"
          >
            <IkonCop width={16} height={16} /> Boş slotları sil
          </OnayliDugme>
          <Bildirim durum={durum} />
        </div>
        <p className="text-[0.75rem] text-soluk">Dolu randevulara dokunulmaz.</p>
      </form>
    </details>
  );
}

/* --------------------------------------------------------- slot düzenleme */

export function SlotDuzenleyici({
  randevu,
  danisanlar,
  geriBaglantisi,
  whatsapp,
}: {
  randevu: RandevuDetayli;
  danisanlar: DanisanSecenegi[];
  geriBaglantisi: string;
  whatsapp: { numara: string; sablon: string; klinik: string; uzman: string };
}) {
  const [durum, eylem] = useActionState(randevuKaydet, null);
  const { gun, saat } = zamaniAyir(randevu.starts_at);
  const [secilenDurum, setSecilenDurum] = useState(randevu.status);
  const [secilenDanisan, setSecilenDanisan] = useState(
    randevu.patient_id ? String(randevu.patient_id) : "",
  );

  const danisan = danisanlar.find((d) => String(d.id) === secilenDanisan);
  const hatirlatmaBaglantisi = danisan?.phone
    ? whatsappBaglantisi(
        danisan.phone,
        mesajiDoldur(
          "Merhaba, {tarih} {saat} saatindeki randevunuzu hatırlatmak istedim. {klinik}",
          { tarih: tarihUzun(gun), saat, klinik: whatsapp.klinik, uzman: whatsapp.uzman },
        ),
      )
    : null;

  return (
    <section className="kart">
      <KartBaslik
        baslik={`${tarihUzun(gun)} · ${saat}`}
        aciklama="Slot durumunu ve danışan atamasını buradan yönetin."
        sag={
          <Link href={geriBaglantisi} className="dugme dugme-sessiz px-2 py-1 text-[0.8125rem]">
            Kapat
          </Link>
        }
      />

      <form action={eylem} className="space-y-4 px-5 py-5">
        <input type="hidden" name="id" value={randevu.id} />

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="etiket" htmlFor="d_gun">
              Tarih
            </label>
            <input id="d_gun" name="gun" type="date" defaultValue={gun} className="alan" />
          </div>
          <div>
            <label className="etiket" htmlFor="d_saat">
              Saat
            </label>
            <input id="d_saat" name="saat" type="time" defaultValue={saat} className="alan" />
          </div>
          <div>
            <label className="etiket" htmlFor="d_sure">
              Süre (dk)
            </label>
            <input
              id="d_sure"
              name="duration_min"
              type="number"
              min={5}
              max={240}
              step={5}
              defaultValue={randevu.duration_min}
              className="alan tabular-nums"
            />
          </div>
        </div>

        <fieldset>
          <legend className="etiket">Durum</legend>
          <div className="flex flex-wrap gap-2">
            {[
              { deger: "bos", etiket: "Boş (sitede görünür)" },
              { deger: "dolu", etiket: "Dolu" },
              { deger: "kapali", etiket: "Kapalı / izin" },
            ].map((s) => (
              <label
                key={s.deger}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-cizgi px-3 py-2 text-[0.875rem] text-murekkep has-checked:border-marka-500 has-checked:bg-marka-50"
              >
                <input
                  type="radio"
                  name="status"
                  value={s.deger}
                  checked={secilenDurum === s.deger}
                  onChange={() => setSecilenDurum(s.deger as typeof secilenDurum)}
                  className="h-4 w-4"
                />
                {s.etiket}
              </label>
            ))}
          </div>
        </fieldset>

        {secilenDurum === "dolu" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiket" htmlFor="d_patient">
                Kayıtlı danışan
              </label>
              <select
                id="d_patient"
                name="patient_id"
                value={secilenDanisan}
                onChange={(e) => setSecilenDanisan(e.target.value)}
                className="alan"
              >
                <option value="">Seçilmedi</option>
                {danisanlar.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="etiket" htmlFor="d_patient_name">
                Kayıtsız kişi adı
              </label>
              <input
                id="d_patient_name"
                name="patient_name"
                defaultValue={randevu.patient_name ?? ""}
                placeholder="Henüz kaydı olmayan kişi için"
                className="alan"
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiket" htmlFor="d_kind">
              Tür
            </label>
            <select id="d_kind" name="kind" defaultValue={randevu.kind} className="alan">
              {RANDEVU_TURLERI.map((t) => (
                <option key={t.deger} value={t.deger}>
                  {t.etiket}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-[0.875rem] text-ikincil">
            <input
              type="checkbox"
              name="is_public"
              defaultChecked={Boolean(randevu.is_public)}
              className="h-4 w-4"
            />
            Boşken sitede yayımlansın
          </label>
        </div>

        <div>
          <label className="etiket" htmlFor="d_notes">
            Not
          </label>
          <textarea
            id="d_notes"
            name="notes"
            rows={2}
            defaultValue={randevu.notes ?? ""}
            className="alan"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <GonderDugmesi>Kaydet</GonderDugmesi>
          {hatirlatmaBaglantisi && (
            <a
              href={hatirlatmaBaglantisi}
              target="_blank"
              rel="noopener noreferrer"
              className="dugme dugme-wa"
            >
              <IkonWhatsapp width={16} height={16} /> Hatırlatma gönder
            </a>
          )}
          <Bildirim durum={durum} />
        </div>
      </form>

      <div className="border-t border-cizgi px-5 py-3">
        <form action={randevuKaldir}>
          <input type="hidden" name="id" value={randevu.id} />
          <OnayliDugme
            soru="Bu slot silinsin mi?"
            className="dugme dugme-sessiz text-[0.8125rem] text-[#a52626]"
          >
            <IkonCop width={15} height={15} /> Slotu sil
          </OnayliDugme>
        </form>
      </div>
    </section>
  );
}
