import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-medium text-emerald-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Pagina nu a fost găsită
      </h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Link-ul poate fi greșit sau pagina a fost mutată.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Înapoi la Ne Adunam
      </Link>
    </main>
  );
}
