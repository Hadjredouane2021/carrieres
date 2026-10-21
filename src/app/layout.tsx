import type { Metadata } from "next";
import { Inter, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const accent = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Forum des Métiers de l'Assurance 2026",
    template: "%s — Forum des Métiers de l'Assurance",
  },
  description:
    "Le Forum des Métiers de l'Assurance, organisé par la Fédération Marocaine de l'Assurance. Choisis ton avenir. Novembre 2026, Casablanca.",
  openGraph: {
    title: "Forum des Métiers de l'Assurance 2026",
    description: "Choisis ton avenir. Novembre 2026, Casablanca.",
    locale: "fr_MA",
    type: "website",
  },
};

export const instant = false;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" dir="ltr" className={`${inter.variable} ${display.variable} ${accent.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
