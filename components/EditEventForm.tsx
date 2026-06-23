"use client";

import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { inputClassName, labelClassName, SPORTS } from "@/lib/event-form";
import { db } from "@/lib/firebase";
import type { EventLocation } from "@/lib/location";
import { toFirestoreLocation } from "@/lib/location";
import {
  computeTotalCost,
  DEFAULT_DURATION_MINUTES,
  DURATION_OPTIONS,
  formatLei,
  formatTimeRange,
} from "@/lib/pricing";
import type { Event, Sport } from "@/lib/types";

interface EditEventFormProps {
  event: Event;
}

function getInitialLocation(event: Event): EventLocation | null {
  if (
    event.placeId &&
    event.locationName &&
    event.latitude != null &&
    event.longitude != null
  ) {
    return {
      placeId: event.placeId,
      locationName: event.locationName,
      latitude: event.latitude,
      longitude: event.longitude,
    };
  }
  return null;
}

export default function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(event.title);
  const [sport, setSport] = useState<Sport>(event.sport);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time);
  const [durationMinutes, setDurationMinutes] = useState(
    event.durationMinutes ?? DEFAULT_DURATION_MINUTES
  );
  const [pricePerHour, setPricePerHour] = useState(
    event.pricePerHour != null ? String(event.pricePerHour) : ""
  );
  const [location, setLocation] = useState<EventLocation | null>(() =>
    getInitialLocation(event)
  );
  const [maxParticipants, setMaxParticipants] = useState(
    String(event.maxParticipants)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const priceValue = Number(pricePerHour);
  const totalCost = computeTotalCost(priceValue, durationMinutes);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!location?.placeId) {
      setError("Selectează o locație din sugestiile Google.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await updateDoc(doc(db, "events", event.id), {
        title: title.trim(),
        sport,
        date,
        time,
        durationMinutes,
        pricePerHour: priceValue > 0 ? priceValue : null,
        maxParticipants: Number(maxParticipants),
        updatedAt: Timestamp.now(),
        ...toFirestoreLocation(location),
      });

      router.push(`/event/${event.id}`);
    } catch {
      setError("Nu s-a putut actualiza evenimentul. Încearcă din nou.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className={labelClassName}>
          Titlu eveniment
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="sport" className={labelClassName}>
          Sport
        </label>
        <select
          id="sport"
          required
          value={sport}
          onChange={(e) => setSport(e.target.value as Sport)}
          className={inputClassName}
        >
          {SPORTS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={labelClassName}>
            Data
          </label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="time" className={labelClassName}>
            Ora de început
          </label>
          <input
            id="time"
            type="time"
            required
            step={1800}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="duration" className={labelClassName}>
            Durată
          </label>
          <select
            id="duration"
            required
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className={inputClassName}
          >
            {DURATION_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pricePerHour" className={labelClassName}>
            Cost teren / oră (lei)
          </label>
          <input
            id="pricePerHour"
            type="number"
            min={0}
            step={10}
            value={pricePerHour}
            onChange={(e) => setPricePerHour(e.target.value)}
            className={inputClassName}
            placeholder="Opțional, ex. 200"
          />
        </div>
      </div>

      {time && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">
            Interval: {formatTimeRange(time, durationMinutes)}
          </p>
          {totalCost > 0 && (
            <p className="mt-1 text-muted-foreground">
              Cost total teren:{" "}
              <span className="font-semibold text-foreground">
                {formatLei(totalCost)}
              </span>{" "}
              — se împarte automat la jucătorii confirmați.
            </p>
          )}
        </div>
      )}

      <LocationAutocomplete
        id="edit-location"
        value={location}
        onChange={setLocation}
        required
        initialInputValue={!event.placeId ? event.location : undefined}
      />

      <div>
        <label htmlFor="maxParticipants" className={labelClassName}>
          Număr maxim participanți
        </label>
        <input
          id="maxParticipants"
          type="number"
          required
          min={2}
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
          className={inputClassName}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
        >
          {submitting ? "Se salvează..." : "Salvează modificările"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/event/${event.id}`)}
          className="w-full rounded-xl border border-border px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-muted sm:flex-1"
        >
          Anulează
        </button>
      </div>
    </form>
  );
}
