import type { Metadata } from "next";

export const metadata: Metadata = { robots: "noindex" };

export default function BadgeEmbedPage() {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "transparent" }}>
        <a
          href="https://zyniverse.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",
            borderRadius: 6,
            background: "#12111e",
            border: "1px solid #1f1d33",
            fontSize: 11,
            fontWeight: 600,
            fontFamily:
              "'Rajdhani','Inter',system-ui,-apple-system,sans-serif",
            color: "#f0eef8",
            textDecoration: "none",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ff2d78"
            strokeWidth="2.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Powered by ZyniVerse
        </a>
      </body>
    </html>
  );
}
