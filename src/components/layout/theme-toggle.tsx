"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import useAppStore, { type ThemePreference } from "@/state/useAppStore";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const setThemePreference = useAppStore((state) => state.setTheme);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const resolved = theme === "system" ? resolvedTheme : theme;
    const normalized: ThemePreference =
      resolved === "dark" || resolved === "light"
        ? resolved
        : theme === "system" || !theme
        ? "system"
        : theme === "dark" || theme === "light"
        ? theme
        : "system";

    setThemePreference(normalized);

    const root = document.documentElement;
    const apply = (target: "light" | "dark") => {
      root.classList.remove(target === "dark" ? "light" : "dark");
      root.classList.add(target);
      root.style.colorScheme = target;
    };

    if (normalized === "system") {
      if (resolved === "dark" || resolved === "light") {
        apply(resolved);
      } else {
        root.classList.remove("light", "dark");
        root.style.removeProperty("color-scheme");
      }
    } else {
      apply(normalized);
    }
  }, [mounted, theme, resolvedTheme, setThemePreference]);

  if (!mounted) {
    return null;
  }

  const current = theme === "system" ? resolvedTheme ?? "system" : theme;
  const isDark = current === "dark";

  const toggle = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
    setThemePreference(nextTheme);
  };

  return (
    <button
      type="button"
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      onClick={toggle}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/70 text-slate-700 shadow-sm transition hover:bg-white/90 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
