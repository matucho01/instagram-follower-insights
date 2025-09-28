"use client";

import clsx from "clsx";
import useAppStore from "@/state/useAppStore";
import type { AppView } from "@/lib/types";

const NAV_ITEMS: Array<{ view: Exclude<AppView, "landing">; label: { es: string; en: string } }> = [
  { view: "summary", label: { es: "Resumen", en: "Summary" } },
  { view: "lists", label: { es: "Listas", en: "Lists" } },
  { view: "requests", label: { es: "Solicitudes", en: "Requests" } },
  { view: "privacy", label: { es: "Privacidad", en: "Privacy" } },
  { view: "hashtags", label: { es: "Hashtags", en: "Hashtags" } },
  { view: "compare", label: { es: "Comparar", en: "Compare" } },
];

export function TabNavigation() {
  const locale = useAppStore((state) => state.locale);
  const active = useAppStore((state) => state.activeView);
  const setActive = useAppStore((state) => state.setActiveView);
  const hasData = useAppStore((state) => Boolean(state.appState));

  if (!hasData) return null;

  return (
    <nav aria-label="Secciones del analizador">
      <ul className="flex flex-wrap gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.view;
          const label = item.label[locale];
          return (
            <li key={item.view}>
              <button
                type="button"
                onClick={() => setActive(item.view)}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "border-emerald-500 bg-emerald-500/90 text-white shadow"
                    : "border-border bg-white/70 text-slate-600 hover:bg-white/90 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
