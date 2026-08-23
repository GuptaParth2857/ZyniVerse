"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

/**
 * Global online-presence via Supabase Realtime Presence.
 * Zero backend/DB cost — ephemeral state lives on the realtime channel.
 * Returns the set of userIds currently online.
 */
export function useOnlineUsers(userId: string | undefined): Set<string> {
  const [online, setOnline] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    const supabase = getSupabase();
    const channel = supabase.channel("presence:online", {
      config: { presence: { key: userId } },
    });

    const sync = () => {
      const state = channel.presenceState();
      const ids = new Set<string>(Object.keys(state));
      setOnline(ids);
    };

    channel
      .on("presence", { event: "sync" }, sync)
      .on("presence", { event: "join" }, sync)
      .on("presence", { event: "leave" }, sync)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void channel.track({ online_at: new Date().toISOString() });
        }
      });

    const refresh = setInterval(sync, 30000);

    return () => {
      clearInterval(refresh);
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return online;
}
