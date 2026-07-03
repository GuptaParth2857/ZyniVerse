import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import AuthProvider from "@/components/AuthProvider";
import BackToTop from "@/components/BackToTop";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import RouteTransition from "@/components/RouteTransition";

export const metadata: Metadata = {
  title: "ZyniVerse — Anime & Manga Discovery Platform",
  description:
    "ZyniVerse — discover trending anime and manga with 3D carousels, filler guides, character explorer, and cloud-synced watchlist. Never miss canon episodes again.",
  manifest: "/manifest.json",
  openGraph: {
    title: "ZyniVerse — Anime & Manga Discovery",
    description: "3D anime discovery platform with filler guides, characters, and watchlist.",
    type: "website",
    siteName: "ZyniVerse",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZyniVerse — Anime & Manga Discovery",
    description: "3D anime discovery platform with filler guides, characters, and watchlist.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#d946ef" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="scanlines" />
        <div className="noise-vignette" />
        <AuthProvider>
          <Providers>
            <Navbar />
            <main className="flex-1"><RouteTransition>{children}</RouteTransition></main>
            <BackToTop />
            <Footer />
            <CookieConsent />
            <ServiceWorkerRegistration />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
