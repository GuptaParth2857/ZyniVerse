"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function HeartbeatProvider() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const ping = () => {
      fetch("/api/heartbeat", { method: "POST" }).catch(() => {});
    };

    ping();
    const id = setInterval(ping, 30000);
    return () => clearInterval(id);
  }, [session?.user]);

  return null;
}
