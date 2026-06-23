"use client";

import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { useAuth } from "@/contexts/AuthProvider";
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
import type { Sport } from "@/lib/types";

export default function CreateEventForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [sport, setSport] = useState<Sport>("football");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(
    DEFAULT_DURATION_MINUTES
  );
  const [pricePerHour, setPricePerHour] = useState("");
  const [location, setLocation] = useState<EventLocation | null>(null);
  const [maxParticipants, setMaxParticipants] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const priceValue = Number(pricePerHour);
  const totalCost = computeTotalCost(priceValue, durationMinutes);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!location?.placeId) {
      setError("Selectează o locație din sugestiile Google.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await addDoc(collection(db, "events"), {
        title: title.trim(),
        sport,
        date,
        time,
        durationMinutes,
        ...(priceValue > 0 ? { pricePerHour: priceValue } : {}),
        maxParticipants: Number(maxParticipants),
        ownerId: user.uid,
        createdAt: Timestamp.now(),
        ...toFirestoreLocation(location),
      });

      router.push("/");
    } catch {
      setError("Nu s-a putut salva evenimentul. Încearcă din nou.");
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
          placeholder="Meci de fotbal"
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
        value={location}
        onChange={setLocation}
        required
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
          placeholder="10"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Se salvează..." : "Creează eveniment"}
      </button>
    </form>
  );
}
