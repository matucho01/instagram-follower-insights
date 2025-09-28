"use client";

import useAppStore from "@/state/useAppStore";
import { UsernameSection } from "./entries-table";

export function ListsView() {
  const appState = useAppStore((state) => state.appState);
  const locale = useAppStore((state) => state.locale);

  if (!appState) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {locale === "es"
          ? "Carga una exportación para explorar tus listas."
          : "Upload an export to explore your lists."}
      </p>
    );
  }

  const texts = locale === "es" ? ES_TEXT : EN_TEXT;

  return (
    <div className="space-y-10">
      <UsernameSection
        title={texts.notFollowingBack.title}
        description={texts.notFollowingBack.description}
        entries={appState.notFollowingBack}
        emptyMessage={texts.notFollowingBack.empty}
        filename="not-following-back.csv"
        locale={locale}
      />
      <UsernameSection
        title={texts.fans.title}
        description={texts.fans.description}
        entries={appState.fansYouDontFollow}
        emptyMessage={texts.fans.empty}
        filename="fans.csv"
        locale={locale}
      />
      <UsernameSection
        title={texts.mutuals.title}
        description={texts.mutuals.description}
        entries={appState.mutuals}
        emptyMessage={texts.mutuals.empty}
        filename="mutuals.csv"
        locale={locale}
      />
    </div>
  );
}

const ES_TEXT = {
  notFollowingBack: {
    title: "Sigues pero no te siguen",
    description: "Personas que sigues y no retornan el follow. Prioriza limpiezas o campañas reactivas.",
    empty: "No encontramos usuarios en esta categoría.",
  },
  fans: {
    title: "Te siguen y no los sigues",
    description: "Fans potenciales que puedes convertir en relaciones más cercanas.",
    empty: "Aún no tienes fans que no sigas de vuelta.",
  },
  mutuals: {
    title: "Mutuos",
    description: "Relaciones recíprocas que equilibran tu cuenta.",
    empty: "No detectamos relaciones mutuas.",
  },
} as const;

const EN_TEXT = {
  notFollowingBack: {
    title: "Following but not followed back",
    description: "People you follow that don't reciprocate. Great candidates for cleanups or reactivation.",
    empty: "We couldn't find users in this category.",
  },
  fans: {
    title: "Followers you don't follow",
    description: "Potential fans ready to nurture into stronger relationships.",
    empty: "There are no fans you aren't following yet.",
  },
  mutuals: {
    title: "Mutuals",
    description: "Reciprocal relationships that keep your account balanced.",
    empty: "No mutual relationships detected.",
  },
} as const;
