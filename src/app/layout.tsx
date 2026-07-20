import type { Metadata } from "next";
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
import Script from "next/script";

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

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
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
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "ZyniVerse — Anime Filler Guides & Indian Dubs",
    description: "India's ultimate anime platform. Skip filler, track Indian dubs, discover new anime.",
  },
  robots: "index, follow",
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
        <meta name="theme-color" content="#d946ef" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "ZyniVerse",
                alternateName: ["Zyni Verse", "Zyniverse", "Zyverse"],
                url: BASE_URL,
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
                description: "India's ultimate anime platform — filler guides for 200+ anime, Indian dub tracking (Hindi/Tamil/Telugu), AI recommendations, watchlist, manga reader, cosplay gallery, and anime community.",
                inLanguage: "en",
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
                alternateName: ["Zyni Verse", "Zyniverse", "Zyverse"],
                url: BASE_URL,
                logo: `${BASE_URL}/logo.png`,
                description: "India's ultimate anime platform. Filler guides, Indian dub tracking, AI recommendations, manga reader, cosplay gallery, and anime community for Indian anime fans.",
                foundingDate: "2025",
                areaServed: {
                  "@type": "Country",
                  name: "India",
                },
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
                      text: "ZyniVerse is India's ultimate anime platform. It provides filler guides for 200+ anime, Indian dub tracking (Hindi, Tamil, Telugu), AI-powered anime recommendations, a manga reader, cosplay gallery, watch parties, and a community for Indian anime fans. The website is zyverse.in.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is ZyniVerse free to use?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes, ZyniVerse is free to use. Users can track their anime watchlist, access filler guides, join the community, and use most features without paying. Premium features may be available for advanced tools.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Does ZyniVerse have Hindi dubbed anime?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes, ZyniVerse tracks Hindi, Tamil, and Telugu dubbed anime. Users can see which anime are available in Indian languages and get alerts when new dubbed episodes air on Indian TV channels.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What anime filler guides does ZyniVerse offer?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "ZyniVerse provides filler guides for over 200 anime including Naruto, One Piece, Bleach, Dragon Ball Z, Fairy Tail, and more. Each guide tells you exactly which episodes are filler and which are canon, so you can skip the boring parts.",
                    },
                  },
                ],
              },
            ]),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
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
      </body>
    </html>
  );
}
