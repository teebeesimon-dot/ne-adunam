"use client";

import { signInWithCustomToken } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

// Development-only helper page used to sign in with a Firebase custom token
// for automated verification. It is completely inert in production builds.
export default function DevLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Se autentifică…");

  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    if (!isDev) return;
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
  }, [isDev, params, router]);

  if (!isDev) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  );
}
