import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowBadge, buttonVariants, type ButtonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Primitives du site public : conteneurs, titres de section, liens d'action, badges et états vides.

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 md:px-6", className)}>{children}</div>;
}

const tones = {
  white: "bg-white text-night",
  dawn: "bg-dawn text-night",
  night: "surface-dark relative isolate overflow-clip bg-night text-white",
} as const;

export function Section({
  labelledBy,
  tone = "white",
  className,
  children,
  id,
}: {
  labelledBy?: string;
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn(tones[tone], "py-14 sm:py-20 md:py-28", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, dark = false, className }: { children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <p className={cn("flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em]", dark ? "text-sun" : "text-sun-ink", className)}>
      <span className="h-px w-8 bg-current" aria-hidden="true" />
      {children}
    </p>
  );
}

function comparable(value: string) {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  dark = false,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  dark?: boolean;
  children?: React.ReactNode;
}) {
  // Le sur-titre disparaît quand il répète le titre saisi dans le back-office.
  const showEyebrow = Boolean(eyebrow) && comparable(eyebrow ?? "") !== comparable(title);
  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
      <div className="scroll-reveal">
        {showEyebrow ? <Eyebrow dark={dark}>{eyebrow}</Eyebrow> : null}
        <h2
          id={id}
          className={cn(
            "display text-[clamp(2.1rem,4.4vw,3.9rem)] leading-[0.98] text-balance",
            showEyebrow && "mt-4",
            dark ? "text-white" : "text-night",
          )}
        >
          <AccentTitle text={title} dark={dark} />
        </h2>
      </div>
      {intro || children ? (
        <div className="scroll-reveal grid justify-items-start gap-5 lg:pb-2">
          {intro ? <p className={cn("max-w-xl whitespace-pre-line text-base leading-7 sm:text-lg sm:leading-8", dark ? "text-haze" : "text-muted")}>{intro}</p> : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}

// Dernier mot du titre en serif italique solaire : contraste éditorial sans toucher au texte administrable.
export function AccentTitle({ text, dark = false }: { text: string; dark?: boolean }) {
  const words = text.trim().split(/\s+/);
  // Ponctuation finale isolée (« Pour qui ? ») : l'accent porte sur le mot qui la précède.
  const tail = words.length > 2 && /^[?!:;.…]+$/.test(words.at(-1) ?? "") ? ` ${words.pop()}` : "";
  if (words.length < 2) return <>{text}</>;
  const last = words.pop();
  return (
    <>
      {words.join(" ")}{" "}
      <span className={cn("font-accent text-[1.08em] font-normal italic tracking-[-0.01em]", dark ? "text-sun" : "text-sun-ink")}>{last}</span>
      {tail}
    </>
  );
}

export function TextLink({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline", dark ? "text-white" : "text-night")}
    >
      {children}
      <ArrowRight className={cn("size-4 transition-transform motion-safe:group-hover:translate-x-0.5 rtl:-scale-x-100", dark ? "text-sun" : "text-sun-ink")} aria-hidden="true" />
    </Link>
  );
}

// Lien d'action : la variante solaire porte la pastille fléchée des CTA principaux.
export function CtaLink({
  href,
  children,
  variant = "sun",
  size = "lg",
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
} & ButtonVariants) {
  const arrow = variant === "sun" && size === "lg";
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), arrow && "justify-between gap-4 pe-2 ps-7", className)}>
      {children}
      {arrow ? (
        <ArrowBadge>
          <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
        </ArrowBadge>
      ) : null}
    </Link>
  );
}

const badgeTones = {
  sun: "bg-sun/10 text-sun-ink",
  night: "bg-night/[0.06] text-night/75",
  glass: "border border-white/15 bg-white/[0.07] text-white backdrop-blur",
  solid: "bg-night text-sun",
} as const;

