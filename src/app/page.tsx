"use client";

import { useMemo } from "react";
import type { AppView } from "@/lib/types";
import useAppStore from "@/state/useAppStore";
import { AppHeader } from "@/components/layout/app-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { AppShell } from "@/components/layout/app-shell";

const VIEW_TEXT = {
  summary: {
    es: {
      title: "Resumen general",
      description:
        "Próximamente verás tarjetas con KPIs y gráficos clave de tu comunidad.",
    },
    en: {
      title: "Overview",
      description: "Soon you'll get KPI cards and key community charts here.",
    },
  },
  lists: {
    es: {
      title: "Listas inteligentes",
      description:
        "En la siguiente iteración, podrás navegar listas virtualizadas y exportar CSV por categoría.",
    },
    en: {
      title: "Smart lists",
      description:
        "Next up: virtualized lists with search, filters and one-click CSV exports.",
    },
  },
  requests: {
    es: {
      title: "Bandeja de solicitudes",
      description:
        "Aquí revisarás solicitudes enviadas/recibidas con filtros por antigüedad para limpiar tu backlog.",
    },
    en: {
      title: "Requests inbox",
      description:
        "This section will surface sent/received requests with age filters to clean your backlog.",
    },
  },
  privacy: {
    es: {
      title: "Higiene de privacidad",
      description:
        "Muy pronto tendrás la lista de perfiles restringidos, ocultos y bloqueados para auditorías rápidas.",
    },
    en: {
      title: "Privacy hygiene",
      description:
        "Soon you'll audit restricted, hidden and blocked users in one glance.",
    },
  },
  hashtags: {
    es: {
      title: "Hashtags seguidos",
      description:
        "Próxima tarea: detectar hashtags redundantes y sugerir limpiezas para optimizar tu feed.",
    },
    en: {
      title: "Followed hashtags",
      description:
        "Coming up: detect redundant hashtags and suggest cleanups to optimize your feed.",
    },
  },
  compare: {
    es: {
      title: "Comparador de exportaciones",
      description:
        "Próximamente podrás cargar dos snapshots para ver nuevos seguidores, churn y variación de reciprocidad.",
    },
    en: {
      title: "Snapshot comparison",
      description:
        "Soon you'll compare snapshots to see new followers, churn and reciprocity shifts.",
    },
  },
} satisfies Record<
  Exclude<AppView, "landing">,
  Record<"es" | "en", { title: string; description: string }>
>;

function ViewPlaceholder({ view }: { view: Exclude<AppView, "landing"> }) {
  const locale = useAppStore((state) => state.locale);
  const copy = VIEW_TEXT[view][locale];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {copy.title}
      </h2>
      <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
        {copy.description}
      </p>
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
        <p>
          {locale === "es"
            ? "Estamos preparando la experiencia completa en esta sección. Los componentes interactivos llegarán en el siguiente paso."
            : "We're wiring the full experience for this section next. Interactive components are on the way."}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const hasData = useAppStore((state) => Boolean(state.appState));
  const activeView = useAppStore((state) => state.activeView);

  const content = useMemo(() => {
    if (!hasData || activeView === "landing") {
      return <LandingHero />;
    }
    return (
      <AppShell>
        <ViewPlaceholder view={activeView as Exclude<AppView, "landing">} />
      </AppShell>
    );
  }, [hasData, activeView]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      {content}
    </div>
  );
}
