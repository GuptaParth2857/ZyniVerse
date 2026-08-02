"use client";

import { useEffect, useRef } from "react";
import { getSocket, type DmMessage } from "@/lib/socket";

export function useDmSocket(userId: string | undefined, onMessage: (msg: DmMessage) => void) {
  const cbRef = useRef(onMessage);

  useEffect(() => {
    cbRef.current = onMessage;
  });

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    const onConnect = () => {
      socket.emit("dm-join", { userId });
    };
    const onDm = (msg: DmMessage) => cbRef.current(msg);

    socket.on("connect", onConnect);
    socket.on("dm-message", onDm);
    if (socket.connected) onConnect();
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("dm-message", onDm);
    };
  }, [userId]);
}
