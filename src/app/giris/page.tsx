import Link from "next/link";
import { redirect } from "next/navigation";
import { IkonKilit, IkonOmurga } from "@/components/Ikonlar";
import { GirisFormu } from "@/components/KimlikFormu";
import { girisYapilmisMi, kurulumTamamMi } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Uzman girişi" };

export default async function GirisSayfasi() {
  if (!kurulumTamamMi()) redirect("/kurulum");
  if (await girisYapilmisMi()) redirect("/panel");

  const a = getSettings();

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-marka-600 text-white">
            <IkonOmurga width={22} height={22} />
          </span>
          <span className="text-[1.0625rem] font-semibold text-murekkep">{a.klinik_adi}</span>
        </Link>

        <div className="kart p-6">
          <div className="mb-5 flex items-center gap-2 text-marka-700">
            <IkonKilit width={16} height={16} />
            <h1 className="text-[0.9375rem] font-semibold">Uzman girişi</h1>
          </div>
          <GirisFormu />
        </div>

        <p className="mt-6 text-center text-[0.8125rem] text-soluk">
          <Link href="/" className="hover:text-marka-700">
            ← Siteye dön
          </Link>
        </p>
      </div>
    </main>
  );
}
