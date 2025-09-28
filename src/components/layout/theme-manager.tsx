"use client";

import { useEffect, useRef } from "react";
import useAppStore from "@/state/useAppStore";
import {
  resolveThemePreference,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from "@/lib/theme";

const applyMode = (mode: ThemeMode) => {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.classList.toggle("light", mode === "light");
  root.style.colorScheme = mode;
  root.dataset.theme = mode;
  root.dataset.colorScheme = mode;
};

const addMediaListener = (
  media: MediaQueryList,
  handler: (event: MediaQueryListEvent) => void
) => {
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }

  // Safari < 14 fallback
  media.addListener(handler);
  return () => media.removeListener(handler);
};

export function ThemeManager() {
  const preference = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const initialized = useRef(false);

  // Hydrate preference from localStorage once
  useEffect(() => {
    if (typeof window === "undefined" || initialized.current) return;

    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      }
    } catch {
      // ignore storage failures (private mode, etc.)
    }

    initialized.current = true;
  }, [setTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;

    const systemPrefersDark = media?.matches ?? false;
    applyMode(resolveThemePreference(preference, systemPrefersDark));

    if (!media) {
      return;
    }

    const handleChange = (event: MediaQueryListEvent) => {
      if (preference === "system") {
        applyMode(event.matches ? "dark" : "light");
      }
    };

    const removeListener = addMediaListener(media, handleChange);
    return () => {
      removeListener();
    };
  }, [preference]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (preference === "light" || preference === "dark") {
        window.localStorage.setItem(THEME_STORAGE_KEY, preference);
      } else {
        window.localStorage.removeItem(THEME_STORAGE_KEY);
      }
    } catch {
      // ignore storage failures
    }
  }, [preference]);

  return null;
}
