export type ThemePreference = "system" | "light" | "dark";
export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "instagram-follower-insights.theme";

export const resolveThemePreference = (
  preference: ThemePreference,
  systemPrefersDark: boolean
): ThemeMode => {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }
  return preference;
};

export const getThemeInitializerScript = (): string => `(() => {
  try {
    const storageKey = "${THEME_STORAGE_KEY}";
    const root = document.documentElement;
    if (!root) return;
    const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const stored = window.localStorage?.getItem(storageKey);
    const fallback = media?.matches ? "dark" : "light";
    const mode = stored === "light" || stored === "dark" ? stored : fallback;
    root.classList.toggle("dark", mode === "dark");
    root.classList.toggle("light", mode === "light");
    root.style.colorScheme = mode;
    root.dataset.theme = mode;
    root.dataset.colorScheme = mode;
  } catch (error) {
    // ignore initialization errors
  }
})();`;
