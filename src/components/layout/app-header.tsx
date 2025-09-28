"use client";

import Link from "next/link";
import useAppStore from "@/state/useAppStore";
import { ThemeToggle } from "./theme-toggle";
import { LocaleToggle } from "./locale-toggle";
import { PrivacyBanner } from "./privacy-banner";
import { ExternalLink } from "lucide-react";

const MESSAGES = {
  es: {
    title: "Instagram Follower Insights",
    subtitle: "Analiza, compara y limpia tus seguidores sin perder privacidad.",
  github: "Ver roadmap",
  },
  en: {
    title: "Instagram Follower Insights",
    subtitle: "Analyze, compare and clean your followers without sacrificing privacy.",
    github: "View roadmap",
  },
};

export function AppHeader() {
  const locale = useAppStore((state) => state.locale);
  const t = MESSAGES[locale];

  return (
    <header className="border-b border-border/60 bg-white/70 backdrop-blur-md dark:bg-slate-900/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {t.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <LocaleToggle />
            <ThemeToggle />
            <Link
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white/90 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900 sm:flex"
            >
              <ExternalLink className="h-4 w-4" />
              {t.github}
            </Link>
          </div>
        </div>
        <PrivacyBanner />
      </div>
    </header>
  );
}
