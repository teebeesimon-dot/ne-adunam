import Link from "next/link";
import { getEventLocationName } from "@/lib/location";
import { SPORT_LABELS } from "@/lib/labels";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

function formatDate(date: string): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ro-RO", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/event/${event.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-primary opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold tracking-tight text-card-foreground">
          {event.title}
        </h3>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {SPORT_LABELS[event.sport] ?? event.sport}
        </span>
      </div>

      {event.seriesId && event.seriesTotal ? (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Recurent · joc {(event.seriesIndex ?? 0) + 1} din {event.seriesTotal}
        </span>
      ) : null}

      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
        <p>
          {formatDate(event.date)}
          {event.time ? ` · ${event.time}` : ""}
        </p>
        <p>{getEventLocationName(event)}</p>
      </div>

      <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        Max {event.maxParticipants} participanți
      </p>
    </Link>
  );
}
