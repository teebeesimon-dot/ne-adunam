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
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm font-medium text-primary transition hover:text-primary-hover"
        >
          ← Înapoi
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-card-foreground sm:text-3xl">
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
