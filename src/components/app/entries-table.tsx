"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Download, Search } from "lucide-react";
import { downloadCsv } from "@/lib/exporters/csv";
import type { UsernameEntry } from "@/lib/types";

const formatTimestamp = (timestamp: number | undefined, locale: string): string => {
  if (!timestamp) return "—";
  const value = timestamp > 10_000_000_000 ? timestamp : timestamp * 1000;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return date.toISOString();
  }
};

const normalize = (value: string | undefined) =>
  value ? value.normalize("NFKD").toLowerCase() : "";

interface UsernameSectionProps {
  title: string;
  description?: string;
  entries: UsernameEntry[];
  emptyMessage: string;
  locale: "es" | "en";
  filename: string;
  showTimestamp?: boolean;
  prefix?: string;
  columnLabel?: { es: string; en: string };
}

export function UsernameSection({
  title,
  description,
  entries,
  emptyMessage,
  locale,
  filename,
  showTimestamp = true,
  prefix = "@",
  columnLabel = { es: "Usuario", en: "Username" },
}: UsernameSectionProps) {
  const [query, setQuery] = useState("");
  const intlLocale = locale === "es" ? "es-ES" : "en-US";
  const formattedTotal = useMemo(
    () => new Intl.NumberFormat(intlLocale).format(entries.length),
    [entries.length, intlLocale]
  );

  const filtered = useMemo(() => {
    if (!query) return entries;
    const q = normalize(query);
    return entries.filter((entry) => {
      const username = normalize(entry.username);
      const display = normalize(entry.displayName);
      return username.includes(q) || display.includes(q);
    });
  }, [entries, query]);

  const handleExport = () => {
    if (!filtered.length) return;
    const safeName = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    downloadCsv(filtered, { filename: safeName });
  };

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {description ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
          ) : null}
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {locale === "es" ? "Total" : "Total"}: {formattedTotal}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={locale === "es" ? "Buscar usuario…" : "Search user…"}
              className="w-full rounded-full border border-slate-200 bg-white/80 py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30"
            />
          </label>
          <button
            type="button"
            onClick={handleExport}
            disabled={!filtered.length}
            className={clsx(
              "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
              filtered.length
                ? "bg-emerald-500 text-white shadow hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 dark:shadow-emerald-500/30"
                : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
            )}
          >
            <Download className="h-4 w-4" />
            {locale === "es" ? "Exportar CSV" : "Export CSV"}
          </button>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-inner dark:border-slate-800 dark:bg-slate-900/50">
        {filtered.length === 0 ? (
          <p className="px-6 py-10 text-sm text-slate-500 dark:text-slate-300">{emptyMessage}</p>
        ) : (
          <div className="max-h-96 overflow-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                    {columnLabel[locale]}
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                    {locale === "es" ? "Nombre" : "Name"}
                  </th>
                  {showTimestamp ? (
                    <th scope="col" className="px-4 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                      {locale === "es" ? "Registro" : "Timestamp"}
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((entry, index) => {
                  const key = `${entry.href ?? entry.username}-${index}`;
                  const timestamp = showTimestamp
                    ? formatTimestamp(entry.timestamp, intlLocale)
                    : undefined;
                  return (
                    <tr key={key} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-500/5">
                      <td className="px-4 py-2">
                        {entry.href ? (
                          <a
                            href={entry.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate font-medium text-emerald-600 hover:underline dark:text-emerald-300"
                          >
                            {`${prefix}${entry.username}`}
                          </a>
                        ) : (
                          <span className="font-medium text-slate-800 dark:text-slate-100">
                            {`${prefix}${entry.username}`}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                        {entry.displayName ?? "—"}
                      </td>
                      {showTimestamp ? (
                        <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                          {timestamp}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
