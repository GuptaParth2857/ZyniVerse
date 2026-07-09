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
import MobileNav from "@/components/MobileNav";
import AdBanner from "@/components/AdBanner";
import ChatWidget from "@/components/ChatWidget";
import SplashScreen from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: { default: "ZyniVerse — Anime Filler Guides, Indian Dubs & Manga Tracker", template: "%s | ZyniVerse" },
  description:
    "ZyniVerse — India's ultimate anime platform. Filler guides for 200+ anime, Indian dub tracking (Hindi/Tamil/Telugu), AI recommendations, watchlist, manga reader, and anime community.",
  manifest: "/manifest.json",
  keywords: ["anime filler list", "indian anime dubs", "hindi dubbed anime", "anime tracker", "anime community india", "anime conventions india", "filler episodes skip", "anime watchlist"],
  openGraph: {
    title: "ZyniVerse — Anime Filler Guides & Indian Dubs",
    description: "India's ultimate anime platform. Skip filler, track Indian dubs, discover new anime.",
    type: "website",
    siteName: "ZyniVerse",
    locale: "en_IN",
    countryName: "India",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZyniVerse — Anime Filler Guides & Indian Dubs",
    description: "India's ultimate anime platform. Skip filler, track Indian dubs, discover new anime.",
  },
  robots: "index, follow",
  alternates: {
    languages: {
      "en": "/",
      "hi": "/hi",
      "ta": "/ta",
      "te": "/te",
    },
  },
  icons: {
    icon: "/logo.png",
    apple: "/icons/icon-192.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#d946ef" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script src="https://pl30249247.effectivecpmnetwork.com/03/0f/9e/030f9e8d607cacdca8e790b568cd262b.js" async />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ZyniVerse",
              url: process.env.NEXT_PUBLIC_BASE_URL || "https://zyniverse.vercel.app",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${process.env.NEXT_PUBLIC_BASE_URL || "https://zyniverse.vercel.app"}/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
              description: "India's ultimate anime platform — filler guides, Indian dub tracking, AI recommendations, and anime community.",
              inLanguage: ["en", "hi", "ta", "te"],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <div className="scanlines" />
        <div className="noise-vignette" />
        <AuthProvider>
          <Providers>
            <Navbar />
            <main className="flex-1"><RouteTransition>{children}</RouteTransition></main>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
              <AdBanner placement="global-footer" type="banner" />
            </div>
            <MobileNav />
            <BackToTop />
            <Footer />
            <CookieConsent />
            <ServiceWorkerRegistration />
            <ChatWidget />
            <SplashScreen />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
