"use client";

import useAppStore from "@/state/useAppStore";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const MESSAGES = {
  es: {
    title: "Privacidad primero",
    body: "Tus archivos nunca se suben. Todo se procesa localmente en tu navegador.",
    help: "Cómo descargar tu información",
  },
  en: {
    title: "Privacy first",
    body: "Your files never leave the browser. Everything runs locally on your device.",
    help: "How to download your data",
  },
};

export function PrivacyBanner() {
  const locale = useAppStore((state) => state.locale);
  const t = MESSAGES[locale];

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200/60 bg-white/80 p-4 shadow-sm dark:border-emerald-500/40 dark:bg-slate-900/70">
      <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-300">
        <ShieldCheck className="h-5 w-5" />
        <p className="text-sm font-semibold uppercase tracking-wide">
          {t.title}
        </p>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{t.body}</p>
      <Link
        href="https://help.instagram.com/181231772500920"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-300"
      >
        {t.help}
      </Link>
    </div>
  );
}
