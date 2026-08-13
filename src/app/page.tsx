import Link from "next/link";
import SlotSecici, { type AcikSlot } from "@/components/SlotSecici";
import {
  IkonInstagram,
  IkonKonum,
  IkonOmurga,
  IkonPosta,
  IkonTelefon,
  IkonWhatsapp,
} from "@/components/Ikonlar";
import { acikSlotlar } from "@/lib/sorgular";
import { getSettings } from "@/lib/settings";
import { zamaniAyir } from "@/lib/tarih";
import { whatsappBaglantisi } from "@/lib/whatsapp";

const SURECLER = [
  {
    baslik: "Değerlendirme",
    metin:
      "Adams testi ve skolyometre ile gövde rotasyonu, eğrilik paterni, esneklik ve postür analizi yapılır. Varsa röntgen ve Cobb açısı kayda geçer.",
  },
  {
    baslik: "Kişiye özel program",
    metin:
      "Eğrilik tipine göre üç boyutlu düzeltme, solunum ve stabilizasyon egzersizlerinden oluşan bir program kurgulanır; ev programı ile desteklenir.",
  },
  {
    baslik: "Ölçümle takip",
    metin:
      "Her kontrolde aynı parametreler yeniden ölçülür. İlerleme grafiklerle görünür hale gelir, program buna göre güncellenir.",
  },
];

const HIZMETLER = [
  {
    baslik: "Skolyoz değerlendirmesi",
    metin: "Detaylı postür ve eğrilik analizi, rapor ve yönlendirme.",
  },
  {
    baslik: "Üç boyutlu egzersiz seansları",
    metin: "Schroth temelli, eğrilik paternine özel bireysel seanslar.",
  },
  {
    baslik: "Korse süreci desteği",
    metin: "Korse ile birlikte yürütülen egzersiz programı ve uyum takibi.",
  },
  {
    baslik: "Kifoz ve postür bozuklukları",
    metin: "Scheuermann kifozu, düz sırt ve postüral şikâyetlerde çalışma.",
  },
  {
    baslik: "Erişkin skolyozu & ağrı",
    metin: "Dejeneratif skolyozda ağrı yönetimi ve fonksiyonel kapasite.",
  },
  {
    baslik: "Ev programı ve takip",
    metin: "Günlük yaşam düzenlemeleri, ev egzersizleri ve düzenli kontrol.",
  },
];

