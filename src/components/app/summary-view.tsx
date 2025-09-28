"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Download, Info, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import useAppStore from "@/state/useAppStore";
import type { FollowMetrics, UsernameEntry } from "@/lib/types";
import { buildSummaryPdf } from "@/lib/exporters/pdf";

const numberFormatter = (locale: "es" | "en") =>
  new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US");

const percentFormatter = (locale: "es" | "en") =>
  new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  });

const formatPreview = (entries: UsernameEntry[], limit = 10) => {
  if (!entries.length) return "—";
  const slice = entries.slice(0, limit).map((entry) => `@${entry.username}`);
  const remaining = entries.length - slice.length;
  return remaining > 0 ? `${slice.join(", ")} +${remaining}` : slice.join(", ");
};

const snapshotLabel = (locale: "es" | "en", value?: string) => {
  if (!value) return locale === "es" ? "Sin fecha" : "No snapshot date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const formatter = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
  return formatter.format(date);
};

const METRIC_LABELS: Record<keyof FollowMetrics, { es: string; en: string; highlight?: boolean }> = {
  followingCount: { es: "Siguiendo", en: "Following" },
  followersCount: { es: "Seguidores", en: "Followers" },
  mutualCount: { es: "Mutuos", en: "Mutuals", highlight: true },
  notFollowingBackCount: { es: "No te siguen", en: "Not following back" },
  fansYouDontFollowCount: { es: "Fans", en: "Fans" },
  reciprocityRate: { es: "Reciprocidad", en: "Reciprocity" },
  followBackRate: { es: "Follow-back", en: "Follow-back" },
};

export function SummaryView() {
  const locale = useAppStore((state) => state.locale);
  const metrics = useAppStore((state) => state.metrics);
  const appState = useAppStore((state) => state.appState);
  const warnings = useAppStore((state) => state.warnings);
  const fmtNumber = useMemo(() => numberFormatter(locale), [locale]);
  const fmtPercent = useMemo(() => percentFormatter(locale), [locale]);
  const [isExporting, setIsExporting] = useState(false);

  if (!metrics || !appState) {
    return (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p>{locale === "es" ? "Carga tu exportación para ver el resumen." : "Upload your export to see the summary."}</p>
      </div>
    );
  }

  const cards = (Object.keys(METRIC_LABELS) as Array<keyof FollowMetrics>).map((key) => {
    const value = metrics[key];
    const label = METRIC_LABELS[key][locale];
    const display =
      typeof value === "number" && key.includes("Rate")
        ? fmtPercent.format(value)
        : fmtNumber.format(value);
    return {
      key,
      label,
      value: display,
      highlight: METRIC_LABELS[key].highlight,
    };
  });

  const handleDownloadPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const title = appState.account.username
        ? `Instagram Insights — @${appState.account.username}`
        : locale === "es"
        ? "Resumen de Instagram"
        : "Instagram Summary";
      const pdf = await buildSummaryPdf({
        title,
        summary: metrics,
        mutualsPreview: appState.mutuals,
        notFollowingBackPreview: appState.notFollowingBack,
        fansPreview: appState.fansYouDontFollow,
        locale: locale === "es" ? "es-ES" : "en-US",
      });
  const arrayBuffer = new ArrayBuffer(pdf.byteLength);
  new Uint8Array(arrayBuffer).set(pdf);
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const filename = appState.account.username
        ? `instagram-summary-${appState.account.username}.pdf`
        : "instagram-summary.pdf";
      anchor.download = filename;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {locale === "es" ? "Resumen general" : "Overview"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {locale === "es"
                ? "Entiende tu comunidad de un vistazo y comparte resultados con un PDF listo para clientes."
                : "Understand your community at a glance and share results with a client-ready PDF."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition",
              isExporting
                ? "cursor-wait bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                : "bg-emerald-500 text-white shadow hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 dark:shadow-emerald-500/30"
            )}
          >
            <Download className="h-4 w-4" />
            {isExporting
              ? locale === "es"
                ? "Generando…"
                : "Generating…"
              : locale === "es"
              ? "Descargar PDF"
              : "Download PDF"}
          </button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.key}
              className={clsx(
                "rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/60",
                card.highlight
                  ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                  : null
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                {card.value}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span className="font-semibold">
              {locale === "es" ? "Instantánea actual" : "Current snapshot"}
            </span>
          </div>
          <dl className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <dt className="font-medium text-slate-700 dark:text-slate-200">
                {locale === "es" ? "Cuenta" : "Account"}
              </dt>
              <dd className="text-right font-semibold text-slate-900 dark:text-slate-100">
                {appState.account.username ? `@${appState.account.username}` : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="font-medium text-slate-700 dark:text-slate-200">
                {locale === "es" ? "Fecha del snapshot" : "Snapshot date"}
              </dt>
              <dd className="text-right text-slate-600 dark:text-slate-300">
                {snapshotLabel(locale, appState.account.snapshotDate)}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="font-medium text-slate-700 dark:text-slate-200">
                {locale === "es" ? "Advertencias" : "Warnings"}
              </dt>
              <dd className="text-right text-slate-600 dark:text-slate-300">
                {warnings.length
                  ? `${warnings.length} ${locale === "es" ? "archivos con avisos" : "files with notices"}`
                  : locale === "es"
                  ? "Sin advertencias"
                  : "No warnings"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-300">
            <Info className="h-5 w-5 text-emerald-500" />
            {locale === "es" ? "Highlights" : "Highlights"}
          </div>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {locale === "es" ? "No te siguen" : "Not following back"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatPreview(appState.notFollowingBack)}
              </p>
            </li>
            <li>
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {locale === "es" ? "Fans" : "Fans"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatPreview(appState.fansYouDontFollow)}
              </p>
            </li>
            <li>
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {locale === "es" ? "Mutuos" : "Mutuals"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatPreview(appState.mutuals)}
              </p>
            </li>
          </ul>
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 opacity-60">
            <ArrowRight className="h-4 w-4" />
            {locale === "es"
              ? "Explora las pestañas para ver listas completas"
              : "Use the tabs to explore full lists"}
          </p>
        </div>
      </section>
    </div>
  );
}