export function Badge({ tone = "sun", className, children }: { tone?: keyof typeof badgeTones; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
  dark = false,
  className,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid justify-items-center gap-4 rounded-[2rem] border border-dashed px-6 py-14 text-center sm:py-16",
        dark ? "border-white/20" : "border-night/15 bg-dawn/60",
        className,
      )}
    >
      <span className={cn("grid size-14 place-items-center rounded-2xl", dark ? "bg-white/[0.07] text-sun" : "bg-white text-sun-ink shadow-sm")}>
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h3 className={cn("display text-2xl sm:text-3xl", dark ? "text-white" : "text-night")}>{title}</h3>
      {text ? <p className={cn("max-w-md", dark ? "text-haze" : "text-muted")}>{text}</p> : null}
      {action}
    </div>
  );
}

// Silhouette stylisée de Casablanca : tours du centre, Twin Center et minaret de la mosquée Hassan II.
const TOWERS: [number, number, number][] = [
  [0, 70, 58], [64, 42, 92], [104, 56, 70], [156, 36, 118], [190, 62, 80], [250, 42, 104],
  [300, 46, 172], [364, 46, 166], [418, 54, 88], [474, 36, 126], [508, 66, 72], [576, 46, 108],
  [702, 42, 94], [746, 72, 62], [818, 40, 116], [860, 54, 82], [912, 44, 68], [1236, 46, 90],
  [1284, 38, 128], [1324, 62, 74], [1384, 56, 98],
];
const LIT = [6, 7, 9, 14, 19];

export function Skyline({ className, lights = true }: { className?: string; lights?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 260" preserveAspectRatio="xMaxYMax slice" className={className}>
      <g fill="currentColor">
        {TOWERS.map(([x, width, height]) => (
          <rect key={x} x={x} y={260 - height} width={width} height={height} />
        ))}
        <path d="M640 260V124l56-18v154z" />
        <rect x="958" y="214" width="262" height="46" />
        <path d="M972 214a28 28 0 0 1 56 0zM1150 214a28 28 0 0 1 56 0z" />
        <rect x="1086" y="48" width="38" height="212" />
        <rect x="1094" y="24" width="22" height="24" />
        <rect x="1103" y="8" width="4" height="16" />
      </g>
      {lights ? (
        <g fill="var(--sun-bright)" opacity="0.55">
          {LIT.flatMap((index) => {
            const [x, width, height] = TOWERS[index];
            const windows = [];
            for (let row = 0; row * 16 + 20 < height - 10; row += 1) {
              for (let col = 0; col * 11 + 8 < width - 6; col += 1) {
                if ((row * 7 + col * 3 + index) % 5 === 0) {
                  windows.push(<rect key={`${index}-${row}-${col}`} x={x + 8 + col * 11} y={260 - height + 20 + row * 16} width="3" height="6" />);
                }
              }
            }
            return windows;
          })}
        </g>
      ) : null}
    </svg>
  );
}

// Halo solaire et trame discrète des sections nuit.
export function NightDecor({ glow = "end" }: { glow?: "end" | "start" }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className={cn("absolute -top-48 size-[38rem] rounded-full bg-sun/20 blur-[130px]", glow === "end" ? "end-[-12%]" : "start-[-12%]")} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(70%_60%_at_80%_10%,#000,transparent)]" />
    </div>
  );
}

// Mise en relief d'un mot saisi entre astérisques dans le back-office : « Envie de découvrir *l'assurance* autrement ».
export function Highlighted({ text }: { text: string }) {
  const parts = text.split(/(\*[^*\n]+\*)/g);
  return (
    <>
      {parts.map((part, index) =>
        /^\*[^*\n]+\*$/.test(part) ? (
          <mark key={index} className="inline-block -rotate-1 box-decoration-clone rounded-[0.6rem] border-2 border-night bg-[#3DD6AE] px-1 leading-tight text-night shadow-[2px_2px_0_0_#0B1B3A]">
            {part.slice(1, -1)}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
