import type { Event, Sport } from "./types";
import { mapFirestoreTeams } from "./teams";

export function parseDate(value: unknown): string {
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString().split("T")[0];
  }
  return "";
}

export function mapFirestoreEvent(
  id: string,
  data: Record<string, unknown>
): Event {
  return {
    id,
    title: (data.title as string) ?? "",
    sport: (data.sport as Sport) ?? "football",
    date: parseDate(data.date),
    time: (data.time as string) ?? "",
    durationMinutes: (data.durationMinutes as number) ?? undefined,
    pricePerHour: (data.pricePerHour as number) ?? undefined,
    location:
      (data.locationName as string) ?? (data.location as string) ?? "",
    placeId: (data.placeId as string) ?? undefined,
    locationName: (data.locationName as string) ?? undefined,
    latitude: (data.latitude as number) ?? undefined,
    longitude: (data.longitude as number) ?? undefined,
    maxParticipants: (data.maxParticipants as number) ?? 0,
    ownerId: (data.ownerId as string) ?? "",
    teams: mapFirestoreTeams(data.teams),
    participants: (data.participants as Event["participants"]) ?? [],
  };
}

export function formatEventDate(date: string): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
