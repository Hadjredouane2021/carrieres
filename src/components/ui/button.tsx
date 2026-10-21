import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Variantes partagées par les boutons et les liens d'action (via buttonVariants) du site public et du back-office.
export const buttonVariants = cva(
  "group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        sun: "bg-sun text-night shadow-[0_18px_44px_-20px_rgba(255,122,26,0.95)] hover:bg-sun-bright",
        night: "bg-night text-white hover:bg-institution",
        light: "bg-white text-night hover:bg-dawn",
        glass: "border border-white/20 bg-white/[0.06] text-white backdrop-blur hover:border-white/40 hover:bg-white/[0.12]",
        outline: "border border-night/15 bg-white text-night hover:border-night/35",
        ghost: "text-night hover:bg-night/[0.05]",
        danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-14 px-7 text-base",
      },
    },
    defaultVariants: { variant: "sun", size: "md" },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariants & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

// Pastille fléchée des CTA principaux (« Je m'inscris → »).
export function ArrowBadge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-night text-sun transition-transform motion-safe:group-hover/btn:translate-x-0.5 rtl:motion-safe:group-hover/btn:-translate-x-0.5",
        className,
      )}
    >
      {children}
    </span>
  );
}
