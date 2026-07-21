import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Manrope, Syne } from "next/font/google";
import { AnalyticsConsent } from "@/components/analytics/AnalyticsConsent";
import { AnalyticsSpaTracker } from "@/components/analytics/AnalyticsSpaTracker";
import { env } from "@/config/env";
import { brand, seo } from "@/content/site";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = env.siteUrl.replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seo.title,
    template: `%s · ${brand.name}`,
  },
  description: seo.description,
  keywords: [...seo.keywords],
  applicationName: brand.name,
  authors: [{ name: brand.ecosystem }],
  creator: brand.ecosystem,
  publisher: brand.ecosystem,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: brand.name,
    title: seo.title,
    description: seo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f3f4f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
        <AnalyticsConsent />
        <Suspense fallback={null}>
          <AnalyticsSpaTracker />
        </Suspense>
      </body>
    </html>
  );
}
