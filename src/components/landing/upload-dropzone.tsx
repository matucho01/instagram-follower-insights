"use client";

import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Archive,
  CheckCircle2,
  CloudUpload,
  FileJson,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import useAppStore from "@/state/useAppStore";

const ACCEPTED_TYPES = {
  "application/zip": [".zip"],
  "application/json": [".json"],
};

export function UploadDropzone() {
  const parseFiles = useAppStore((state) => state.parseFiles);
  const status = useAppStore((state) => state.parseStatus);
  const parseError = useAppStore((state) => state.parseError);
  const warnings = useAppStore((state) => state.warnings);
  const locale = useAppStore((state) => state.locale);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      await parseFiles(acceptedFiles);
    },
    [parseFiles]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_TYPES,
    onDrop,
    multiple: true,
    noClick: false,
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) return;
      if (event.key.toLowerCase() !== "u") return;
      event.preventDefault();
      open();
    };

    const externalTrigger = () => open();

    window.addEventListener("keydown", handler);
    window.addEventListener("ig-insights:open-upload", externalTrigger);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("ig-insights:open-upload", externalTrigger);
    };
  }, [open]);

  const t = locale === "es" ? TEXTS.es : TEXTS.en;

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className="group relative flex cursor-pointer flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-slate-300 bg-white/70 p-10 text-center transition hover:border-emerald-400 hover:bg-white/90 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-emerald-400"
      >
        <input {...getInputProps()} aria-label={t.inputLabel} />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
          {status === "loading" ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <CloudUpload className="h-8 w-8" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {isDragActive ? t.dropHere : t.title}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Archive className="h-4 w-4" /> ZIP
          </span>
          <span className="flex items-center gap-1">
            <FileJson className="h-4 w-4" /> JSON
          </span>
        </div>
      </div>

      {status === "error" && parseError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200">
          <TriangleAlert className="mt-0.5 h-5 w-5" />
          <div>
            <p className="font-medium">{t.error}</p>
            <p>{parseError}</p>
          </div>
        </div>
      )}

      {status === "success" && !parseError && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5" />
          <span>{t.success}</span>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-center gap-2 font-semibold">
            <TriangleAlert className="h-4 w-4" /> {t.warningsTitle}
          </div>
          <ul className="grid gap-2 text-left text-xs">
            {warnings.slice(0, 4).map((warning, index) => (
              <li key={`${warning.file}-${index}`} className="leading-relaxed">
                <span className="font-medium">{warning.file}:</span> {warning.message}
              </li>
            ))}
            {warnings.length > 4 && (
              <li className="italic opacity-80">+ {warnings.length - 4} {t.moreWarnings}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const TEXTS = {
  es: {
    inputLabel: "Seleccionar archivos de exportación",
    title: "Arrastra tu ZIP o JSON de Instagram",
    subtitle: "Usa los archivos oficiales descargados desde el Accounts Center.",
    dropHere: "Suelta los archivos aquí",
    error: "No pudimos procesar los archivos:",
    success: "¡Análisis listo! Revisa las pestañas para explorar tus datos.",
    warningsTitle: "Avisos durante el análisis",
    moreWarnings: "avisos adicionales",
  },
  en: {
    inputLabel: "Select export files",
    title: "Drop your Instagram ZIP or JSON",
    subtitle: "Use the official files downloaded from the Accounts Center.",
    dropHere: "Drop files here",
    error: "We couldn't process the files:",
    success: "Analysis completed! Use the tabs to explore your data.",
    warningsTitle: "Warnings during parsing",
    moreWarnings: "more warnings",
  },
};
