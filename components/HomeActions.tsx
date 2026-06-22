"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthProvider";

export default function HomeActions() {
  const { loading, canCreateEvents } = useAuth();

  if (loading || !canCreateEvents) {
    return null;
  }

  return (
    <Link
      href="/create"
      className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-hover active:scale-[0.98] sm:w-auto"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      Creează Eveniment
    </Link>
  );
}
