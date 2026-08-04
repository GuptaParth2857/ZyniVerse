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
import RouteTransition from "@/components/RouteTransition";
import MobileNav from "@/components/MobileNav";
import AdBanner from "@/components/AdBanner";
import SocialBarAd from "@/components/SocialBarAd";
import NativeBannerAd from "@/components/NativeBannerAd";
import ChatWidget from "@/components/ChatWidget";
import SplashScreen from "@/components/SplashScreen";
import HeartbeatProvider from "@/components/HeartbeatProvider";
import ActivityTracker from "@/components/ActivityTracker";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { Analytics } from "@vercel/analytics/next";

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
    default: "ZyniVerse — Anime Filler Guides, Indian Dubs & Manga Tracker",
    template: "%s | ZyniVerse — Free Anime Platform",
  },
  description:
    "India's #1 anime platform — skip filler in 200+ anime (Naruto, One Piece, Bleach), track Hindi/Tamil/Telugu dubs, get AI recommendations, build your watchlist, read manga, check anime schedules & join India's biggest anime community — all free.",
  manifest: "/manifest.json",
  keywords: [
    "anime", "anime filler list", "naruto filler list", "one piece filler list", "bleach filler list",
    "hindi dubbed anime", "hindi anime", "tamil dubbed anime", "telugu dubbed anime", "indian anime dubs",
    "anime tracker", "anime watchlist", "anime community india", "boruto filler list",
    "anime schedule", "anime recommendations", "best anime 2026", "anime watch order",
    "dragon ball z filler list", "fairy tail filler list", "my hero academia filler list",
    "anime sites", "free anime", "anime streaming india", "anime dubbed hindi",
    "anime filler episodes", "which episodes to skip", "anime episode guide",
    "manga reader india", "anime wiki", "anime conventions india",
    "crunchyroll india", "anime alternative", "anime community",
    "seasonal anime 2026", "anime airing schedule", "simulcast anime",
  ],
  openGraph: {
    title: "ZyniVerse — Anime Filler Guides, Indian Dubs & Manga Tracker",
    description: "India's #1 anime platform — filler guides for 200+ anime, Hindi/Tamil/Telugu dubs, AI recommendations, watchlist, manga reader & anime community. Free.",
    type: "website",
    siteName: "ZyniVerse",
    locale: "en_IN",
    countryName: "India",
    url: BASE_URL,
    images: [{ url: `${BASE_URL}/logo.png`, width: 512, height: 512, alt: "ZyniVerse Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    creator: "@GuptaParth2857",
    title: "ZyniVerse — Anime Filler Guides, Indian Dubs & Manga Tracker",
    description: "India's #1 anime platform — filler guides for 200+ anime, Hindi/Tamil/Telugu dubs, AI recommendations & community. Free.",
  },
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  alternates: {
    canonical: BASE_URL,
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
    <html lang="en" className={`h-full antialiased ${rajdhani.variable} ${inter.variable} ${jetbrainsMono.variable}`} data-scroll-behavior="smooth">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-1B5P1BSEB9"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-1B5P1BSEB9');`,
          }}
        />
        <script
          type="application/ld+json"
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
                description: "India's #1 anime platform — filler guides for 200+ anime, Indian dub tracking (Hindi/Tamil/Telugu), AI recommendations, watchlist, manga reader, cosplay gallery, and anime community.",
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
                description: "India's #1 anime platform. Filler guides, Indian dub tracking, AI recommendations, manga reader, cosplay gallery, and anime community for Indian anime fans.",
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
                      text: "ZyniVerse is India's #1 free anime platform. It provides filler guides for 200+ anime, Indian dub tracking (Hindi, Tamil, Telugu), AI-powered anime recommendations, a manga reader, cosplay gallery, watch parties, and a community for Indian anime fans. Visit zyverse.in to get started.",
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
          strategy="afterInteractive"
        />
        <AuthProvider>
          <HeartbeatProvider />
          <Suspense fallback={null}>
            <ActivityTracker />
          </Suspense>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          <Providers>
            <Navbar />
            <main className="flex-1"><RouteTransition>{children}</RouteTransition></main>
            {/* Native banner between content and footer */}
            <NativeBannerAd className="mx-auto max-w-7xl px-4 sm:px-6 py-2" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
              <AdBanner placement="global-footer" type="banner" />
            </div>
            {/* Sitewide Social Bar – floating sticky widget */}
            <SocialBarAd />
            <MobileNav />
            <BackToTop />
            <Footer />
            <CookieConsent />
            <ServiceWorkerRegistration />
            <ChatWidget />
            <SplashScreen />
          </Providers>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
