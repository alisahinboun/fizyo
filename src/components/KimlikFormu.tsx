"use client";

import { useActionState } from "react";
import { girisYap, kurulumYap } from "@/app/actions/kimlik";
import { Bildirim, GonderDugmesi } from "@/components/Gonder";

export function GirisFormu() {
  const [durum, eylem] = useActionState(girisYap, null);
  return (
    <form action={eylem} className="space-y-4">
      <div>
        <label className="etiket" htmlFor="parola">
          Panel parolası
        </label>
        <input
          id="parola"
          name="parola"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="alan"
          placeholder="••••••••"
        />
      </div>
      <Bildirim durum={durum} />
      <GonderDugmesi className="dugme dugme-birincil w-full py-2.5" bekleyen="Kontrol ediliyor…">
        Giriş yap
      </GonderDugmesi>
    </form>
  );
}

export function KurulumFormu() {
  const [durum, eylem] = useActionState(kurulumYap, null);
  return (
    <form action={eylem} className="space-y-4">
      <div>
        <label className="etiket" htmlFor="parola">
          Yeni panel parolası
        </label>
        <input
          id="parola"
          name="parola"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          autoFocus
          className="alan"
          placeholder="En az 8 karakter"
        />
      </div>
      <div>
        <label className="etiket" htmlFor="parola_tekrar">
          Parola tekrar
        </label>
        <input
          id="parola_tekrar"
          name="parola_tekrar"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="alan"
        />
      </div>
      <Bildirim durum={durum} />
      <GonderDugmesi className="dugme dugme-birincil w-full py-2.5" bekleyen="Kaydediliyor…">
        Parolayı belirle ve gir
      </GonderDugmesi>
    </form>
  );
}
