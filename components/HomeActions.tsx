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
      className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] sm:w-auto"
    >
      Creează Eveniment
    </Link>
  );
}
