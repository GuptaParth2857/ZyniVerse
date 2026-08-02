"use client";
import SubRouteError from "@/components/SubRouteError";
export default function Error(props: { error: Error; reset: () => void }) {
  return <SubRouteError {...props} />;
}
