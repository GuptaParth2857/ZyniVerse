"use client";

export type ThemeId = "dark" | "dim" | "light";

export interface ThemeDef {
  id: ThemeId;
  label: string;
  icon: string;
  vars: Record<string, string>;
}

export const THEMES: ThemeDef[] = [
  {
    id: "dark",
    label: "Dark",
    icon: "🌙",
    vars: {
      "--color-void": "#0a0a0f",
      "--color-panel": "#12111e",
      "--color-line": "#1f1d33",
      "--color-ink": "#f0eef8",
      "--color-mute": "#807ba3",
      "--glass-border": "rgba(255,255,255,0.10)",
      "--glass-bg": "rgba(255,255,255,0.06)",
      "--glass-glow": "rgba(139,92,246,0.15)",
    },
  },
  {
    id: "dim",
    label: "Dim",
    icon: "🌓",
    vars: {
      "--color-void": "#13131e",
      "--color-panel": "#1a1a2e",
      "--color-line": "#2a2a44",
      "--color-ink": "#e8e6f0",
      "--color-mute": "#9490b3",
      "--glass-border": "rgba(255,255,255,0.12)",
      "--glass-bg": "rgba(255,255,255,0.08)",
      "--glass-glow": "rgba(139,92,246,0.20)",
    },
  },
  {
    id: "light",
    label: "Light",
    icon: "☀️",
    vars: {
      "--color-void": "#f5f3f7",
      "--color-panel": "#ffffff",
      "--color-line": "#e0dce8",
      "--color-ink": "#1a1826",
      "--color-mute": "#6b6680",
      "--glass-border": "rgba(0,0,0,0.10)",
      "--glass-bg": "rgba(255,255,255,0.7)",
      "--glass-glow": "rgba(139,92,246,0.10)",
    },
  },
];
