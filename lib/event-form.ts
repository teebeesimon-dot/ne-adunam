import type { Sport } from "@/lib/types";

export const SPORTS: { value: Sport; label: string }[] = [
  { value: "football", label: "Fotbal" },
  { value: "tennis", label: "Tenis" },
  { value: "padel", label: "Padel" },
];

export const inputClassName =
  "w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export const labelClassName = "mb-1.5 block text-sm font-medium text-zinc-700";
