"use client";

import { useEffect } from "react";
import { Languages } from "lucide-react";
import useAppStore from "@/state/useAppStore";

export function LocaleToggle() {
  const locale = useAppStore((state) => state.locale);
  const toggleLocale = useAppStore((state) => state.toggleLocale);

  const label = locale === "es" ? "Cambiar a inglés" : "Switch to Spanish";

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={label}
      className="flex h-10 items-center gap-2 rounded-full border border-border bg-white/70 px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white/90 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
    >
      <Languages className="h-4 w-4" />
      <span>{locale.toUpperCase()}</span>
    </button>
  );
}
