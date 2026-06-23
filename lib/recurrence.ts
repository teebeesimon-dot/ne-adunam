export type RecurrenceFrequency = "weekly" | "biweekly";

export const RECURRENCE_OPTIONS: {
  value: RecurrenceFrequency;
  label: string;
  intervalDays: number;
}[] = [
  { value: "weekly", label: "Săptămânal", intervalDays: 7 },
  { value: "biweekly", label: "La 2 săptămâni", intervalDays: 14 },
];

/** Maximum number of occurrences generated for a single series (safety cap). */
export const MAX_OCCURRENCES = 104;

function intervalForFrequency(frequency: RecurrenceFrequency): number {
  return (
    RECURRENCE_OPTIONS.find((o) => o.value === frequency)?.intervalDays ?? 7
  );
}

/**
 * Returns an array of ISO date strings (YYYY-MM-DD), starting at `startDate`
 * and repeating every interval until `endDate` (inclusive).
 * Dates are computed in a timezone-safe way using UTC noon.
 */
export function generateOccurrenceDates(
  startDate: string,
  endDate: string,
  frequency: RecurrenceFrequency
): string[] {
  if (!startDate || !endDate) return [];

  const start = new Date(`${startDate}T12:00:00Z`);
  const end = new Date(`${endDate}T12:00:00Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  if (end < start) return [];

  const intervalDays = intervalForFrequency(frequency);
  const dates: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end && dates.length < MAX_OCCURRENCES) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + intervalDays);
  }

  return dates;
}
