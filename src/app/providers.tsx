"use client";

import type { ReactNode } from "react";

import { ThemeManager } from "@/components/layout/theme-manager";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeManager />
      {children}
    </>
  );
}
