import Link from "next/link";
import { AyarlarFormu, ParolaFormu } from "@/components/AyarlarFormu";
import { Kart, KartBaslik, SayfaBasligi, Uyari } from "@/components/ui";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Ayarlar" };

export default function AyarlarSayfasi() {
  const ayarlar = getSettings();

  return (
    <>
      <SayfaBasligi
        baslik="Ayarlar"
        aciklama="Site metinleri, iletişim bilgileri ve randevu akışı."
        sag={
          <Link href="/" target="_blank" className="dugme dugme-ikincil">
            Siteyi görüntüle
          </Link>
        }
      />

      <AyarlarFormu ayarlar={ayarlar} />

      <Kart className="mt-4">
        <KartBaslik
          baslik="Panel parolası"
          aciklama="Danışan verilerine erişimi koruyan tek parola."
        />
        <ParolaFormu />
      </Kart>

      <div className="mt-4">
        <Uyari ton="uyari">
          Danışan sağlık verileri özel nitelikli kişisel veridir. Uygulamayı HTTPS
          üzerinden yayınlayın, <code>data/fizyo.db</code> dosyasının düzenli yedeğini
          alın ve paneli ortak kullanılan cihazlarda açık bırakmayın.
        </Uyari>
      </div>
    </>
  );
}
