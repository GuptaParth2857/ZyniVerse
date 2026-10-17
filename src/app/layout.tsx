import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Rajdhani, Inter as InterFont, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import AuthProvider from "@/components/AuthProvider";
import BackToTop from "@/components/BackToTop";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import OfflineStatus from "@/components/OfflineStatus";
import InstallPrompt from "@/components/InstallPrompt";
import RouteTransition from "@/components/RouteTransition";
import MobileNav from "@/components/MobileNav";
import AdBanner from "@/components/AdBanner";
import DeferredWidgets from "@/components/DeferredWidgets";
import NativeBannerAd from "@/components/NativeBannerAd";
import OnboardingGate from "@/components/OnboardingGate";

import ActivityTracker from "@/components/ActivityTracker";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import AnimationPauser from "@/components/AnimationPauser";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = InterFont({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const viewport: Viewport = {
  themeColor: "#d946ef",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ZyniVerse — Anime Watch Order, Filler Guides & Schedule",
    template: "%s | ZyniVerse — Free Anime Platform",
  },
  description:
    "Free anime platform for fans worldwide — filler guides for 200+ anime (Naruto, One Piece, Bleach), complete watch orders, weekly schedules, AI recommendations, manga reader & community. Hindi/Tamil/Telugu dub tracking for India.",
  manifest: "/manifest.json",
  keywords: [
    "anime", "anime filler list", "naruto filler list", "one piece filler list", "bleach filler list",
    "anime watch order", "anime release schedule", "anime episode guide", "anime database",
    "anime tracker", "anime watchlist", "anime wiki", "anime recommendations",
    "best anime 2026", "seasonal anime 2026", "anime airing schedule", "simulcast anime",
    "anime filler episodes", "which episodes to skip", "boruto filler list",
    "dragon ball z filler list", "fairy tail filler list", "my hero academia filler list",
    "anime sites", "free anime", "anime alternative", "anime community",
    "manga reader", "manga tracker", "where to watch anime",
    "hindi dubbed anime", "hindi anime", "tamil dubbed anime", "telugu dubbed anime", "indian anime dubs",
    "anime community india", "anime streaming india", "anime dubbed hindi", "manga reader india",
    "anime conventions india", "crunchyroll india",
  ],
  openGraph: {
    title: "ZyniVerse — Anime Watch Order, Filler Guides & Schedule",
    description:
      "Filler guides for 200+ anime, complete watch orders, weekly schedules, AI recommendations, manga reader & community — free. Hindi/Tamil/Telugu dub tracking for India.",
    type: "website",
    siteName: "ZyniVerse",
    // Global-English default; India-specific routes keep their own targeting.
    locale: "en_US",
    url: BASE_URL,
    // NOTE: no `images` here on purpose. The site-wide card comes from the
    // file convention (src/app/opengraph-image.tsx), which Next applies only to
    // routes that don't set `openGraph.images` themselves. Setting it here
    // would win for every route that has no `openGraph` of its own and shadow
    // the richer generated card.
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    creator: "@GuptaParth2857",
    title: "ZyniVerse — Anime Watch Order, Filler Guides & Schedule",
    description:
      "Filler guides for 200+ anime, watch orders, schedules, AI recommendations & manga reader — free. Hindi/Tamil/Telugu dub tracking for India.",
    // Images are intentionally omitted: Next auto-fills `twitter.images` from
    // the resolved `openGraph.images` (see inheritFromMetadata in
    // next/dist/lib/metadata), so the site-wide card stays in one place.
  },
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION || "",
    other: {
      "yandex-verification": process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "",
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_MS_VALIDATE || "",
      "facebook-domain-verification": process.env.NEXT_PUBLIC_FB_DOMAIN_VERIFICATION || "",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${rajdhani.variable} ${inter.variable} ${jetbrainsMono.variable}`} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://img.anili.st" />
        <link rel="preconnect" href="https://s4.anilist.co" />
        <link rel="dns-prefetch" href="https://img.anili.st" />
        <link rel="dns-prefetch" href="https://s4.anilist.co" />
        <link rel="alternate" type="application/rss+xml" title="ZyniVerse Feed" href="/feed.xml" />
        <meta name="news_keywords" content="anime, filler guides, watch order, anime schedule, anime recommendations, manga, Hindi dub, Tamil dub, Telugu dub" />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-1B5P1BSEB9"
          strategy="lazyOnload"
        />
        <Script
          id="gtag-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-1B5P1BSEB9');`,
          }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "ZyniVerse",
                alternateName: ["Zyni Verse", "Zyniverse", "Zyverse", "Zyni Verse Anime"],
                url: BASE_URL,
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
                description: "ZyniVerse is a free anime platform for fans worldwide — filler guides for 200+ anime, watch order guides, weekly schedules, AI-powered recommendations, a manga reader, cosplay gallery, and community, plus Indian dub tracking (Hindi, Tamil, Telugu).",
                inLanguage: ["en", "hi"],
                publisher: {
                  "@type": "Organization",
                  name: "ZyniVerse",
                  url: BASE_URL,
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "ZyniVerse",
                alternateName: ["Zyni Verse", "Zyniverse", "Zyverse", "ZyniVerse Anime"],
                url: BASE_URL,
                logo: `${BASE_URL}/logo.png`,
                description: "Free anime platform for fans worldwide — filler guides, watch orders, schedules, AI recommendations, manga reader, cosplay gallery, and community, plus Indian dub tracking (Hindi, Tamil, Telugu) for anime fans in India.",
                foundingDate: "2025",
                areaServed: [
                  { "@type": "Country", name: "India" },
                  { "@type": "Country", name: "United States" },
                  { "@type": "Country", name: "Japan" },
                ],
                sameAs: [
                  "https://www.youtube.com/@Itz_parth_2007",
                  "https://www.facebook.com/profile.php?id=61584572784224",
                  "https://www.instagram.com/gupta.parth1015/",
                  "https://x.com/GuptaParth2857",
                ],
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "customer service",
                  availableLanguage: ["English", "Hindi", "Tamil", "Telugu"],
                },
                hasOfferCatalog: {
                  "@type": "OfferCatalog",
                  name: "Anime Platform Services",
                  itemListElement: [
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Anime Filler Guides" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Indian Dub Tracking" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Anime Recommendations" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Manga Reader" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Anime Community" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Watch Parties" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cosplay Gallery" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Indian TV Schedule" } },
                  ],
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What is ZyniVerse?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "ZyniVerse is a free anime platform used by fans worldwide. It provides filler guides for 200+ anime, watch order guides, weekly schedules, AI-powered anime recommendations, a manga reader, cosplay gallery, watch parties, and a community — plus Indian dub tracking (Hindi, Tamil, Telugu) for fans in India. Visit zyverse.in to get started.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is ZyniVerse free to use?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes, ZyniVerse is completely free to use. Users can track their anime watchlist, access filler guides, join the community, and use all features without paying. No premium subscription required.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Does ZyniVerse have Hindi dubbed anime?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes, ZyniVerse tracks Hindi, Tamil, and Telugu dubbed anime. You can see which anime are available in Indian languages, get alerts when new dubbed episodes air, and check the complete dubbed anime schedule. We track 25+ Hindi dubbed anime, 15+ Tamil dubs, and 10+ Telugu dubs.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What anime filler guides does ZyniVerse offer?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "ZyniVerse provides detailed filler guides for over 200 anime including Naruto, One Piece, Bleach, Dragon Ball Z, Fairy Tail, Boruto, My Hero Academia, and more. Each guide tells you exactly which episodes are filler, mixed, or canon, so you can skip the filler and enjoy the main story.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How to skip filler in Naruto?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "ZyniVerse's Naruto filler list shows all 220 filler episodes out of 720 total episodes. You can watch episodes 1-101 (canon), skip to 107-135 (mixed), then resume at 136-220 (filler). Visit zyverse.in/filler for the complete episode-by-episode guide.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Best anime to watch in 2026?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Top anime of 2026 include Solo Leveling Season 2, Demon Slayer Infinity Castle, Jujutsu Kaisen, Attack on Titan Final Season, One Piece, and My Hero Academia. ZyniVerse provides AI recommendations tailored to your taste — visit zyverse.in/search to discover new anime.",
                    },
                  },
                ],
              },
            ]),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5241033119281791"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <AuthProvider>
          <Suspense fallback={null}>
            <ActivityTracker />
          </Suspense>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          <Providers>
            <AnimationPauser />
            <ScrollProgress />
            <CursorGlow />
            <OnboardingGate />
            <Navbar />
            <main className="flex-1"><RouteTransition>{children}</RouteTransition></main>
            {/* Native banner between content and footer */}
            <NativeBannerAd className="mx-auto max-w-7xl px-4 sm:px-6 py-2" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
              <AdBanner placement="global-footer" type="banner" />
            </div>
            {/* Sitewide Social Bar – floating sticky widget */}
            <DeferredWidgets />
            <MobileNav />
            <BackToTop />
            <Footer />
            <CookieConsent />
            <ServiceWorkerRegistration />
            <OfflineStatus />
            <InstallPrompt />
          </Providers>
        </AuthProvider>
        {/* Vercel Analytics/Speed Insights inject their own scripts — VERCEL_URL is
            only populated by the Vercel runtime (this repo's local .env sets
            VERCEL=1, which would otherwise 404 /_vercel/* here) */}
        {process.env.VERCEL_URL && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
