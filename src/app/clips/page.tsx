"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ClipGallery from "@/components/ClipGallery";
import { useSession } from "next-auth/react";

export default function ClipsPage() {
  const { data: session } = useSession();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-page-in">
      {/* Hero Header */}
      <div className="relative text-center mb-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[var(--color-magenta)]/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-[var(--color-violet)]/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 20, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <span className="inline-flex items-center gap-1.5 glass-badge text-[var(--color-magenta)] mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)] animate-pulse" />
              COMMUNITY
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold">
              <span className="gradient-text">Scene Collector</span>
            </h1>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-[var(--color-mute)] text-sm sm:text-base max-w-lg mx-auto">
            Collect and share the best anime scenes, moments, and clips.
          </motion.p>
          {session?.user?.id && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-5">
              <Link href="/clips/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(255,45,120,0.3)] hover:shadow-[0_0_40px_rgba(255,45,120,0.5)] transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Upload a Clip
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      <ClipGallery />
    </div>
  );
}
