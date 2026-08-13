import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Cizgi({ children, ...p }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
      aria-hidden="true"
      {...p}
    >
      {children}
    </svg>
  );
}

export const IkonPano = (p: P) => (
  <Cizgi {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Cizgi>
);

export const IkonKisiler = (p: P) => (
  <Cizgi {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Cizgi>
);

export const IkonTakvim = (p: P) => (
  <Cizgi {...p}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 10h18M8 2v4M16 2v4" />
  </Cizgi>
);

export const IkonGrafik = (p: P) => (
  <Cizgi {...p}>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="M7 15l4-5 3 3 5-6" />
  </Cizgi>
);

export const IkonAyar = (p: P) => (
  <Cizgi {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Cizgi>
);

export const IkonCikis = (p: P) => (
  <Cizgi {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </Cizgi>
);

export const IkonArti = (p: P) => (
  <Cizgi {...p}>
    <path d="M12 5v14M5 12h14" />
  </Cizgi>
);

export const IkonArama = (p: P) => (
  <Cizgi {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </Cizgi>
);

export const IkonKalem = (p: P) => (
  <Cizgi {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Cizgi>
);

export const IkonCop = (p: P) => (
  <Cizgi {...p}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </Cizgi>
);

export const IkonOnay = (p: P) => (
  <Cizgi {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Cizgi>
);

export const IkonKapat = (p: P) => (
  <Cizgi {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Cizgi>
);

export const IkonSol = (p: P) => (
  <Cizgi {...p}>
    <path d="m15 18-6-6 6-6" />
  </Cizgi>
);

export const IkonSag = (p: P) => (
  <Cizgi {...p}>
    <path d="m9 18 6-6-6-6" />
  </Cizgi>
);

export const IkonTelefon = (p: P) => (
  <Cizgi {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </Cizgi>
);

export const IkonPosta = (p: P) => (
  <Cizgi {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </Cizgi>
);

export const IkonKonum = (p: P) => (
  <Cizgi {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </Cizgi>
);

export const IkonInstagram = (p: P) => (
  <Cizgi {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </Cizgi>
);

export const IkonSaat = (p: P) => (
  <Cizgi {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Cizgi>
);

export const IkonYazdir = (p: P) => (
  <Cizgi {...p}>
    <path d="M6 9V3h12v6" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="7" rx="1" />
  </Cizgi>
);

export const IkonKilit = (p: P) => (
  <Cizgi {...p}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Cizgi>
);

export const IkonBilgi = (p: P) => (
  <Cizgi {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4M12 8h.01" />
  </Cizgi>
);

/** WhatsApp — dolu marka logosu (çizgi ikon değil). */
export const IkonWhatsapp = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18} aria-hidden="true" {...p}>
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.01-1.04 2.47c0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35z" />
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.36c0-4.53 3.7-8.22 8.23-8.22 2.2 0 4.26.86 5.81 2.41a8.16 8.16 0 0 1 2.41 5.82c0 4.54-3.7 8.21-8.23 8.21z" />
  </svg>
);

export const IkonOmurga = (p: P) => (
  <Cizgi {...p}>
    <path d="M12 2c-2.2 2.2-2.2 4.4 0 6.6s2.2 4.4 0 6.6-2.2 4.4 0 6.8" />
    <path d="M9.4 4.6h5.2M8.6 8.6h5.6M9.4 12.6h5.2M8.6 16.6h5.6" />
  </Cizgi>
);
