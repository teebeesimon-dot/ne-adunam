import type { Metadata } from "next";
import Link from "next/link";
import EventList from "@/components/EventList";
import HomeActions from "@/components/HomeActions";

export const metadata: Metadata = {
  title: "Evenimentele mele",
  description:
    "Vezi evenimentele tale sportive și distribuie linkuri directe echipei.",
};

export default function Home() {
  return (
    <div className="min-h-full bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Ne Adunam
          </h1>
          <p className="mt-3 text-lg text-zinc-600">
            Organizează evenimente sportive și distribuie linkul direct echipei.
          </p>
          <HomeActions />
        </header>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-zinc-900">
            Evenimentele mele
          </h2>
          <EventList />
        </section>
      </div>
    </div>
  );
}
