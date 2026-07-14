"use client";

import { useState, useCallback } from "react";
import type { WidgetDef } from "@/lib/widget-registry";

interface WidgetGeneratorProps {
  widgets: WidgetDef[];
}

export default function WidgetGenerator({ widgets }: WidgetGeneratorProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [params, setParams] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const updateParam = (key: string, value: string) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const resolveTemplate = useCallback(
    (template: string | undefined): string | null => {
      if (!template) return null;
      return template.replace(/\{(\w+)\}/g, (_, key) => {
        if (key === "THEME") return theme;
        return params[key] || `{${key}}`;
      });
    },
    [params, theme]
  );

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-10">
      {/* Theme toggle */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--color-mute)]">Theme:</span>
        <div className="flex rounded-lg border border-[var(--color-line)] overflow-hidden">
          <button
            onClick={() => setTheme("dark")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "bg-[var(--color-cyan)] text-black"
                : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setTheme("light")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              theme === "light"
                ? "bg-[var(--color-cyan)] text-black"
                : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >
            Light
          </button>
        </div>
      </div>

      {widgets.map((widget) => (
        <WidgetCard
          key={widget.id}
          widget={widget}
          theme={theme}
          params={params}
          updateParam={updateParam}
          resolveTemplate={resolveTemplate}
          copiedId={copiedId}
          copyToClipboard={copyToClipboard}
        />
      ))}
    </div>
  );
}

interface WidgetCardProps {
  widget: WidgetDef;
  theme: "dark" | "light";
  params: Record<string, string>;
  updateParam: (key: string, value: string) => void;
  resolveTemplate: (template: string | undefined) => string | null;
  copiedId: string | null;
  copyToClipboard: (text: string, id: string) => void;
}

function WidgetCard({
  widget,
  theme,
  params,
  updateParam,
  resolveTemplate,
  copiedId,
  copyToClipboard,
}: WidgetCardProps) {
  const iframeSrc = resolveTemplate(widget.iframe);
  const scriptCode = resolveTemplate(widget.script);

  // Determine config fields
  const configFields: { key: string; label: string; placeholder: string }[] = [];
  if (widget.type === "filler") {
    configFields.push({ key: "ID", label: "Anime ID", placeholder: "e.g. 21 for One Piece" });
  } else if (widget.type === "dub") {
    configFields.push({ key: "ID", label: "MAL ID", placeholder: "e.g. 21 for One Piece" });
  } else if (widget.type === "progress") {
    configFields.push({ key: "USERNAME", label: "Username", placeholder: "Your username" });
  }

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
      <div className="p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold">{widget.name}</h3>
        <p className="text-sm text-[var(--color-mute)] mt-1">{widget.description}</p>

        {/* Config inputs */}
        {configFields.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {configFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-[var(--color-mute)] mb-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={params[field.key] || ""}
                  onChange={(e) => updateParam(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors w-48"
                />
              </div>
            ))}
          </div>
        )}

        {/* Preview */}
        {iframeSrc && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-[var(--color-mute)] uppercase tracking-wider mb-2">
              Preview
            </p>
            <div
              className="rounded-xl border border-[var(--color-line)] overflow-hidden"
              style={{
                maxWidth: widget.width + 4,
                background: theme === "dark" ? "#0a0a0f" : "#ffffff",
              }}
            >
              <iframe
                src={iframeSrc}
                title={widget.name}
                width={widget.width}
                height={widget.height}
                frameBorder="0"
                className="block"
                style={{ maxWidth: "100%" }}
              />
            </div>
          </div>
        )}

        {/* Code snippets */}
        <div className="mt-5 space-y-4">
          {widget.iframe && (
            <CodeSnippet
              label="iframe Embed"
              code={iframeSrc || ""}
              copyId={`${widget.id}-iframe`}
              copiedId={copiedId}
              copyToClipboard={copyToClipboard}
            />
          )}
          {widget.script && (
            <CodeSnippet
              label="Script Embed"
              code={scriptCode || ""}
              copyId={`${widget.id}-script`}
              copiedId={copiedId}
              copyToClipboard={copyToClipboard}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CodeSnippet({
  label,
  code,
  copyId,
  copiedId,
  copyToClipboard,
}: {
  label: string;
  code: string;
  copyId: string;
  copiedId: string | null;
  copyToClipboard: (text: string, id: string) => void;
}) {
  const isCopied = copiedId === copyId;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-[var(--color-mute)] uppercase tracking-wider">
          {label}
        </span>
        <button
          onClick={() => copyToClipboard(code, copyId)}
          className="text-xs font-medium text-[var(--color-cyan)] hover:underline"
        >
          {isCopied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] p-3 text-xs overflow-x-auto text-[var(--color-cyan)] font-mono">
        {code || "Fill in the fields above to generate code"}
      </pre>
    </div>
  );
}
