import { redirect } from "next/navigation";
import { IkonOmurga } from "@/components/Ikonlar";
import { KurulumFormu } from "@/components/KimlikFormu";
import { Uyari } from "@/components/ui";
import { kurulumTamamMi } from "@/lib/auth";

export const metadata = { title: "İlk kurulum" };

export default function KurulumSayfasi() {
  if (kurulumTamamMi()) redirect("/giris");

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-marka-600 text-white">
            <IkonOmurga width={22} height={22} />
          </span>
          <span className="text-[1.0625rem] font-semibold text-murekkep">İlk kurulum</span>
        </div>

        <div className="kart space-y-5 p-6">
          <div>
            <h1 className="text-[1.0625rem] font-semibold text-murekkep">
              Panel parolasını belirleyin
            </h1>
            <p className="mt-1.5 text-[0.875rem] text-ikincil">
              Danışan kayıtlarına yalnızca bu parolayla erişilir. Parolayı yalnızca siz
              biliyorsunuz; kaybederseniz veritabanındaki{" "}
              <code className="rounded bg-zemin px-1 py-0.5 text-[0.8125rem]">
                panel_parola_hash
              </code>{" "}
              kaydını silmeniz gerekir.
            </p>
          </div>

          <KurulumFormu />

          <Uyari>
            Danışanlara ait sağlık verileri özel nitelikli kişisel veridir. Uygulamayı
            HTTPS üzerinden yayına alın ve veritabanı dosyasının düzenli yedeğini alın.
          </Uyari>
        </div>
      </div>
    </main>
  );
}
