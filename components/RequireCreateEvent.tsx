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
        <p className="text-muted-foreground">Se încarcă...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-muted p-8 text-center">
        <p className="text-muted-foreground">Sign in with Google to continue.</p>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!canCreateEvents) {
    return (
      <div className="rounded-2xl border border-border bg-muted p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground">Access denied</h2>
        <p className="mt-2 text-muted-foreground">
          Only organizers and super admins can create events.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover"
        >
          Back home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
