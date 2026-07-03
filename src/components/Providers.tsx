"use client";

import { WatchlistProvider } from "./WatchlistProvider";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WatchlistProvider>{children}</WatchlistProvider>
    </ThemeProvider>
  );
}
