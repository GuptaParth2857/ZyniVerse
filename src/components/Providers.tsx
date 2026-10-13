"use client";

import { MotionConfig } from "framer-motion";
import { WatchlistProvider } from "./WatchlistProvider";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <WatchlistProvider>{children}</WatchlistProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}