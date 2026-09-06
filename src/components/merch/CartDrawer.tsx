"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./useCart";

export type CheckoutStatus = "idle" | "login" | "processing" | "error";

export function CartDrawer({
  open,
  onClose,
  onCheckout,
  checkoutStatus,
}: {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
  checkoutStatus: CheckoutStatus;
}) {
  const { items, removeItem, setQuantity, clearCart, total } = useCart();

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 z-[90] flex h-full w-full max-w-sm flex-col border-l border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
          <h3 className="font-display text-lg font-black text-[var(--color-ink)]">
            Your Cart
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)]"
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--color-mute)]">
              Your cart is empty.
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={i.product.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--color-void)]">
                    <Image
                      src={i.product.image}
                      alt={i.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                      {i.product.name}
                    </p>
                    <p className="text-xs text-[var(--color-cyan)]">
                      ₹{(i.product.price / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(i.product.id, i.quantity - 1)}
                        className="h-6 w-6 rounded border border-[var(--color-line)] text-xs text-[var(--color-ink)] hover:border-[var(--color-cyan)]"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-[var(--color-ink)]">
                        {i.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(i.product.id, i.quantity + 1)}
                        className="h-6 w-6 rounded border border-[var(--color-line)] text-xs text-[var(--color-ink)] hover:border-[var(--color-cyan)]"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(i.product.id)}
                        className="ml-auto text-xs text-[var(--color-mute)] hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[var(--color-line)] px-5 py-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-[var(--color-mute)]">Subtotal</span>
              <span className="font-bold text-[var(--color-ink)]">
                ₹{(total / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              disabled={checkoutStatus === "processing"}
              className="neon-rgb-border btn-magnetic w-full rounded-xl py-3 text-sm font-bold text-[var(--color-ink)] disabled:opacity-60"
            >
              {checkoutStatus === "processing" ? "Processing…" : "Checkout →"}
            </button>
            {checkoutStatus === "error" && (
              <p className="mt-2 text-center text-xs text-red-400">
                Checkout failed. Please try again.
              </p>
            )}
            {checkoutStatus === "login" && (
              <p className="mt-2 text-center text-xs text-[var(--color-amber)]">
                <Link href="/login" className="underline">Log in</Link> to purchase.
              </p>
            )}
            <button
              type="button"
              onClick={clearCart}
              className="mt-2 w-full text-center text-xs text-[var(--color-mute)] hover:text-red-400"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}