export default function AnaSayfa() {
  const a = getSettings();
  const haftaSayisi = Math.max(1, Math.min(12, Number(a.acik_hafta_sayisi) || 3));

  const slotlar: AcikSlot[] = acikSlotlar(haftaSayisi).map((r) => {
    const { gun, saat } = zamaniAyir(r.starts_at);
    return { id: r.id, gun, saat, sureDk: r.duration_min, tur: r.kind };
  });

  const genelWa = whatsappBaglantisi(a.whatsapp_numarasi, a.whatsapp_genel_mesaji);
  const iletisimVar = a.telefon || a.eposta || a.adres || a.instagram;

  return (
    <div className="flex min-h-screen flex-col">
      {/* ------------------------------------------------------------ üst bar */}
      <header className="sticky top-0 z-30 border-b border-cizgi bg-yuzey/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-marka-600 text-white">
              <IkonOmurga width={20} height={20} />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.9375rem] font-semibold text-murekkep">
                {a.klinik_adi}
              </span>
              <span className="block text-[0.75rem] text-ikincil">{a.unvan}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-[0.875rem] text-ikincil md:flex">
            <a href="#surec" className="hover:text-marka-700">
              Süreç
            </a>
            <a href="#hizmetler" className="hover:text-marka-700">
              Hizmetler
            </a>
            <a href="#randevu" className="hover:text-marka-700">
              Randevu
            </a>
            <a href="#iletisim" className="hover:text-marka-700">
              İletişim
            </a>
          </nav>

          <a
            href={genelWa}
            target="_blank"
            rel="noopener noreferrer"
            className="dugme dugme-wa"
          >
            <IkonWhatsapp />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* --------------------------------------------------------- kahraman */}
        <section className="border-b border-cizgi bg-linear-to-b from-marka-50 to-zemin">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.15fr_1fr] md:items-center md:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-marka-200 bg-yuzey px-3 py-1 text-[0.8125rem] font-medium text-marka-700">
                <IkonOmurga width={15} height={15} />
                Skolyoza özel fizyoterapi
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-murekkep md:text-5xl">
                {a.hero_baslik}
              </h1>
              <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ikincil">
                {a.hero_metin}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#randevu" className="dugme dugme-birincil px-5 py-3">
                  Boş randevu saatlerini gör
                </a>
                <a
                  href={genelWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dugme dugme-ikincil px-5 py-3"
                >
                  <IkonWhatsapp /> Bilgi al
                </a>
              </div>
            </div>

            <div className="kart p-6">
              <h2 className="text-[0.9375rem] font-semibold text-murekkep">
                Takipte ölçülen başlıklar
              </h2>
              <p className="mt-1 text-[0.8125rem] text-ikincil">
                Her kontrolde aynı parametreler kaydedilir, değişim grafiklerle izlenir.
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-3 text-[0.875rem]">
                {[
                  "Cobb açısı",
                  "Gövde rotasyonu (ATR)",
                  "Kifoz / lordoz",
                  "Omuz–pelvis simetrisi",
                  "Boy ve oturma yüksekliği",
                  "Ağrı (VAS) ve SRS-22r",
                  "Risser evresi",
                  "Korse kullanım süresi",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-2 rounded-lg bg-zemin px-3 py-2 text-murekkep"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-marka-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ süreç */}
        <section id="surec" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-murekkep">
            Süreç nasıl ilerliyor?
          </h2>
          <p className="mt-2 max-w-2xl text-[0.9375rem] text-ikincil">
            Skolyoz takibi tek seferlik bir müdahale değil; ölçüm, program ve kontrolden
            oluşan sürekli bir döngüdür.
          </p>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {SURECLER.map((s, i) => (
              <li key={s.baslik} className="kart p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-marka-50 text-[0.875rem] font-semibold text-marka-700">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-[1.0625rem] font-semibold text-murekkep">
                  {s.baslik}
                </h3>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-ikincil">{s.metin}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* -------------------------------------------------------- hizmetler */}
        <section id="hizmetler" className="border-y border-cizgi bg-yuzey">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <h2 className="text-2xl font-semibold tracking-tight text-murekkep">
              Hizmetler
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {HIZMETLER.map((h) => (
                <div
                  key={h.baslik}
                  className="rounded-xl border border-cizgi bg-zemin p-5 transition hover:border-marka-200 hover:bg-marka-50"
                >
                  <h3 className="text-[0.9375rem] font-semibold text-murekkep">{h.baslik}</h3>
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ikincil">
                    {h.metin}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- randevu */}
        <section id="randevu" className="mx-auto max-w-4xl px-5 py-16 md:py-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-murekkep">
              Boş randevu saatleri
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-[0.9375rem] text-ikincil">
              Önümüzdeki {haftaSayisi} hafta için yayımlanan uygun saatler aşağıda.
              Uygun bir saat seçin, hazır mesajla WhatsApp üzerinden randevu talebinizi
              iletin.
            </p>
          </div>

          <SlotSecici
            slotlar={slotlar}
            whatsappNumarasi={a.whatsapp_numarasi}
            mesajSablonu={a.whatsapp_mesaji}
            genelMesaj={a.whatsapp_genel_mesaji}
            klinikAdi={a.klinik_adi}
            uzmanAdi={a.uzman_adi}
          />
        </section>

        {/* --------------------------------------------------------- hakkında */}
        <section className="border-y border-cizgi bg-yuzey">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:py-20">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-murekkep">
                {a.uzman_adi}
              </h2>
              <p className="mt-1 text-[0.9375rem] text-marka-700">{a.unvan}</p>
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-ikincil">
                {a.hakkinda_metin}
              </p>
            </div>
            <div className="kart p-6">
              <h3 className="text-[0.9375rem] font-semibold text-murekkep">
                Randevu nasıl alınır?
              </h3>
              <ol className="mt-4 space-y-4 text-[0.875rem] text-ikincil">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marka-50 text-[0.75rem] font-semibold text-marka-700">
                    1
                  </span>
                  Yukarıdaki takvimden size uygun boş saati seçin.
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marka-50 text-[0.75rem] font-semibold text-marka-700">
                    2
                  </span>
                  WhatsApp butonuna dokunun; tarih ve saat bilgisi mesaja otomatik
                  eklenir.
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marka-50 text-[0.75rem] font-semibold text-marka-700">
                    3
                  </span>
                  Mesajı gönderin; randevunuz karşılıklı teyitle kesinleşir.
                </li>
              </ol>
              <p className="mt-5 rounded-lg bg-zemin px-3 py-2 text-[0.8125rem] text-ikincil">
                Online rezervasyon yapılmaz; her randevu bire bir görüşmeyle planlanır.
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- iletişim */}
        <section id="iletisim" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="kart grid gap-8 p-8 md:grid-cols-2 md:p-10">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-murekkep">
                İletişim
              </h2>
              <p className="mt-2 text-[0.9375rem] text-ikincil">
                Sorularınız için en hızlı yanıt WhatsApp üzerinden alınır.
              </p>
              <a
                href={genelWa}
                target="_blank"
                rel="noopener noreferrer"
                className="dugme dugme-wa mt-6 px-5 py-3"
              >
                <IkonWhatsapp /> WhatsApp&apos;tan yaz
              </a>
            </div>

            {iletisimVar ? (
              <ul className="space-y-3 text-[0.9375rem] md:border-l md:border-cizgi md:pl-8">
                {a.telefon && (
                  <li>
                    <a
                      href={`tel:${a.telefon.replace(/\s/g, "")}`}
                      className="flex items-center gap-3 text-murekkep hover:text-marka-700"
                    >
                      <IkonTelefon className="text-marka-500" /> {a.telefon}
                    </a>
                  </li>
                )}
                {a.eposta && (
                  <li>
                    <a
                      href={`mailto:${a.eposta}`}
                      className="flex items-center gap-3 text-murekkep hover:text-marka-700"
                    >
                      <IkonPosta className="text-marka-500" /> {a.eposta}
                    </a>
                  </li>
                )}
                {a.adres && (
                  <li className="flex items-start gap-3 text-murekkep">
                    <IkonKonum className="mt-0.5 shrink-0 text-marka-500" /> {a.adres}
                  </li>
                )}
                {a.instagram && (
                  <li>
                    <a
                      href={
                        a.instagram.startsWith("http")
                          ? a.instagram
                          : `https://instagram.com/${a.instagram.replace(/^@/, "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-murekkep hover:text-marka-700"
                    >
                      <IkonInstagram className="text-marka-500" /> {a.instagram}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-[0.875rem] text-soluk md:border-l md:border-cizgi md:pl-8">
                İletişim bilgileri panel &rsaquo; Ayarlar bölümünden eklenebilir.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------- alt bar */}
      <footer className="border-t border-cizgi bg-yuzey">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-[0.8125rem] text-soluk">
          <p>
            © {new Date().getFullYear()} {a.klinik_adi}. Bu sayfadaki bilgiler tanı veya
            tedavi yerine geçmez.
          </p>
          <Link href="/panel" className="hover:text-marka-700">
            Uzman girişi
          </Link>
        </div>
      </footer>
    </div>
  );
}
