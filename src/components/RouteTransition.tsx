"use client";

import { ReactNode } from "react";

export default function RouteTransition({ children }: { children: ReactNode }) {
  return (
    <div style={{ animation: "fadeIn 0.15s ease-out" }}>
      {children}
    </div>
  );
}
