"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Olcum } from "@/lib/tipler";
import { tarihUzun } from "@/lib/tarih";

/**
 * Renkler doğrulanmış kategorik paletten (açık zemin) sırayla alınır:
 * 1 mavi, 2 turuncu, 3 su yeşili. Sıra sabittir, döngüye girmez.
 * Metinler hiçbir zaman seri rengini giymez; kimliği yanındaki renkli
 * çizgi anahtarı taşır.
 */
const SERI_RENKLERI = ["#2a78d6", "#eb6834", "#1baf7a"] as const;
const ZEMIN = "#ffffff";
const IZGARA = "#e1e0d9";
const EKSEN = "#c3c2b7";
const SOLUK_MUREKKEP = "#898781";

type SeriTanimi = { anahtar: keyof Olcum; etiket: string };

type GrafikTanimi = {
  baslik: string;
  aciklama: string;
  birim: string;
  seriler: SeriTanimi[];
  alanTaban?: number;
  ustSinir?: number;
  /** Sınırlı ölçeklerde eksen değerleri yuvarlak kalsın diye elle verilir. */
  isaretler?: number[];
};

const GRAFIKLER: GrafikTanimi[] = [
  {
    baslik: "Cobb açısı",
    aciklama: "Radyolojik eğrilik açısının bölgelere göre seyri",
    birim: "°",
    seriler: [
      { anahtar: "cobb_thoracic", etiket: "Torakal" },
      { anahtar: "cobb_thoracolumbar", etiket: "Torakolomber" },
      { anahtar: "cobb_lumbar", etiket: "Lomber" },
    ],
    alanTaban: 0,
  },
  {
    baslik: "Gövde rotasyonu (ATR)",
    aciklama: "Adams testinde skolyometre ile ölçülen rotasyon",
    birim: "°",
    seriler: [
      { anahtar: "atr_thoracic", etiket: "Torakal" },
      { anahtar: "atr_lumbar", etiket: "Lomber" },
    ],
    alanTaban: 0,
  },
  {
    baslik: "Sagital diziliş",
    aciklama: "Torakal kifoz ve lomber lordoz açıları",
    birim: "°",
    seriler: [
      { anahtar: "kyphosis", etiket: "Kifoz" },
      { anahtar: "lordosis", etiket: "Lordoz" },
    ],
    alanTaban: 0,
  },
  {
    baslik: "Ağrı (VAS)",
    aciklama: "0 = ağrı yok, 10 = dayanılmaz ağrı",
    birim: "/10",
    seriler: [{ anahtar: "vas_pain", etiket: "VAS" }],
    alanTaban: 0,
    ustSinir: 10,
    isaretler: [0, 2, 4, 6, 8, 10],
  },
  {
    baslik: "SRS-22r",
    aciklama: "Yaşam kalitesi anketi ortalaması (1–5)",
    birim: "/5",
    seriler: [{ anahtar: "srs22", etiket: "SRS-22r" }],
    alanTaban: 1,
    ustSinir: 5,
    isaretler: [1, 2, 3, 4, 5],
  },
  {
    baslik: "Korse kullanımı",
    aciklama: "Günlük ortalama korse süresi",
    birim: "sa/gün",
    seriler: [{ anahtar: "brace_hours", etiket: "Korse" }],
    alanTaban: 0,
    ustSinir: 24,
    isaretler: [0, 6, 12, 18, 24],
  },
  {
    baslik: "Boy",
    aciklama: "Büyüme atağı takibi",
    birim: "cm",
    seriler: [{ anahtar: "height_cm", etiket: "Boy" }],
  },
  {
    baslik: "Kilo",
    aciklama: "Vücut ağırlığı seyri",
    birim: "kg",
    seriler: [{ anahtar: "weight_kg", etiket: "Kilo" }],
  },
  {
    baslik: "Omuz ve pelvis asimetrisi",
    aciklama: "Postüral asimetri ölçümleri",
    birim: "mm",
    seriler: [
      { anahtar: "shoulder_asym", etiket: "Omuz" },
      { anahtar: "pelvis_asym", etiket: "Pelvis" },
    ],
    alanTaban: 0,
  },
];

function kisaTarih(gun: string) {
  const [y, a, g] = gun.split("-");
  return `${g}.${a}.${y.slice(2)}`;
}

function sayiBicim(deger: number, birim: string) {
  const yuvarlak = Number.isInteger(deger) ? String(deger) : deger.toFixed(1);
  return birim.startsWith("/") ? `${yuvarlak}${birim}` : `${yuvarlak} ${birim}`.trim();
}

type Nokta = { etiket: string; tamTarih: string } & Record<string, number | string | null>;

