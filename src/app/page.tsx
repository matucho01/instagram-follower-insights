"use client";

import { useEffect, useMemo } from "react";
import type { FC } from "react";
import type { AppView } from "@/lib/types";
import useAppStore from "@/state/useAppStore";
import { AppHeader } from "@/components/layout/app-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { AppShell } from "@/components/layout/app-shell";
import { SummaryView } from "@/components/app/summary-view";
import { ListsView } from "@/components/app/lists-view";
import { RequestsView } from "@/components/app/requests-view";
import { PrivacyView } from "@/components/app/privacy-view";
import { HashtagsView } from "@/components/app/hashtags-view";
import { CompareView } from "@/components/app/compare-view";

const VIEW_COMPONENTS: Record<Exclude<AppView, "landing">, FC> = {
  summary: SummaryView,
  lists: ListsView,
  requests: RequestsView,
  privacy: PrivacyView,
  hashtags: HashtagsView,
  compare: CompareView,
};

export default function HomePage() {
  const hasData = useAppStore((state) => Boolean(state.appState));
  const activeView = useAppStore((state) => state.activeView);
  const setActiveView = useAppStore((state) => state.setActiveView);

  useEffect(() => {
    const VIEW_MAP: Record<string, AppView> = {
      "1": "summary",
      "2": "lists",
      "3": "requests",
      "4": "privacy",
      "5": "hashtags",
      "6": "compare",
    } as const;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) return;
      const key = event.key.toLowerCase();
      if (key in VIEW_MAP && hasData) {
        event.preventDefault();
        setActiveView(VIEW_MAP[key]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasData, setActiveView]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    const action = params.get("action");

    const viewLookup: Partial<Record<string, AppView>> = {
      summary: "summary",
      lists: "lists",
      requests: "requests",
      privacy: "privacy",
      hashtags: "hashtags",
      compare: "compare",
    };

    if (hasData && viewParam && viewLookup[viewParam]) {
      setActiveView(viewLookup[viewParam]!);
    }

    if (action === "upload") {
      window.dispatchEvent(new Event("ig-insights:open-upload"));
    }
  }, [hasData, setActiveView]);

  const content = useMemo(() => {
    if (!hasData || activeView === "landing") {
      return <LandingHero />;
    }
    const View = VIEW_COMPONENTS[activeView as Exclude<AppView, "landing">];
    return (
      <AppShell>
        <View />
      </AppShell>
    );
  }, [hasData, activeView]);

  return (
    <>
      <AppHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
      >
        {content}
      </main>
    </>
  );
}
