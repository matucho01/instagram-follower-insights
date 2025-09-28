"use client";

import useAppStore from "@/state/useAppStore";
import { UsernameSection } from "./entries-table";

export function PrivacyView() {
  const appState = useAppStore((state) => state.appState);
  const locale = useAppStore((state) => state.locale);

  if (!appState) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {locale === "es"
          ? "Analiza una exportación para revisar tu higiene de privacidad."
          : "Upload an export to review your privacy hygiene."}
      </p>
    );
  }

  const texts = locale === "es" ? ES_TEXT : EN_TEXT;

  return (
    <div className="space-y-10">
      <UsernameSection
        title={texts.blocked.title}
        description={texts.blocked.description}
        entries={appState.privacy.blocked}
        emptyMessage={texts.blocked.empty}
        filename="blocked.csv"
        locale={locale}
      />
      <UsernameSection
        title={texts.restricted.title}
        description={texts.restricted.description}
        entries={appState.privacy.restricted}
        emptyMessage={texts.restricted.empty}
        filename="restricted.csv"
        locale={locale}
      />
      <UsernameSection
        title={texts.hiddenStories.title}
        description={texts.hiddenStories.description}
        entries={appState.privacy.hideStoryFrom}
        emptyMessage={texts.hiddenStories.empty}
        filename="hidden-stories.csv"
        locale={locale}
      />
      <UsernameSection
        title={texts.recentlyUnfollowed.title}
        description={texts.recentlyUnfollowed.description}
        entries={appState.recentlyUnfollowed}
        emptyMessage={texts.recentlyUnfollowed.empty}
        filename="recently-unfollowed.csv"
        locale={locale}
      />
      <UsernameSection
        title={texts.dismissed.title}
        description={texts.dismissed.description}
        entries={appState.dismissedSuggestions}
        emptyMessage={texts.dismissed.empty}
        filename="dismissed-suggestions.csv"
        locale={locale}
      />
    </div>
  );
}

const ES_TEXT = {
  blocked: {
    title: "Bloqueados",
    description: "Cuentas que no pueden interactuar contigo.",
    empty: "No tienes perfiles bloqueados registrados.",
  },
  restricted: {
    title: "Restringidos",
    description: "Usuarios con interacción limitada, ideal para auditorías periódicas.",
    empty: "No detectamos usuarios restringidos.",
  },
  hiddenStories: {
    title: "Historias ocultas",
    description: "Quién no puede ver tus stories actualmente.",
    empty: "No ocultaste historias recientemente.",
  },
  recentlyUnfollowed: {
    title: "Unfollows recientes",
    description: "Cuentas que dejaste de seguir hace poco tiempo.",
    empty: "No encontramos registros de unfollows recientes.",
  },
  dismissed: {
    title: "Sugerencias descartadas",
    description: "Perfiles que Instagram recomendó y decidiste descartar.",
    empty: "No encontramos sugerencias descartadas en el dataset.",
  },
} as const;

const EN_TEXT = {
  blocked: {
    title: "Blocked users",
    description: "Accounts that can no longer reach you.",
    empty: "No blocked profiles were found.",
  },
  restricted: {
    title: "Restricted",
    description: "People with limited interaction — perfect for periodic audits.",
    empty: "No restricted users detected.",
  },
  hiddenStories: {
    title: "Stories hidden from",
    description: "Who can't see your stories right now.",
    empty: "Stories are visible to everyone at the moment.",
  },
  recentlyUnfollowed: {
    title: "Recently unfollowed",
    description: "Profiles you unfollowed in the latest export.",
    empty: "No recent unfollows found.",
  },
  dismissed: {
    title: "Dismissed suggestions",
    description: "Suggested accounts you decided to dismiss.",
    empty: "No dismissed suggestions in the dataset.",
  },
} as const;
