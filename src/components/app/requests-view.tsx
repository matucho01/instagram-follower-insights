"use client";

import useAppStore from "@/state/useAppStore";
import { UsernameSection } from "./entries-table";

export function RequestsView() {
  const appState = useAppStore((state) => state.appState);
  const locale = useAppStore((state) => state.locale);

  if (!appState) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {locale === "es"
          ? "Necesitas analizar un ZIP para ver tus solicitudes."
          : "Upload your export to review requests."}
      </p>
    );
  }

  const texts = locale === "es" ? ES_TEXT : EN_TEXT;

  return (
    <div className="space-y-10">
      <UsernameSection
        title={texts.received.title}
        description={texts.received.description}
        entries={appState.requests.received}
        emptyMessage={texts.received.empty}
        filename="requests-received.csv"
        locale={locale}
      />
      <UsernameSection
        title={texts.sent.title}
        description={texts.sent.description}
        entries={appState.requests.sent}
        emptyMessage={texts.sent.empty}
        filename="requests-sent.csv"
        locale={locale}
      />
      <UsernameSection
        title={texts.recent.title}
        description={texts.recent.description}
        entries={appState.requests.recent}
        emptyMessage={texts.recent.empty}
        filename="requests-recent.csv"
        locale={locale}
      />
    </div>
  );
}

const ES_TEXT = {
  received: {
    title: "Solicitudes recibidas",
    description: "Personas esperando tu aprobación. Ordena por fecha para priorizar.",
    empty: "No tienes solicitudes pendientes.",
  },
  sent: {
    title: "Solicitudes enviadas",
    description: "Solicitudes que aún no aceptan. Decide si vale la pena insistir.",
    empty: "No encontramos solicitudes enviadas pendientes.",
  },
  recent: {
    title: "Solicitudes recientes",
    description: "Resumen rápido de solicitudes más nuevas para actuar a tiempo.",
    empty: "Aún no hay solicitudes nuevas registradas.",
  },
} as const;

const EN_TEXT = {
  received: {
    title: "Follow requests received",
    description: "People waiting for your approval. Sort by date to prioritize.",
    empty: "No pending requests on file.",
  },
  sent: {
    title: "Follow requests sent",
    description: "Requests you sent that remain unanswered.",
    empty: "No pending sent requests detected.",
  },
  recent: {
    title: "Recent requests",
    description: "Fresh requests to triage before they go stale.",
    empty: "No recent requests registered yet.",
  },
} as const;
