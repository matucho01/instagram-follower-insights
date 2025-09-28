"use client";

import type { ReactNode } from "react";
import { TabNavigation } from "./tab-navigation";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full justify-center px-4 pb-24 pt-10 sm:px-6 lg:px-10">
      <div className="flex w-full max-w-6xl flex-col gap-8">
        <TabNavigation />
        <section className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-lg shadow-emerald-100/30 transition dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-emerald-500/10">
          {children}
        </section>
      </div>
    </div>
  );
}
