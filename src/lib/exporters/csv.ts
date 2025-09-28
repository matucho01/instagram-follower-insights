import Papa from "papaparse";
import { CsvExportOptions, UsernameEntry } from "../types";

const defaultHeaders = ["username", "displayName", "href", "timestamp"];

const toRecord = (entry: UsernameEntry) => ({
  username: entry.username,
  displayName: entry.displayName ?? "",
  href: entry.href ?? "",
  timestamp: entry.timestamp ? new Date(entry.timestamp * 1000).toISOString() : "",
});

export const serializeEntriesToCsv = (
  entries: UsernameEntry[],
  options: Partial<CsvExportOptions> = {}
): string => {
  const data = entries.map(toRecord);
  const headers = options.headers ?? defaultHeaders;
  return Papa.unparse({ fields: headers, data });
};

export const buildCsvBlob = (
  entries: UsernameEntry[],
  options: CsvExportOptions
): Blob => {
  const csv = serializeEntriesToCsv(entries, options);
  return new Blob([csv], { type: "text/csv;charset=utf-8;" });
};

export const downloadCsv = (
  entries: UsernameEntry[],
  options: CsvExportOptions
): void => {
  if (typeof window === "undefined") return;
  const blob = buildCsvBlob(entries, options);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = options.filename;
  anchor.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
};
