import { formatEventDate } from "@/lib/events";
import { getEventLocationName } from "@/lib/location";
import type { Event, Sport } from "@/lib/types";

const SPORT_EMOJI: Record<Sport, string> = {
  football: "⚽",
  tennis: "🎾",
  padel: "🏓",
};

export function buildWhatsAppShareMessage(
  event: Pick<Event, "title" | "sport" | "date" | "time" | "location" | "locationName">,
  eventLink: string
): string {
  const emoji = SPORT_EMOJI[event.sport] ?? "⚽";
  const date = formatEventDate(event.date);
  const location = getEventLocationName(event);

  return `${emoji} ${event.title}

📅 ${date}
🕒 ${event.time}
📍 ${location}

Confirm participation:
${eventLink}`;
}

export function buildWhatsAppShareUrl(
  event: Pick<Event, "title" | "sport" | "date" | "time" | "location" | "locationName">,
  eventLink: string
): string {
  return `https://wa.me/?text=${encodeURIComponent(
    buildWhatsAppShareMessage(event, eventLink)
  )}`;
}
