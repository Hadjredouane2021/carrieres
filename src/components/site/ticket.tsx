"use client";

import { Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
      <Printer className="size-4" aria-hidden="true" />
      {label}
    </button>
  );
}
