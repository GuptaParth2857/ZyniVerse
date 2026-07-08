"use client";

import { t as translate } from "@/lib/i18n";

export default function T({
  k,
  params,
}: {
  k: string;
  params?: Record<string, string>;
}) {
  return <>{translate(k, params)}</>;
}
