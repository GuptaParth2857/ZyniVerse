"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const NEW_USER_WINDOW_MS = 1000 * 60 * 60 * 2;

export default function OnboardingGate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const onboardingPath = pathname.startsWith("/onboarding");
  const attemptedRef = useRef(false);
  const redirRef = useRef(false);

  useEffect(() => {
    if (onboardingPath) return;
    if (status !== "authenticated") return;
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    const user = session.user;
    const onboarded = user?.onboarded;
    const createdAt = user?.createdAt ? new Date(user.createdAt).getTime() : null;

    // Only auto-redirect genuinely new users (fresh signup) who haven't finished onboarding.
    const isNewUser = createdAt !== null && createdAt > Date.now() - NEW_USER_WINDOW_MS;
    if (onboarded === false && isNewUser && !redirRef.current) {
      redirRef.current = true;
      const t = setTimeout(() => router.replace("/onboarding"), 500);
      return () => clearTimeout(t);
    }
  }, [status, session, onboardingPath, router]);

  return null;
}
