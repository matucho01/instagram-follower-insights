"use client";

import { useMemo } from "react";
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
    <div className="flex flex-1 flex-col">
      <AppHeader />
      {content}
    </div>
  );
}
