import DanisanFormu from "@/components/DanisanFormu";
import { GeriBaglantisi, SayfaBasligi } from "@/components/ui";

export const metadata = { title: "Yeni danışan" };

export default function YeniDanisanSayfasi() {
  return (
    <>
      <GeriBaglantisi href="/panel/danisanlar" metin="Danışanlar" />
      <div className="mt-3">
        <SayfaBasligi
          baslik="Yeni danışan"
          aciklama="Yalnızca ad soyad zorunlu; diğer alanları süreç ilerledikçe doldurabilirsiniz."
        />
      </div>
      <DanisanFormu />
    </>
  );
}
