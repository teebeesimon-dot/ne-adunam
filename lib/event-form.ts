import type { Sport } from "@/lib/types";

export const SPORTS: { value: Sport; label: string }[] = [
  { value: "football", label: "Fotbal" },
  { value: "tennis", label: "Tenis" },
  { value: "padel", label: "Padel" },
];

export const inputClassName =
  "w-full rounded-xl border border-input bg-card px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25";

export const labelClassName =
  "mb-1.5 block text-sm font-medium text-muted-foreground";
