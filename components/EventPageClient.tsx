"use client";

import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import AttendanceSection from "@/components/AttendanceSection";
import OpenInGoogleMapsButton from "@/components/OpenInGoogleMapsButton";
import ShareOnWhatsAppButton from "@/components/ShareOnWhatsAppButton";
import TeamGenerator from "@/components/TeamGenerator";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { formatEventDate, mapFirestoreEvent } from "@/lib/events";
import { getEventLocationName } from "@/lib/location";
import { SPORT_LABELS } from "@/lib/labels";
import type { Event } from "@/lib/types";

interface EventPageClientProps {
  id: string;
}

export default function EventPageClient({ id }: EventPageClientProps) {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "events", id),
      (snapshot) => {
        if (snapshot.exists()) {
          setEvent(mapFirestoreEvent(snapshot.id, snapshot.data()));
        } else {
          setEvent(null);
        }
        setLoaded(true);
      },
      () => {
        setLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [id]);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Se încarcă...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Eveniment negăsit</h1>
        <p className="mt-2 text-zinc-500">
          Acest eveniment nu există sau a fost șters.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Înapoi acasă
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        ← Înapoi
      </Link>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
            {event.title}
          </h1>
          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            {SPORT_LABELS[event.sport] ?? event.sport}
          </span>
        </div>

        <dl className="mt-6 space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Sport
            </dt>
            <dd className="mt-1 text-zinc-900">
              {SPORT_LABELS[event.sport] ?? event.sport}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Data
            </dt>
            <dd className="mt-1 text-zinc-900">{formatEventDate(event.date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Ora
            </dt>
            <dd className="mt-1 text-zinc-900">{event.time}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Locație
            </dt>
            <dd className="mt-1 text-zinc-900">
              {getEventLocationName(event)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Participanți maximi
            </dt>
            <dd className="mt-1 text-zinc-900">{event.maxParticipants}</dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-zinc-100 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ShareOnWhatsAppButton event={event} className="w-full sm:w-auto" />
            <OpenInGoogleMapsButton event={event} className="w-full sm:w-auto" />
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 active:scale-[0.98] sm:w-auto"
            >
              Copy Event Link
            </button>
            {user?.uid === event.ownerId && (
              <Link
                href={`/event/${event.id}/edit`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 active:scale-[0.98] sm:w-auto"
              >
                Edit Event
              </Link>
            )}
          </div>
          {copied && (
            <p className="mt-3 text-sm font-medium text-emerald-600">
              Link copied to clipboard!
            </p>
          )}
        </div>
      </div>

      <AttendanceSection
        eventId={event.id}
        maxParticipants={event.maxParticipants}
      />

      <TeamGenerator
        eventId={event.id}
        maxParticipants={event.maxParticipants}
        teams={event.teams}
        isOwner={user?.uid === event.ownerId}
      />
    </div>
  );
}
