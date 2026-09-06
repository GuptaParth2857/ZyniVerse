"use client";

import { useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/PageTransition";

interface OrderItemLite {
  id: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
}

interface OrderLite {
  id: string;
  status: string;
  subtotal: number;
  total: number;
  currency: string;
  createdAt: string;
  items: OrderItemLite[];
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Payment pending",
  paid: "Paid",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (!cancelled) setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [session, status]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
            Orders
          </p>
          <h1 className="mt-1 font-display text-3xl font-black text-[var(--color-ink)]">
            My Orders
          </h1>
        </div>

        {status === "loading" || loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-[var(--color-surface1)]" />
            ))}
          </div>
        ) : !session?.user ? (
          <div className="rounded-xl border border-[var(--color-amber)]/40 bg-[var(--color-amber)]/10 p-6 text-sm text-[var(--color-ink)]">
            Please{" "}
            <Link href="/login" className="font-bold text-[var(--color-cyan)] underline">
              log in
            </Link>{" "}
            to see your orders.
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-line)] p-10 text-center text-sm text-[var(--color-mute)]">
            No orders yet.{" "}
            <Link href="/merch" className="text-[var(--color-cyan)] underline">
              Browse the store
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="card-glow rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5"
                style={{ "--glow-color": "var(--color-cyan)" } as CSSProperties}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-[var(--color-mute)]">
                    #{o.id.slice(0, 8)}
                  </span>
                  <span className="rounded-full bg-[var(--color-cyan)]/20 px-3 py-1 text-xs font-bold text-[var(--color-cyan)]">
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </div>
                <ul className="space-y-2">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-[var(--color-ink)]">
                        {it.name} × {it.quantity}
                      </span>
                      <span className="shrink-0 text-[var(--color-mute)]">
                        ₹{(it.price / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--color-line)] pt-3 text-sm">
                  <span className="text-[var(--color-mute)]">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-bold text-[var(--color-cyan)]">
                    ₹{(o.total / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}