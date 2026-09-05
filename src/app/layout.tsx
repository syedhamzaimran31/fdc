import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { QueryProvider } from "@/providers/query-provider";

import "./globals.css";

/**
 * Three faces, three jobs. Archivo is tight and engineered, so it carries the
 * headline and the figures. Source Serif reads as document prose. Plex Mono
 * labels every piece of data the way a spec sheet does.
 *
 * next/font self-hosts the files and sets font-display: swap, so there is no
 * render-blocking request to Google and no invisible text on first paint.
 */
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No maximumScale: never take pinch-zoom away from someone who needs it.
  themeColor: "#e5e6e1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${sourceSerif.variable} ${plexMono.variable}`}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
