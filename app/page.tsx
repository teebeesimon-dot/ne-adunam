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
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <header className="mb-12 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Hai pe teren
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-balance text-foreground sm:text-6xl">
            Adună echipa,{" "}
            <span className="text-primary">intră în joc</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Organizează evenimente sportive, confirmă prezența și distribuie
            linkul direct echipei — totul într-un singur loc.
          </p>
          <HomeActions />
        </header>

        <section>
          <div className="mb-5 flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Evenimentele mele
            </h2>
            <span className="h-px flex-1 bg-border" />
          </div>
          <EventList />
        </section>
      </div>
    </div>
  );
}
