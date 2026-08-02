"use client";

import { useState } from "react";

const TYPES = [
  { value: "bug", label: "Bug Report", icon: "🐛", color: "#ff3366" },
  { value: "suggestion", label: "Suggestion", icon: "💡", color: "#ffd700" },
  { value: "feature", label: "Feature Request", icon: "🚀", color: "#8a2be2" },
  { value: "other", label: "Other", icon: "💬", color: "#00ffff" },
];

export default function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit() {
    if (message.trim().length < 5 || status === "submitting") return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: message.trim(), page: window.location.pathname, email: email.trim() || undefined }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("");
        setEmail("");
        setTimeout(() => { setStatus("idle"); setIsOpen(false); }, 2500);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="w-full">

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all neon-rgb-border hover:scale-[1.01] active:scale-[0.99]"
        style={{ color: "#8a2be2" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        {isOpen ? "Close Feedback" : "Send Feedback"}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Form Panel */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isOpen ? "500px" : "0",
          opacity: isOpen ? 1 : 0,
          marginTop: isOpen ? "12px" : "0",
        }}
      >
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
          {/* Type Selector */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className="rounded-lg py-2 text-center transition-all hover:opacity-80"
                style={{
                  borderColor: type === t.value ? `${t.color}66` : undefined,
                  background: type === t.value ? `${t.color}15` : "transparent",
                  color: type === t.value ? t.color : "var(--color-mute)",
                  border: "1px solid",
                  transition: "transform 0.15s, box-shadow 0.15s, background 0.2s",
                }}
              >
                <span className="text-sm block">{t.icon}</span>
                <span className="text-[9px] font-bold block mt-0.5">
                  {t.label.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue, suggestion, or idea..."
            rows={3}
            className="w-full rounded-lg bg-[var(--color-void)] border border-[var(--color-line)] px-3 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] outline-none resize-none transition-colors mb-0.5"
            maxLength={2000}
          />
          <div className="text-right text-[9px] text-[var(--color-mute)] mb-2">{message.length}/2000</div>

          {/* Email (optional) */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional, for reply)"
            className="w-full rounded-lg bg-[var(--color-void)] border border-[var(--color-line)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] outline-none transition-colors mb-3"
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={message.trim().length < 5 || status === "submitting"}
            className="w-full rounded-lg py-2.5 text-xs font-bold transition-all neon-rgb-border"
            style={{
              background: status === "success" ? "rgba(0,255,127,0.12)" : status === "error" ? "rgba(255,51,102,0.12)" : "rgba(138,43,226,0.12)",
              color: status === "success" ? "#00ff7f" : status === "error" ? "#ff3366" : "#8a2be2",
              opacity: message.trim().length < 5 ? 0.4 : 1,
              cursor: message.trim().length < 5 ? "not-allowed" : "pointer",
            }}
          >
            {status === "success" ? "✓ Thank you! Feedback sent." : status === "error" ? "✗ Failed. Try again." : status === "submitting" ? "Sending..." : "Send Feedback →"}
          </button>
        </div>
      </div>
    </div>
  );
}
