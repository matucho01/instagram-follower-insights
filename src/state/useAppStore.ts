"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { ThemePreference } from "@/lib/theme";

import {
  AppState,
  AppStateLite,
  AppView,
  Delta,
  FollowMetrics,
  ParserWarning,
  PersistedAnalysis,
  ParseWorkerResult,
  SerializedAppState,
} from "@/lib/types";
import {
  parseWithWorker,
  terminateParserWorker,
} from "@/lib/workers/parserClient";
import {
  clearEncryptedState,
  decryptState,
  encryptState,
  loadEncryptedState,
  saveEncryptedState,
} from "@/lib/storage";
import { createAppStateLite, compareSnapshots } from "@/lib/compare";

export type ParseStatus = "idle" | "loading" | "success" | "error";

interface ComparisonState {
  baseline?: AppStateLite;
  delta?: Delta;
}

interface AppStoreState {
  appState: AppState | null;
  metrics: FollowMetrics | null;
  warnings: ParserWarning[];
  parseStatus: ParseStatus;
  parseError?: string;
  locale: "es" | "en";
  theme: ThemePreference;
  comparison: ComparisonState;
  isSaving: boolean;
  isRestoring: boolean;
  activeView: AppView;
  parseFiles: (files: File[]) => Promise<void>;
  reset: () => void;
  setLocale: (locale: "es" | "en") => void;
  toggleLocale: () => void;
  setTheme: (theme: ThemePreference) => void;
  setBaseline: () => void;
  clearBaseline: () => void;
  saveEncrypted: (passphrase: string, key?: string) => Promise<void>;
  loadEncrypted: (passphrase: string, key?: string) => Promise<void>;
  clearEncrypted: (key?: string) => Promise<void>;
  terminateWorker: () => void;
  setActiveView: (view: AppView) => void;
}

const serializeState = (state: AppState): SerializedAppState => ({
  ...state,
  followers: Array.from(state.followers),
  following: Array.from(state.following),
});

const deserializeState = (state: SerializedAppState): AppState => ({
  ...state,
  followers: new Set(state.followers),
  following: new Set(state.following),
});

const handleParsedResult = (
  result: ParseWorkerResult,
  baseline?: AppStateLite
): { state: AppState; metrics: FollowMetrics; warnings: ParserWarning[] } => {
  const { state, metrics, warnings } = result;

  if (baseline) {
    const targetLite = createAppStateLite(state);
    const delta = compareSnapshots(baseline, targetLite);
    state.compare = {
      baseline,
      delta,
    };
  }

  return { state, metrics, warnings };
};

const createInitialState = (): Omit<
  AppStoreState,
  | "parseFiles"
  | "reset"
  | "setLocale"
  | "toggleLocale"
  | "setTheme"
  | "setBaseline"
  | "clearBaseline"
  | "saveEncrypted"
  | "loadEncrypted"
  | "clearEncrypted"
  | "terminateWorker"
  | "isSaving"
  | "isRestoring"
  | "setActiveView"
> & { isSaving: boolean; isRestoring: boolean } => ({
  appState: null,
  metrics: null,
  warnings: [],
  parseStatus: "idle",
  parseError: undefined,
  locale: "es",
  theme: "system",
  comparison: {},
  isSaving: false,
  isRestoring: false,
  activeView: "landing",
});

const useAppStore = create<AppStoreState>()(
  devtools(
    immer((set, get) => ({
      ...createInitialState(),
      parseFiles: async (files: File[]) => {
        if (typeof window === "undefined") {
          throw new Error("La carga de archivos solo está disponible en el cliente.");
        }
        if (!files.length) return;

        set((state) => {
          state.parseStatus = "loading";
          state.parseError = undefined;
          state.warnings = [];
        });

        try {
          const result = await parseWithWorker(files);
          const { comparison } = get();
          const handled = handleParsedResult(result, comparison.baseline);

          set((state) => {
            state.appState = handled.state;
            state.metrics = handled.metrics;
            state.warnings = handled.warnings;
            state.parseStatus = "success";
            state.parseError = undefined;
            if (handled.state.compare) {
              state.comparison.delta = handled.state.compare.delta;
            }
            state.activeView = "summary";
          });
        } catch (error) {
          set((state) => {
            state.parseStatus = "error";
            state.parseError = (error as Error).message;
          });
        }
      },
      reset: () => {
        set((state) => {
          state.appState = null;
          state.metrics = null;
          state.warnings = [];
          state.parseStatus = "idle";
          state.parseError = undefined;
          state.comparison = {};
          state.activeView = "landing";
        });
      },
      setLocale: (locale) => {
        set((state) => {
          state.locale = locale;
        });
      },
      toggleLocale: () => {
        set((state) => {
          state.locale = state.locale === "es" ? "en" : "es";
        });
      },
      setTheme: (theme) => {
        set((state) => {
          state.theme = theme;
        });
      },
      setBaseline: () => {
        const { appState } = get();
        if (!appState) return;
        const baseline = createAppStateLite(appState);
        set((state) => {
          state.comparison.baseline = baseline;
          state.comparison.delta = undefined;
        });
      },
      clearBaseline: () => {
        set((state) => {
          state.comparison = {};
          if (state.appState) {
            state.appState.compare = undefined;
          }
        });
      },
      saveEncrypted: async (passphrase: string, key = "latest") => {
        const { appState, metrics, warnings } = get();
        if (!appState || !metrics) {
          throw new Error("No hay análisis para guardar.");
        }

        set((state) => {
          state.isSaving = true;
        });

        try {
          const toPersist: PersistedAnalysis = {
            state: serializeState(appState),
            metrics,
            warnings,
          };
          const payload = await encryptState(toPersist, passphrase);
          await saveEncryptedState(payload, key);
        } finally {
          set((state) => {
            state.isSaving = false;
          });
        }
      },
      loadEncrypted: async (passphrase: string, key = "latest") => {
        if (typeof window === "undefined") {
          throw new Error("La restauración solo está disponible en el cliente.");
        }

        set((state) => {
          state.isRestoring = true;
          state.parseError = undefined;
        });

        try {
          const payload = await loadEncryptedState(key);
          if (!payload) {
            throw new Error("No se encontró un análisis guardado.");
          }
          const restored = await decryptState<PersistedAnalysis>(payload, passphrase);
          const deserialized = deserializeState(restored.state);
          set((state) => {
            state.appState = deserialized;
            state.metrics = restored.metrics;
            state.warnings = restored.warnings ?? [];
            state.parseStatus = "success";
            if (deserialized.compare) {
              state.comparison.baseline = deserialized.compare.baseline;
              state.comparison.delta = deserialized.compare.delta;
            }
            state.activeView = "summary";
          });
        } catch (error) {
          set((state) => {
            state.parseStatus = "error";
            state.parseError = (error as Error).message;
          });
          throw error;
        } finally {
          set((state) => {
            state.isRestoring = false;
          });
        }
      },
      clearEncrypted: async (key?: string) => {
        await clearEncryptedState(key);
      },
      terminateWorker: () => {
        terminateParserWorker();
      },
      setActiveView: (view) => {
        set((state) => {
          state.activeView = view;
        });
      },
    }))
  )
);

export default useAppStore;