export type AttendanceStatus = "vin" | "poate" | "nu_vin";

export type Sport = "football" | "tennis" | "padel";

export type UserRole = "super_admin" | "organizer" | "user";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface Response {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  status: AttendanceStatus;
  goingRegisteredAt?: unknown;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface ParticipantEntry {
  userId: string;
  name: string;
  photoURL: string | null;
}

export interface RankedParticipantEntry extends ParticipantEntry {
  positionLabel: string;
  isWaitlisted: boolean;
}

export interface GroupedResponses {
  vin: ParticipantEntry[];
  poate: ParticipantEntry[];
  nu_vin: ParticipantEntry[];
}

export interface ResponseCounts {
  vin: number;
  poate: number;
  nu_vin: number;
}

export interface Participant {
  name: string;
  status: AttendanceStatus;
}

export interface GeneratedTeams {
  teamA: ParticipantEntry[];
  teamB: ParticipantEntry[];
  generatedAt?: unknown;
}

export interface Event {
  id: string;
  title: string;
  sport: Sport;
  date: string;
  time: string;
  durationMinutes?: number;
  pricePerHour?: number;
  location: string;
  placeId?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  maxParticipants: number;
  ownerId: string;
  seriesId?: string;
  seriesIndex?: number;
  seriesTotal?: number;
  teams?: GeneratedTeams | null;
  participants?: Participant[];
  createdAt?: string;
}
