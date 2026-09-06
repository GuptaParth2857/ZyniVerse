"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CartDrawer } from "./CartDrawer";
import { useCart } from "./useCart";

interface CatalogProduct {
  id: string;
  name: string;
  image: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
  category: string;
  platform: string;
  anime: string | null;
  affiliateUrl: string | null;
}

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function ProductStore() {
  const { data: session } = useSession();
  const { items, addItem, count } = useCart();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<
    "idle" | "login" | "processing" | "error"
  >("idle");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/merch");
        const data = await res.json();
        if (!cancelled) setProducts(data.products ?? []);
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
  }, []);

  const checkout = useCallback(async () => {
    if (!session?.user) {
      setCheckoutStatus("login");
      return;
    }
    try {
      setCheckoutStatus("processing");
      const res = await fetch("/api/stripe/checkout-merch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setCheckoutStatus("error");
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutStatus("error");
    }
  }, [session, items]);

  if (loading) {
    return (
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl bg-[var(--color-surface1)]" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
            ZyniVerse Originals
          </p>
          <h2 className="mt-1 font-display text-2xl font-black text-[var(--color-ink)]">
            In-House Store
          </h2>
          <p className="mt-1 text-xs text-[var(--color-mute)]">
            Checkout directly with secure card / UPI (Stripe).
          </p>
        </div>
        {count > 0 && (
          <button
            type="button"
            onClick={() => {
              setCheckoutStatus("idle");
              setCartOpen(true);
            }}
            className="neon-rgb-border btn-magnetic flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-[var(--color-ink)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Cart ({count})
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="card-glow flex flex-col overflow-hidden rounded-xl bg-[var(--color-panel)] border border-[var(--color-line)]"
            style={{ "--glow-color": "var(--color-cyan)" } as CSSProperties}
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={p.image}
                alt={p.name}
                fill
                loading="lazy"
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                {p.category}
              </span>
              {p.stock > 0 && (
                <span className="absolute top-2 right-2 rounded-full bg-[var(--color-cyan)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--color-cyan)]">
                  In stock
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="mb-1 text-sm font-bold line-clamp-2 text-[var(--color-ink)]">
                {p.name}
              </h3>
              {p.description && (
                <p className="mb-2 text-xs text-[var(--color-mute)] line-clamp-2">
                  {p.description}
                </p>
              )}
              <div className="mt-auto flex items-center gap-2">
                <span className="text-lg font-bold text-[var(--color-cyan)]">
                  {formatPrice(p.price)}
                </span>
                {p.originalPrice && p.originalPrice > p.price && (
                  <span className="text-xs text-[var(--color-mute)] line-through">
                    {formatPrice(p.originalPrice)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  addItem({ id: p.id, name: p.name, image: p.image, price: p.price })
                }
                className="glass-btn mt-3 w-full rounded-lg py-2 text-sm font-bold text-[var(--color-ink)] transition-colors hover:text-[var(--color-cyan)]"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={checkout}
        checkoutStatus={checkoutStatus}
      />

      {!session && checkoutStatus === "login" && (
        <div className="mt-4 rounded-xl border border-[var(--color-amber)]/40 bg-[var(--color-amber)]/10 p-4 text-sm text-[var(--color-ink)]">
          Please{" "}
          <Link href="/login" className="font-bold text-[var(--color-cyan)] underline">
            log in
          </Link>{" "}
          to complete your purchase.
        </div>
      )}
    </div>
  );
}