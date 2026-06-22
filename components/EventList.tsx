"use client";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { mapFirestoreEvent } from "@/lib/events";
import type { Event } from "@/lib/types";

export default function EventList() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "events"),
      where("ownerId", "==", user.uid),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setEvents(
          snapshot.docs.map((doc) => mapFirestoreEvent(doc.id, doc.data()))
        );
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Se încarcă evenimentele...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted p-8 text-center">
        <p className="text-muted-foreground">
          Sign in with Google to see your events.
        </p>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted p-8 text-center">
        <p className="font-medium text-foreground">Nu ai evenimente create.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Creează un eveniment și distribuie linkul direct participanților.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
