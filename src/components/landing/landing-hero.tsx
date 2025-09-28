"use client";

import { Instagram, Layers, Sparkles, Timer, ShieldCheck } from "lucide-react";
import useAppStore from "@/state/useAppStore";
import { UploadDropzone } from "./upload-dropzone";

const TEXTS = {
  es: {
    eyebrow: "MVP listo para sorprender",
    heading: "Analiza tus seguidores sin entregar tu contraseña",
    copy: "Sube la exportación oficial de Instagram, detecta quién te dejó de seguir, revisa solicitudes y prepara reportes listos para compartir.",
    bullets: [
      "Comparaciones entre exportaciones en segundos",
      "Solicitudes pendientes ordenadas por antigüedad",
      "Privacidad 100% local con cifrado opcional",
    ],
    helper: "Enlace oficial de Instagram →",
  },
  en: {
    eyebrow: "Portfolio-ready MVP",
    heading: "Analyze followers without handing over your password",
    copy: "Upload the official Instagram export, spot unfollows, triage requests and craft sharable reports — all on your device.",
    bullets: [
      "Compare snapshots in seconds",
      "Pending requests ranked by age",
      "100% local privacy with optional encryption",
    ],
    helper: "Official Instagram help →",
  },
};

export function LandingHero() {
  const locale = useAppStore((state) => state.locale);
  const t = TEXTS[locale];

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-12 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
      <div className="flex flex-1 flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100/60 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-200">
          <Sparkles className="h-4 w-4" /> {t.eyebrow}
        </span>
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t.heading}
        </h2>
        <p className="max-w-xl text-base text-slate-600 dark:text-slate-300">{t.copy}</p>
        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-emerald-500" /> {t.bullets[0]}
          </li>
          <li className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-emerald-500" /> {t.bullets[1]}
          </li>
          <li className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-500" /> {t.bullets[2]}
          </li>
        </ul>
        <a
          href="https://help.instagram.com/181231772500920"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-2 text-sm font-semibold text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-300"
        >
          <Instagram className="h-4 w-4" /> {t.helper}
        </a>
      </div>
      <div className="flex-1">
        <UploadDropzone />
      </div>
    </section>
  );
}