function IpucuKutusu({
  active,
  payload,
  label,
  birim,
}: {
  active?: boolean;
  payload?: {
    dataKey?: string | number;
    value?: number;
    name?: string;
    color?: string;
    payload?: Nokta;
  }[];
  label?: string;
  birim: string;
}) {
  if (!active || !payload?.length) return null;
  const tamTarih = payload[0]?.payload?.tamTarih;
  return (
    <div className="rounded-lg border border-cizgi bg-yuzey px-3 py-2 shadow-md shadow-black/5">
      <p className="text-[0.75rem] text-ikincil">{tamTarih ?? label}</p>
      <ul className="mt-1 space-y-0.5">
        {payload
          .filter((p) => p.value !== null && p.value !== undefined)
          .map((p) => (
            <li key={String(p.dataKey)} className="flex items-center gap-2 text-[0.8125rem]">
              <span
                aria-hidden="true"
                className="h-0.5 w-3.5 rounded-full"
                style={{ background: p.color }}
              />
              <span className="text-ikincil">{p.name}</span>
              <span className="ml-auto font-medium tabular-nums text-murekkep">
                {sayiBicim(Number(p.value), birim)}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}

function Grafik({ tanim, olcumler }: { tanim: GrafikTanimi; olcumler: Olcum[] }) {
  const { veri, aktifSeriler } = useMemo(() => {
    const aktif = tanim.seriler.filter((s) =>
      olcumler.some((o) => o[s.anahtar] !== null && o[s.anahtar] !== undefined),
    );
    const noktalar: Nokta[] = olcumler.map((o) => {
      const n: Nokta = { etiket: kisaTarih(o.measured_on), tamTarih: tarihUzun(o.measured_on) };
      for (const s of aktif) n[s.anahtar as string] = (o[s.anahtar] as number | null) ?? null;
      return n;
    });
    return { veri: noktalar, aktifSeriler: aktif };
  }, [tanim, olcumler]);

  if (aktifSeriler.length === 0) return null;

  const sonDegerler = aktifSeriler.map((s) => {
    const dolu = [...olcumler].reverse().find((o) => o[s.anahtar] !== null);
    return { ...s, son: dolu ? (dolu[s.anahtar] as number) : null };
  });

  // Tek nokta varsa çizgi görünmez; noktayı görünür kılmak için dot boyunu koruyoruz.
  const tekNokta = veri.length === 1;

  return (
    <figure className="kart p-5">
      <figcaption className="mb-1">
        <h3 className="text-[0.9375rem] font-semibold text-murekkep">
          {tanim.baslik}
          <span className="ml-1.5 font-normal text-soluk">({tanim.birim})</span>
        </h3>
        <p className="text-[0.8125rem] text-ikincil">{tanim.aciklama}</p>
      </figcaption>

      {/* Gösterge — iki ve daha fazla seride kimlik yalnız renge bırakılmaz;
          tek seride de son değeri taşıdığı için gösterilir. */}
      <ul className="mb-3 mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {sonDegerler.map((s, i) => (
          <li key={String(s.anahtar)} className="flex items-center gap-2 text-[0.8125rem]">
            <span
              aria-hidden="true"
              className="h-0.5 w-4 rounded-full"
              style={{ background: SERI_RENKLERI[i % SERI_RENKLERI.length] }}
            />
            <span className="text-ikincil">{s.etiket}</span>
            <span className="font-medium tabular-nums text-murekkep">
              {s.son !== null ? sayiBicim(s.son, tanim.birim) : "—"}
            </span>
          </li>
        ))}
      </ul>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={veri} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={IZGARA} strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="etiket"
              tickLine={false}
              axisLine={{ stroke: EKSEN }}
              tick={{ fill: SOLUK_MUREKKEP, fontSize: 12 }}
              minTickGap={16}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fill: SOLUK_MUREKKEP, fontSize: 12 }}
              domain={[
                tanim.alanTaban !== undefined ? tanim.alanTaban : "auto",
                tanim.ustSinir !== undefined ? tanim.ustSinir : "auto",
              ]}
              allowDecimals={false}
              ticks={tanim.isaretler}
            />
            <Tooltip
              content={<IpucuKutusu birim={tanim.birim} />}
              cursor={{ stroke: EKSEN, strokeWidth: 1 }}
            />
            {aktifSeriler.map((s, i) => {
              const renk = SERI_RENKLERI[i % SERI_RENKLERI.length];
              return (
                <Line
                  key={String(s.anahtar)}
                  type="monotone"
                  dataKey={String(s.anahtar)}
                  name={s.etiket}
                  stroke={renk}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  connectNulls
                  // Nokta seri rengiyle dolu, çevresinde zemin renginde 2px halka:
                  // çizgilerin kesiştiği yerde bile okunur kalır.
                  dot={{ r: tekNokta ? 5 : 4, fill: renk, strokeWidth: 2, stroke: ZEMIN }}
                  activeDot={{ r: 5.5, fill: renk, strokeWidth: 2, stroke: ZEMIN }}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

export default function OlcumGrafikleri({ olcumler }: { olcumler: Olcum[] }) {
  const gosterilecek = GRAFIKLER.filter((g) =>
    g.seriler.some((s) => olcumler.some((o) => o[s.anahtar] !== null)),
  );

  if (gosterilecek.length === 0) {
    return (
      <div className="kart px-5 py-12 text-center">
        <p className="text-[0.9375rem] font-medium text-murekkep">Henüz grafik yok</p>
        <p className="mx-auto mt-1 max-w-sm text-[0.8125rem] text-ikincil">
          İlk ölçümü kaydettiğinizde ilgili başlıklar için grafikler otomatik olarak
          oluşur.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {gosterilecek.map((g) => (
        <Grafik key={g.baslik} tanim={g} olcumler={olcumler} />
      ))}
    </div>
  );
}
