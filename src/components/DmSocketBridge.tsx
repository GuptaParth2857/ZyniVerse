"use client";

import { useDmSocket } from "@/hooks/useDmSocket";
import type { DmMessage } from "@/lib/socket";

interface DmSocketBridgeProps {
  userId: string;
  onMessage: (msg: DmMessage) => void;
}

export default function DmSocketBridge({ userId, onMessage }: DmSocketBridgeProps) {
  useDmSocket(userId, onMessage);
  return null;
}
