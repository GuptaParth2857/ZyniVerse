"use client";

import { useEffect, useState } from "react";

export default function SubscriptionBadge() {
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subscription/status")
      .then((res) => res.json())
      .then((data) => setPlan(data.plan))
      .catch(() => setPlan("free"));
  }, []);

  if (!plan || plan === "free") return null;

  if (plan === "pro") {
    return (
      <span className="inline-flex items-center rounded-full bg-purple-600/20 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
        PRO
      </span>
    );
  }

  if (plan === "enterprise") {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-600/20 border border-yellow-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-300">
        ENTERPRISE
      </span>
    );
  }

  return null;
}
