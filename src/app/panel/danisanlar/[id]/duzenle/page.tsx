import { notFound } from "next/navigation";
import DanisanFormu from "@/components/DanisanFormu";
import { GeriBaglantisi, SayfaBasligi } from "@/components/ui";
import { danisanGetir } from "@/lib/sorgular";

export const metadata = { title: "Danışanı düzenle" };

export default async function DanisanDuzenleSayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const danisan = danisanGetir(Number(id));
  if (!danisan) notFound();

  return (
    <>
      <GeriBaglantisi href={`/panel/danisanlar/${danisan.id}`} metin={danisan.full_name} />
      <div className="mt-3">
        <SayfaBasligi baslik="Danışan bilgilerini düzenle" />
      </div>
      <DanisanFormu danisan={danisan} />
    </>
  );
}
