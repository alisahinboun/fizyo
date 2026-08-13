import PanelKenar from "@/components/PanelKenar";
import { yetkiGerekli } from "@/lib/auth";
import { getSetting } from "@/lib/settings";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await yetkiGerekli();
  const klinikAdi = getSetting("klinik_adi");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <PanelKenar klinikAdi={klinikAdi} />
      <main className="min-w-0 flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
