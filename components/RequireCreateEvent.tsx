"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthProvider";

interface RequireCreateEventProps {
  children: React.ReactNode;
}

export default function RequireCreateEvent({ children }: RequireCreateEventProps) {
  const { user, loading, canCreateEvents, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-zinc-500">Se încarcă...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
        <p className="text-zinc-600">Sign in with Google to continue.</p>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-4 inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!canCreateEvents) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-zinc-900">Access denied</h2>
        <p className="mt-2 text-zinc-600">
          Only organizers and super admins can create events.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Back home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
