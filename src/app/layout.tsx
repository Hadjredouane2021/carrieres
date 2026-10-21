import type { Metadata } from "next";
import { Inter, Montserrat, Space_Grotesk } from "next/font/google";
import { PageTransition } from "@/components/page-transition";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const hero = Montserrat({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-hero" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8185"),
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
    <html lang="fr" dir="ltr" className={`${inter.variable} ${display.variable} ${hero.variable} h-full`}>
      <body className="min-h-full antialiased">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
