"use client";

import { motion, AnimatePresence } from "framer-motion";

interface VoiceParticipant {
  user: { id: string; username: string; avatar: string | null };
  socketId: string;
  isSpeaking: boolean;
}

interface VoiceChatProps {
  voiceActive: boolean;
  muted: boolean;
  participants: VoiceParticipant[];
  speakingMap: Record<string, boolean>;
  onJoin: () => void;
  onLeave: () => void;
  onToggleMute: () => void;
}

export default function VoiceChat({
  voiceActive,
  muted,
  participants,
  speakingMap,
  onJoin,
  onLeave,
  onToggleMute,
}: VoiceChatProps) {
  const totalInVoice = participants.length + (voiceActive ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          Voice Chat
          {totalInVoice > 0 && (
            <span className="rounded-full bg-[rgba(0,255,224,0.1)] px-2 py-0.5 text-[9px] font-bold text-[#00ffe0]">
              {totalInVoice}
            </span>
          )}
        </h3>
      </div>

      {/* Voice participants */}
      <AnimatePresence>
        {voiceActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 mb-3">
              {/* Self */}
              <div className="flex items-center gap-2.5 rounded-[10px] bg-[rgba(0,255,224,0.05)] border border-[rgba(0,255,224,0.1)] px-3 py-2">
                <div className="relative h-7 w-7 shrink-0 rounded-full bg-[rgba(0,255,224,0.1)] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#00ffe0]">Y</span>
                  {speakingMap["local"] && (
                    <span className="absolute -inset-0.5 rounded-full border-2 border-[#00ffe0] animate-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-[#00ffe0] truncate">You (speaking)</p>
                </div>
                <span className={`text-[9px] font-mono ${muted ? "text-red-400" : "text-green-400"}`}>
                  {muted ? "MUTED" : "LIVE"}
                </span>
              </div>

              {/* Remote participants */}
              {participants.map((p) => {
                const isSpeaking = speakingMap[p.socketId] || p.isSpeaking;
                return (
                  <motion.div
                    key={p.socketId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2.5 rounded-[10px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] px-3 py-2"
                  >
                    <div className="relative h-7 w-7 shrink-0 rounded-full bg-[rgba(255,0,230,0.1)] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#ff00e6]">
                        {p.user.username.charAt(0).toUpperCase()}
                      </span>
                      {isSpeaking && (
                        <span className="absolute -inset-0.5 rounded-full border-2 border-[#ff00e6] animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-white/60 truncate">{p.user.username}</p>
                    </div>
                    {isSpeaking && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 bg-[#ff00e6] rounded-full"
                            animate={{ height: [4, 8 + i * 2, 4] }}
                            transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {participants.length === 0 && (
                <p className="text-[10px] text-white/20 text-center py-2">
                  You&apos;re the only one in voice chat
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex gap-2">
        {!voiceActive ? (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onJoin}
            className="flex-1 flex items-center justify-center gap-2 rounded-[10px] bg-[rgba(0,255,224,0.08)] border border-[rgba(0,255,224,0.15)] px-4 py-2.5 text-[11px] font-bold text-[#00ffe0] hover:bg-[rgba(0,255,224,0.15)] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" />
            </svg>
            Join Voice
          </motion.button>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onToggleMute}
              className={`flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-[11px] font-bold transition-all ${
                muted
                  ? "bg-red-500/10 border border-red-500/20 text-red-400"
                  : "bg-[rgba(0,255,224,0.08)] border border-[rgba(0,255,224,0.15)] text-[#00ffe0]"
              }`}
            >
              {muted ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
                  <path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                </svg>
              )}
              {muted ? "Unmute" : "Mute"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onLeave}
              className="flex items-center justify-center gap-2 rounded-[10px] bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-[11px] font-bold text-red-400 hover:bg-red-500/20 transition-all"
            >
              Leave
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
