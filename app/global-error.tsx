"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ro">
      <body className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans text-zinc-900">
        <main className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Ne Adunam</h1>
          <p className="mt-3 text-sm text-zinc-600">
            Aplicația a întâmpinat o eroare critică.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 overflow-auto rounded-lg bg-zinc-100 p-3 text-left text-xs text-red-700">
              {error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Reîncarcă aplicația
          </button>
        </main>
      </body>
    </html>
  );
}
