"use client";

import { signInWithCustomToken } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

// Never prerender this dev-only page (it reads search params at runtime).
export const dynamic = "force-dynamic";

// Development-only helper used to sign in with a Firebase custom token for
// automated verification. It is completely inert in production builds.
function DevLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Se autentifică…");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setMessage("Lipsește parametrul ?token=");
      return;
    }
    signInWithCustomToken(auth, token)
      .then(() => {
        setMessage("Autentificat. Redirecționare…");
        router.push("/");
      })
      .catch((error) => {
        setMessage(`Eroare: ${error?.message ?? "necunoscută"}`);
      });
  }, [params, router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  );
}

export default function DevLoginPage() {
  // Inert in production: the page renders nothing and runs no auth logic.
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">Se încarcă…</p>
        </main>
      }
    >
      <DevLoginInner />
    </Suspense>
  );
}
