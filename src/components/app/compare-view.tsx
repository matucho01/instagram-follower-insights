"use client";

import { useMemo } from "react";
import { ArrowRightLeft, Download, RefreshCw } from "lucide-react";
import clsx from "clsx";
import useAppStore from "@/state/useAppStore";
import { downloadCsv } from "@/lib/exporters/csv";
import type { Delta, UsernameEntry } from "@/lib/types";

const formatPercent = (value: number, locale: "es" | "en") =>
  new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);

const formatNumber = (value: number, locale: "es" | "en") =>
  new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US").format(value);

const LIST_CONFIG = [
  {
    key: "newFollowers" as const,
    filename: "delta-new-followers.csv",
    labels: { es: "Nuevos seguidores", en: "New followers" },
  },
  {
    key: "lostFollowers" as const,
    filename: "delta-lost-followers.csv",
    labels: { es: "Dejaron de seguirte", en: "Lost followers" },
  },
  {
    key: "newFollowing" as const,
    filename: "delta-new-following.csv",
    labels: { es: "Nuevos seguidos", en: "New following" },
  },
  {
    key: "unfollowed" as const,
    filename: "delta-unfollowed.csv",
    labels: { es: "Dejaste de seguir", en: "You unfollowed" },
  },
];

export function CompareView() {
  const locale = useAppStore((state) => state.locale);
  const setBaseline = useAppStore((state) => state.setBaseline);
  const clearBaseline = useAppStore((state) => state.clearBaseline);
  const appState = useAppStore((state) => state.appState);
  const comparison = useAppStore((state) => state.comparison);

  const baseline = comparison.baseline ?? appState?.compare?.baseline;
  const delta = comparison.delta ?? appState?.compare?.delta;

  const handleExport = (entries: UsernameEntry[], filename: string) => {
    if (!entries.length) return;
    downloadCsv(entries, { filename });
  };

  if (!appState) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {locale === "es"
          ? "Primero analiza un ZIP para crear un punto de comparación."
          : "Analyze an export first to create a comparison point."}
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {locale === "es" ? "Comparador de snapshots" : "Snapshot comparison"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {locale === "es"
                ? "Guarda un baseline y carga una nueva exportación para ver diferencias al instante."
                : "Save a baseline, upload a new export, and see the deltas instantly."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={setBaseline}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 dark:shadow-emerald-500/30"
            >
              <ArrowRightLeft className="h-4 w-4" />
              {locale === "es" ? "Guardar snapshot actual" : "Save current snapshot"}
            </button>
            <button
              type="button"
              onClick={clearBaseline}
              disabled={!baseline}
              className={clsx(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                baseline
                  ? "border border-slate-300 bg-white/80 text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                  : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-600"
              )}
            >
              <RefreshCw className="h-4 w-4" />
              {locale === "es" ? "Limpiar baseline" : "Clear baseline"}
            </button>
          </div>
        </header>

        {!baseline ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
            {locale === "es"
              ? "Aún no guardas un snapshot. Usa el botón \"Guardar snapshot actual\" después de cargar tu primera exportación."
              : "You haven't saved a baseline yet. Use the \"Save current snapshot\" button after loading your first export."}
          </div>
        ) : null}
      </section>

      {baseline && !delta ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {locale === "es"
            ? "Baseline guardado. Carga una nueva exportación para calcular diferencias."
            : "Baseline saved. Upload a new export to compute deltas."}
        </div>
      ) : null}

      {delta ? <DeltaOverview delta={delta} locale={locale} onExport={handleExport} /> : null}
    </div>
  );
}

interface DeltaOverviewProps {
  delta: Delta;
  locale: "es" | "en";
  onExport: (entries: UsernameEntry[], filename: string) => void;
}

function DeltaOverview({ delta, locale, onExport }: DeltaOverviewProps) {
  const cards = useMemo(() => {
    const base = [
      {
        label: locale === "es" ? "Mutuos" : "Mutuals",
        value: delta.mutualsDelta,
        description:
          locale === "es"
            ? "Variación neta de relaciones mutuas"
            : "Net change in mutual relationships",
      },
      {
        label: locale === "es" ? "Reciprocidad" : "Reciprocity",
        value: `${formatPercent(delta.reciprocityAfter - delta.reciprocityBefore, locale)} (${formatPercent(delta.reciprocityBefore, locale)} → ${formatPercent(delta.reciprocityAfter, locale)})`,
        description:
          locale === "es"
            ? "Cambio porcentual respecto al baseline"
            : "Percent change against the baseline",
      },
    ];
    return base;
  }, [delta, locale]);

  return (
    <section className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {typeof card.value === "number" ? formatNumber(card.value, locale) : card.value}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{card.description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {LIST_CONFIG.map((config) => {
          const entries = delta[config.key];
          return (
            <div
              key={config.key}
              className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <header className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {config.labels[locale]}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {locale === "es" ? "Elementos" : "Entries"}: {formatNumber(entries.length, locale)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onExport(entries, config.filename)}
                  disabled={!entries.length}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    entries.length
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                      : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  )}
                >
                  <Download className="h-4 w-4" />
                  CSV
                </button>
              </header>
              {entries.length ? (
                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {entries.slice(0, 10).map((entry, index) => (
                    <li key={`${entry.username}-${index}`} className="truncate">
                      @{entry.username}
                    </li>
                  ))}
                  {entries.length > 10 ? (
                    <li className="text-xs italic text-slate-500 dark:text-slate-400">
                      +{entries.length - 10} {locale === "es" ? "adicionales" : "more"}
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  {locale === "es" ? "Sin cambios detectados." : "No changes detected."}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
