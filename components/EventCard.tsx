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
      className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-900">{event.title}</h3>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {SPORT_LABELS[event.sport] ?? event.sport}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-sm text-zinc-600">
        <p>
          {formatDate(event.date)}
          {event.time ? ` · ${event.time}` : ""}
        </p>
        <p>{getEventLocationName(event)}</p>
      </div>

      <p className="mt-3 text-sm font-medium text-emerald-600">
        Max {event.maxParticipants} participanți
      </p>
    </Link>
  );
}
