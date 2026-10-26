import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function appUrl() {
  const value = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8185";
  return value.replace(/\/$/, "");
}

export function asStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function placeLabel(venue?: string | null, city?: string | null) {
  const parts = [venue, city]
    .map((part) => part?.trim() ?? "")
    .filter(Boolean);
  return parts.filter((part, index) => parts.findIndex((item) => item.localeCompare(part, "fr", { sensitivity: "accent" }) === 0) === index).join(" — ");
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
