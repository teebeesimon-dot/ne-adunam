"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthProvider";

interface RequireSuperAdminProps {
  children: React.ReactNode;
}

export default function RequireSuperAdmin({ children }: RequireSuperAdminProps) {
  const { user, loading, isSuperAdmin, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Se încarcă...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-zinc-600">Sign in with Google to access admin.</p>
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

  if (!isSuperAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Access denied</h1>
        <p className="mt-2 text-zinc-500">
          Only super admins can access this page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Back home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
