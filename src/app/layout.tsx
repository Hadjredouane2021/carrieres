import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const accent = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Assur'Carrière — Le Forum des Métiers de l'Assurance 2026",
    template: "%s — Assur'Carrière",
  },
  description:
    "Assur'Carrière, le Forum des Métiers de l'Assurance organisé par la Fédération Marocaine de l'Assurance. Choisis ton avenir. Novembre 2026, Casablanca.",
  applicationName: "Assur'Carrière",
  openGraph: {
    title: "Assur'Carrière — Le Forum des Métiers de l'Assurance 2026",
    description: "Choisis ton avenir. Novembre 2026, Casablanca.",
    siteName: "Assur'Carrière",
    locale: "fr_MA",
    type: "website",
    images: [{ url: "/video/assurcarriere-hero-poster.webp", width: 1920, height: 1080, alt: "Casablanca au lever du soleil" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assur'Carrière — Le Forum des Métiers de l'Assurance 2026",
    description: "Choisis ton avenir. Novembre 2026, Casablanca.",
    images: ["/video/assurcarriere-hero-poster.webp"],
  },
};

export const viewport: Viewport = { themeColor: "#0b1b3a" };

export const instant = false;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" dir="ltr" data-scroll-behavior="smooth" className={`${inter.variable} ${display.variable} ${accent.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
