"use client";

import useAppStore from "@/state/useAppStore";
import { UsernameSection } from "./entries-table";

export function HashtagsView() {
  const appState = useAppStore((state) => state.appState);
  const locale = useAppStore((state) => state.locale);

  if (!appState) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {locale === "es"
          ? "Sube un ZIP para ver los hashtags que sigues."
          : "Upload an export to review the hashtags you follow."}
      </p>
    );
  }

  const texts = locale === "es" ? ES_TEXT : EN_TEXT;

  return (
    <div className="space-y-8">
      <UsernameSection
        title={texts.title}
        description={texts.description}
        entries={appState.hashtags}
        emptyMessage={texts.empty}
        filename="hashtags.csv"
        locale={locale}
        prefix="#"
        columnLabel={{ es: "Hashtag", en: "Hashtag" }}
        showTimestamp
      />
    </div>
  );
}

const ES_TEXT = {
  title: "Hashtags que sigues",
  description:
    "Ayuda a encontrar contenidos y comunidades relevantes. Evalúa si aún aportan valor a tu feed.",
  empty: "No encontramos hashtags en el dataset.",
} as const;

const EN_TEXT = {
  title: "Followed hashtags",
  description:
    "Track the tags you follow to keep your feed curated and relevant.",
  empty: "No hashtags detected in this dataset.",
} as const;
