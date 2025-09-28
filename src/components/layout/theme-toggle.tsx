"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import useAppStore from "@/state/useAppStore";
import { resolveThemePreference } from "@/lib/theme";

const getMediaQuery = () =>
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

export function ThemeToggle() {
  const preference = useAppStore((state) => state.theme);
  const setThemePreference = useAppStore((state) => state.setTheme);
  const locale = useAppStore((state) => state.locale);
  const [systemIsDark, setSystemIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const media = getMediaQuery();
    const update = (event?: MediaQueryListEvent) => {
      const matches = event?.matches ?? media?.matches ?? false;
      setSystemIsDark(matches);
    };

    update();
    setMounted(true);

    if (!media) return;

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  if (!mounted) {
    return null;
  }

  const resolved = resolveThemePreference(preference, systemIsDark);
  const isDark = resolved === "dark";

  const toggle = () => {
    setThemePreference(isDark ? "light" : "dark");
  };

  const label = locale === "es"
    ? isDark
      ? "Cambiar a tema claro"
      : "Cambiar a tema oscuro"
    : isDark
    ? "Switch to light theme"
    : "Switch to dark theme";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toggle}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/70 text-slate-700 shadow-sm transition hover:bg-white/90 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
