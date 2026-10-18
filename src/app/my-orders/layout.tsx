import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your ZyniVerse orders and transaction history.",
  alternates: { canonical: "https://zyverse.in/my-orders" },
  robots: { index: false, follow: true },
};

export default function MyOrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
