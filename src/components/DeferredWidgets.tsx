"use client";

import dynamic from "next/dynamic";

// Floating, non-critical, user-triggered widgets. They used to be part of every
// page's initial JS bundle even though none of them are needed for first paint
// (they only matter once the user opens the chat, hits ⌘K, or after hydration).
// Loading them with `ssr: false` keeps their code out of the shared/main chunk
// and fetches it after the page is interactive.
const SocialBarAd = dynamic(() => import("./SocialBarAd"), { ssr: false });
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });
const ToastFeed = dynamic(() => import("./ToastFeed"), { ssr: false });
const SplashScreen = dynamic(() => import("./SplashScreen"), { ssr: false });
const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

export default function DeferredWidgets() {
  return (
    <>
      <SocialBarAd />
      <ChatWidget />
      <ToastFeed />
      <SplashScreen />
      <CommandPalette />
    </>
  );
}
