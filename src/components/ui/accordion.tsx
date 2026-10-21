"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion(props: AccordionPrimitive.AccordionSingleProps) {
  return <AccordionPrimitive.Root {...props} />;
}

export function AccordionItem({ className, ...props }: AccordionPrimitive.AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "rounded-[1.5rem] border border-night/10 bg-white transition-colors data-[state=open]:border-sun/50 data-[state=open]:shadow-[0_24px_60px_-36px_rgba(11,27,58,0.45)]",
        className,
      )}
      {...props}
    />
  );
}

export function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex flex-1 items-center justify-between gap-4 rounded-[1.5rem] px-5 py-5 text-start text-base font-semibold text-night outline-none transition focus-visible:ring-2 focus-visible:ring-sun-ink sm:px-7 sm:py-6 sm:text-lg",
          className,
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-dawn text-sun-ink transition duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:bg-sun group-data-[state=open]:text-night"
        >
          <Plus className="size-4" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({ className, children, ...props }: AccordionPrimitive.AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("px-5 pb-6 text-base leading-7 text-muted sm:px-7", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
