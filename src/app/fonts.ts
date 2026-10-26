import {
  Bricolage_Grotesque,
  Caveat,
  Cormorant_Garamond,
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  Fredoka,
  Inter,
  Instrument_Serif,
  Lexend,
  Manrope,
  Montserrat,
  Nunito,
  Open_Sans,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Poppins,
  Quicksand,
  Sora,
  Space_Grotesk,
  Syne,
  Work_Sans,
} from "next/font/google";

// Polices d'origine : préchargées, variables historiques du site.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

// Polices au choix (Admin > Couleurs et polices) : téléchargées seulement si elles sont utilisées.
const poppins = Poppins({ subsets: ["latin"], preload: false, display: "swap", weight: ["400", "500", "600", "700", "800"] });
const montserrat = Montserrat({ subsets: ["latin"], preload: false, display: "swap", style: ["normal", "italic"] });
const dmSans = DM_Sans({ subsets: ["latin"], preload: false, display: "swap" });
const manrope = Manrope({ subsets: ["latin"], preload: false, display: "swap" });
const openSans = Open_Sans({ subsets: ["latin"], preload: false, display: "swap" });
const workSans = Work_Sans({ subsets: ["latin"], preload: false, display: "swap" });
const lexend = Lexend({ subsets: ["latin"], preload: false, display: "swap" });
const sora = Sora({ subsets: ["latin"], preload: false, display: "swap" });
const syne = Syne({ subsets: ["latin"], preload: false, display: "swap" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], preload: false, display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], preload: false, display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], preload: false, display: "swap", style: ["normal", "italic"] });
const fraunces = Fraunces({ subsets: ["latin"], preload: false, display: "swap", style: ["normal", "italic"] });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], preload: false, display: "swap", weight: "400", style: ["normal", "italic"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], preload: false, display: "swap", weight: ["400", "500", "600", "700"], style: ["normal", "italic"] });
const caveat = Caveat({ subsets: ["latin"], preload: false, display: "swap" });
const nunito = Nunito({ subsets: ["latin"], preload: false, display: "swap" });
const quicksand = Quicksand({ subsets: ["latin"], preload: false, display: "swap" });
const fredoka = Fredoka({ subsets: ["latin"], preload: false, display: "swap" });

const fonts = {
  inter,
  "space-grotesk": spaceGrotesk,
  instrument,
  outfit,
  poppins,
  montserrat,
  "dm-sans": dmSans,
  manrope,
  "open-sans": openSans,
  "work-sans": workSans,
  lexend,
  sora,
  syne,
  "plus-jakarta": plusJakarta,
  bricolage,
  playfair,
  fraunces,
  "dm-serif": dmSerif,
  cormorant,
  caveat,
  nunito,
  quicksand,
  fredoka,
};

export const fontVariables = [inter, spaceGrotesk, instrument, outfit].map((font) => font.variable).join(" ");

/** Nom de famille CSS généré par next/font, par identifiant (voir src/lib/font-options.ts). */
export const FONT_FAMILIES: Record<string, string> = Object.fromEntries(Object.entries(fonts).map(([id, font]) => [id, font.style.fontFamily]));
