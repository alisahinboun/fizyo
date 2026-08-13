"use client";

import Link from "next/link";
import { useActionState } from "react";
import { danisanKaydet } from "@/app/actions/danisan";
import { Bildirim, GonderDugmesi } from "@/components/Gonder";
import {
  EGRILIK_PATERNLERI,
  KONVEKSITE,
  SKOLYOZ_TIPLERI,
  YONTEMLER,
  type Danisan,
} from "@/lib/tipler";

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
  tur = "text",
  deger,
  genis,
  ...rest
}: {
  ad: string;
  etiket: string;
  tur?: string;
  deger?: string | number | null;
  genis?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={genis ? "sm:col-span-2" : undefined}>
      <label className="etiket" htmlFor={ad}>
        {etiket}
      </label>
      <input
        id={ad}
        name={ad}
        type={tur}
        defaultValue={deger ?? ""}
        className="alan"
        {...rest}
      />
    </div>
  );
}

function Secim({
  ad,
  etiket,
  secenekler,
  deger,
  bosEtiket = "Seçilmedi",
}: {
  ad: string;
  etiket: string;
  secenekler: readonly string[];
  deger?: string | null;
  bosEtiket?: string;
}) {
  return (
    <div>
      <label className="etiket" htmlFor={ad}>
        {etiket}
      </label>
      <select id={ad} name={ad} defaultValue={deger ?? ""} className="alan">
        <option value="">{bosEtiket}</option>
        {secenekler.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function DanisanFormu({ danisan }: { danisan?: Danisan }) {
  const [durum, eylem] = useActionState(danisanKaydet, null);
  const d = danisan;

  return (
    <form action={eylem} className="space-y-4">
      {d && <input type="hidden" name="id" value={d.id} />}

      <Bolum baslik="Kimlik ve iletişim">
        <Alan ad="full_name" etiket="Ad soyad *" deger={d?.full_name} required genis />
        <Alan ad="birth_date" etiket="Doğum tarihi" tur="date" deger={d?.birth_date} />
        <div>
          <label className="etiket" htmlFor="gender">
            Cinsiyet
          </label>
          <select id="gender" name="gender" defaultValue={d?.gender ?? ""} className="alan">
            <option value="">Seçilmedi</option>
            <option value="Kadın">Kadın</option>
            <option value="Erkek">Erkek</option>
            <option value="Belirtmek istemiyor">Belirtmek istemiyor</option>
          </select>
        </div>
        <Alan ad="phone" etiket="Telefon" tur="tel" deger={d?.phone} placeholder="05xx xxx xx xx" />
        <Alan ad="email" etiket="E-posta" tur="email" deger={d?.email} />
        <Alan ad="guardian_name" etiket="Veli / yakın adı" deger={d?.guardian_name} />
        <Alan ad="guardian_phone" etiket="Veli telefonu" tur="tel" deger={d?.guardian_phone} />
        <Alan ad="city" etiket="Şehir" deger={d?.city} />
        <Alan ad="occupation" etiket="Meslek / okul" deger={d?.occupation} />
      </Bolum>

      <Bolum
        baslik="Klinik tablo"
        aciklama="Değerlendirme sırasında belirlenen tanı ve eğrilik özellikleri."
      >
        <Secim
          ad="scoliosis_type"
          etiket="Skolyoz tipi"
          secenekler={SKOLYOZ_TIPLERI}
          deger={d?.scoliosis_type}
        />
        <Secim
          ad="curve_pattern"
          etiket="Eğrilik paterni"
          secenekler={EGRILIK_PATERNLERI}
          deger={d?.curve_pattern}
        />
        <Secim
          ad="convexity"
          etiket="Konveksite"
          secenekler={KONVEKSITE}
          deger={d?.convexity}
        />
        <Alan
          ad="risser"
          etiket="Risser evresi (0–5)"
          tur="number"
          min={0}
          max={5}
          step={1}
          deger={d?.risser}
        />
        <Alan ad="diagnosis_date" etiket="Tanı tarihi" tur="date" deger={d?.diagnosis_date} />
        <Alan ad="menarche" etiket="Menarş (varsa)" deger={d?.menarche} placeholder="örn. 12 yaş / yok" />
        <Alan ad="brace" etiket="Korse" deger={d?.brace} placeholder="örn. Chêneau" />
        <Alan
          ad="brace_hours_target"
          etiket="Hedef korse süresi (sa/gün)"
          tur="number"
          min={0}
          max={24}
          step="0.5"
          deger={d?.brace_hours_target}
        />
        <Alan ad="referring_doctor" etiket="Yönlendiren hekim" deger={d?.referring_doctor} />
        <Secim ad="method" etiket="Uygulanan yöntem" secenekler={YONTEMLER} deger={d?.method} />
      </Bolum>

      <Bolum baslik="Hedefler ve notlar">
        <div className="sm:col-span-2">
          <label className="etiket" htmlFor="goals">
            Tedavi hedefleri
          </label>
          <textarea
            id="goals"
            name="goals"
            rows={3}
            defaultValue={d?.goals ?? ""}
            className="alan"
            placeholder="örn. Cobb açısının stabil kalması, ağrının azalması, korse uyumunun artması"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="etiket" htmlFor="medical_notes">
            Tıbbi notlar / öykü
          </label>
          <textarea
            id="medical_notes"
            name="medical_notes"
            rows={4}
            defaultValue={d?.medical_notes ?? ""}
            className="alan"
            placeholder="Ek tanılar, ameliyat öyküsü, ilaç kullanımı, kontrendikasyonlar…"
          />
        </div>
        <div>
          <label className="etiket" htmlFor="status">
            Kayıt durumu
          </label>
          <select id="status" name="status" defaultValue={d?.status ?? "aktif"} className="alan">
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
          </select>
        </div>
        <label className="flex items-start gap-2.5 self-end rounded-lg bg-zemin px-3 py-2.5 text-[0.8125rem] text-ikincil">
          <input
            type="checkbox"
            name="kvkk_consent"
            defaultChecked={Boolean(d?.kvkk_consent)}
            className="mt-0.5 h-4 w-4"
          />
          <span>KVKK aydınlatma metni okundu, açık rıza alındı.</span>
        </label>
      </Bolum>

      <div className="flex flex-wrap items-center gap-3">
        <GonderDugmesi>{d ? "Değişiklikleri kaydet" : "Danışanı kaydet"}</GonderDugmesi>
        <Link
          href={d ? `/panel/danisanlar/${d.id}` : "/panel/danisanlar"}
          className="dugme dugme-ikincil"
        >
          Vazgeç
        </Link>
        <Bildirim durum={durum} />
      </div>
    </form>
  );
}
