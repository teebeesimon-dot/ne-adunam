import type { Metadata } from "next";
import Link from "next/link";
import CreateEventForm from "@/components/CreateEventForm";
import RequireCreateEvent from "@/components/RequireCreateEvent";

export const metadata: Metadata = {
  title: "Creează eveniment",
  description: "Creează un eveniment sportiv nou pentru echipa ta.",
};

export default function CreateEventPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          ← Înapoi
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-6 text-2xl font-bold text-zinc-900 sm:text-3xl">
            Creează Eveniment
          </h1>
          <RequireCreateEvent>
            <CreateEventForm />
          </RequireCreateEvent>
        </div>
      </div>
    </div>
  );
}
