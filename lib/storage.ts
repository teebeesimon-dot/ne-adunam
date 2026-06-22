import type { AttendanceStatus, Event, Participant } from "./types";

const EVENTS_KEY = "ne-adunam-events";

function readEvents(): Event[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? (JSON.parse(raw) as Event[]) : [];
  } catch {
    return [];
  }
}

function writeEvents(events: Event[]): void {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function getEvents(): Event[] {
  return readEvents().sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function getUpcomingEvents(): Event[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getEvents().filter((event) => new Date(event.date) >= today);
}

export function getEventById(id: string): Event | undefined {
  return readEvents().find((event) => event.id === id);
}

export function saveEvent(event: Event): void {
  const events = readEvents();
  events.push(event);
  writeEvents(events);
}

export function addParticipant(
  eventId: string,
  name: string,
  status: AttendanceStatus
): Event | undefined {
  const events = readEvents();
  const index = events.findIndex((event) => event.id === eventId);
  if (index === -1) return undefined;

  const trimmed = name.trim();
  if (!trimmed) return events[index];

  const participants = (events[index].participants ?? []).filter(
    (p) => p.name.toLowerCase() !== trimmed.toLowerCase()
  );
  const participant: Participant = { name: trimmed, status };
  participants.push(participant);

  events[index] = { ...events[index], participants };
  writeEvents(events);
  return events[index];
}
