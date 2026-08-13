"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { olcumKaydet } from "@/app/actions/olcum";
import { Bildirim, GonderDugmesi } from "@/components/Gonder";
import { OLCUM_ALANLARI, type Olcum, type OlcumAlani } from "@/lib/tipler";
import { bugun } from "@/lib/tarih";

const GRUPLAR = ["Cobb açısı", "Rotasyon & postür", "Antropometri", "Klinik durum"] as const;

function AlanKutusu({ alan, deger }: { alan: OlcumAlani; deger?: number | null }) {
  const ad = String(alan.anahtar);
  return (
    <div>
      <label className="etiket" htmlFor={ad}>
        {alan.etiket}
        {alan.birim && <span className="ml-1 font-normal text-soluk">({alan.birim})</span>}
      </label>
      <input
        id={ad}
        name={ad}
        type="number"
        inputMode="decimal"
        step={alan.adim ?? "0.1"}
        min={alan.min}
        max={alan.max}
        defaultValue={deger ?? ""}
        placeholder="—"
        title={alan.ipucu}
        className="alan tabular-nums"
      />
    </div>
  );
}

export default function OlcumFormu({
  danisanId,
  olcum,
  acikBasla = false,
}: {
  danisanId: number;
  olcum?: Olcum;
  acikBasla?: boolean;
}) {
  const [durum, eylem] = useActionState(olcumKaydet, null);
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Açık/kapalı durumu bileşenin kendi state'inde tutulur. Kayıttan sonra
   * sunucu bileşeni yeniden render edildiğinde `acikBasla` değişse bile panel
   * kapanmaz; kullanıcı "kaydedildi" bildirimini görebilir.
   */
  const [acik, setAcik] = useState(acikBasla || Boolean(olcum));

  useEffect(() => {
    if (durum?.basari && !olcum) formRef.current?.reset();
  }, [durum, olcum]);

  return (
    <details
      open={acik}
      onToggle={(e) => setAcik(e.currentTarget.open)}
      className="kart group"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
        <span>
          <span className="block text-[0.9375rem] font-semibold text-murekkep">
            {olcum ? "Ölçümü düzenle" : "Yeni ölçüm ekle"}
          </span>
          <span className="block text-[0.8125rem] text-ikincil">
            Yalnızca ölçtüğünüz alanları doldurun; boş bırakılanlar kaydedilmez.
          </span>
        </span>
        <span className="dugme dugme-ikincil shrink-0 text-[0.8125rem]">
          <span className="group-open:hidden">Aç</span>
          <span className="hidden group-open:inline">Kapat</span>
        </span>
      </summary>

      <form ref={formRef} action={eylem} className="border-t border-cizgi px-5 py-5">
        <input type="hidden" name="patient_id" value={danisanId} />
        {olcum && <input type="hidden" name="id" value={olcum.id} />}

        <div className="max-w-xs">
          <label className="etiket" htmlFor="measured_on">
            Ölçüm tarihi *
          </label>
          <input
            id="measured_on"
            name="measured_on"
            type="date"
            required
            defaultValue={olcum?.measured_on ?? bugun()}
            className="alan"
          />
        </div>

        {GRUPLAR.map((grup) => {
          const alanlar = OLCUM_ALANLARI.filter((a) => a.grup === grup);
          return (
            <fieldset key={grup} className="mt-6">
              <legend className="mb-3 text-[0.8125rem] font-semibold uppercase tracking-wide text-soluk">
                {grup}
              </legend>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {alanlar.map((a) => (
                  <AlanKutusu
                    key={String(a.anahtar)}
                    alan={a}
                    deger={olcum ? (olcum[a.anahtar] as number | null) : undefined}
                  />
                ))}
              </div>
            </fieldset>
          );
        })}

        <div className="mt-6">
          <label className="etiket" htmlFor="notes">
            Seans / ölçüm notu
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={olcum?.notes ?? ""}
            className="alan"
            placeholder="Gözlemler, program değişikliği, ev egzersizi uyumu…"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <GonderDugmesi>{olcum ? "Ölçümü güncelle" : "Ölçümü kaydet"}</GonderDugmesi>
          <Bildirim durum={durum} />
        </div>
      </form>
    </details>
  );
}
