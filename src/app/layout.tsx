import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8185"),
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
    <html lang="fr" dir="ltr" data-scroll-behavior="smooth" className={`${fontVariables} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
