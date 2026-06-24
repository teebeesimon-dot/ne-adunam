"use client";

import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { useAuth } from "@/contexts/AuthProvider";
import { inputClassName, labelClassName, SPORTS } from "@/lib/event-form";
import { formatEventDateShort } from "@/lib/events";
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
import {
  generateOccurrenceDates,
  RECURRENCE_OPTIONS,
  type RecurrenceFrequency,
} from "@/lib/recurrence";
import { createSeries } from "@/lib/series";
import type { PaymentModel, Sport } from "@/lib/types";

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
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>("weekly");
  const [endDate, setEndDate] = useState("");
  const [paymentModel, setPaymentModel] = useState<PaymentModel>("per_game");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const priceValue = Number(pricePerHour);
  const monthlyValue = Number(monthlyPrice);
  const totalCost = computeTotalCost(priceValue, durationMinutes);
  // Monthly subscription is only meaningful for recurring series.
  const effectivePaymentModel: PaymentModel = isRecurring
    ? paymentModel
    : "per_game";

  // Preview only: when an end date is set, show how many occurrences fall in range.
  const occurrenceDates =
    isRecurring && date && endDate
      ? generateOccurrenceDates(date, endDate, frequency)
      : [];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!location?.placeId) {
      setError("Selectează o locație din sugestiile Google.");
      return;
    }

    if (isRecurring && endDate && occurrenceDates.length === 0) {
      setError(
        "Data de sfârșit trebuie să fie după data de început (sau lasă-o goală pentru o serie deschisă)."
      );
      return;
    }

    if (
      isRecurring &&
      effectivePaymentModel === "monthly" &&
      !(monthlyValue > 0)
    ) {
      setError("Introdu suma abonamentului lunar.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      if (isRecurring) {
        // Recurring → create a series + its first occurrence (lazy materialization).
        const eventId = await createSeries({
          title: title.trim(),
          sport,
          time,
          durationMinutes,
          maxParticipants: Number(maxParticipants),
          location,
          ownerId: user.uid,
          frequency,
          startDate: date,
          endDate: endDate || null,
          paymentModel: effectivePaymentModel,
          ...(priceValue > 0 ? { pricePerHour: priceValue } : {}),
          ...(monthlyValue > 0 ? { monthlyPrice: monthlyValue } : {}),
        });
        router.push(`/event/${eventId}`);
      } else {
        // Standalone one-off event.
        await addDoc(collection(db, "events"), {
          title: title.trim(),
          sport,
          time,
          durationMinutes,
          ...(priceValue > 0 ? { pricePerHour: priceValue } : {}),
          maxParticipants: Number(maxParticipants),
          ownerId: user.uid,
          createdAt: Timestamp.now(),
          ...toFirestoreLocation(location),
          date,
        });
        router.push("/");
      }
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
            {isRecurring ? "Data de început" : "Data"}
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
        {effectivePaymentModel === "per_game" && (
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
        )}
      </div>

      {time && effectivePaymentModel === "per_game" && (
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

      <div className="rounded-2xl border border-border bg-muted/30 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-primary"
          />
          <span>
            <span className="block text-sm font-semibold text-foreground">
              Se repetă (serie)
            </span>
            <span className="block text-xs text-muted-foreground">
              Creează o serie. Pe pagina principală apare doar apariția care
              urmează, restul rămân în istoric.
            </span>
          </span>
        </label>

        {isRecurring && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="frequency" className={labelClassName}>
                  Frecvență
                </label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(e.target.value as RecurrenceFrequency)
                  }
                  className={inputClassName}
                >
                  {RECURRENCE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="endDate" className={labelClassName}>
                  Data de sfârșit (opțional)
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={date || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {endDate ? (
                occurrenceDates.length > 0 && date ? (
                  <>
                    Serie cu sfârșit:{" "}
                    <span className="font-semibold text-foreground">
                      {occurrenceDates.length} apariții
                    </span>
                    , între {formatEventDateShort(occurrenceDates[0])} și{" "}
                    {formatEventDateShort(
                      occurrenceDates[occurrenceDates.length - 1]
                    )}
                    .
                  </>
                ) : (
                  "Data de sfârșit trebuie să fie după data de început."
                )
              ) : (
                "Fără dată de sfârșit = serie deschisă. O poți închide oricând mai târziu, iar istoricul rămâne."
              )}
            </p>

            <div>
              <span className={labelClassName}>Model de plată</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    {
                      value: "per_game" as PaymentModel,
                      label: "Plată pe joc",
                      hint: "Cost teren/oră, împărțit la jucători",
                    },
                    {
                      value: "monthly" as PaymentModel,
                      label: "Abonament lunar",
                      hint: "Sumă lunară per jucător",
                    },
                  ]
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer flex-col rounded-xl border px-3 py-2.5 transition ${
                      paymentModel === opt.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentModel"
                        value={opt.value}
                        checked={paymentModel === opt.value}
                        onChange={() => setPaymentModel(opt.value)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm font-semibold text-foreground">
                        {opt.label}
                      </span>
                    </span>
                    <span className="ml-6 text-xs text-muted-foreground">
                      {opt.hint}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {paymentModel === "monthly" && (
              <div>
                <label htmlFor="monthlyPrice" className={labelClassName}>
                  Cost abonament lunar / jucător (lei)
                </label>
                <input
                  id="monthlyPrice"
                  type="number"
                  min={0}
                  step={10}
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                  className={inputClassName}
                  placeholder="ex. 150"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Se poate modifica ulterior din pagina seriei.
                </p>
              </div>
            )}
          </div>
        )}
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
