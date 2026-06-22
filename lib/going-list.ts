import type { ParticipantEntry, RankedParticipantEntry } from "@/lib/types";

interface GoingResponseInput {
  userId: string;
  name: string;
  photoURL: string | null;
  goingRegisteredAt: number;
}

export interface GoingLists {
  confirmed: RankedParticipantEntry[];
  waitlist: RankedParticipantEntry[];
}

export function parseTimestamp(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof value.toMillis === "function"
  ) {
    return value.toMillis();
  }
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().getTime();
  }
  if (typeof value === "number") return value;
  return Number.MAX_SAFE_INTEGER;
}

export function computeGoingLists(
  responses: GoingResponseInput[],
  maxParticipants: number
): GoingLists {
  const sorted = [...responses].sort(
    (a, b) => a.goingRegisteredAt - b.goingRegisteredAt
  );

  const confirmed: RankedParticipantEntry[] = [];
  const waitlist: RankedParticipantEntry[] = [];

  sorted.forEach((response, index) => {
    const entry: ParticipantEntry = {
      userId: response.userId,
      name: response.name,
      photoURL: response.photoURL,
    };

    if (index < maxParticipants) {
      confirmed.push({
        ...entry,
        positionLabel: `#${index + 1}`,
        isWaitlisted: false,
      });
    } else {
      waitlist.push({
        ...entry,
        positionLabel: `R${index - maxParticipants + 1}`,
        isWaitlisted: true,
      });
    }
  });

  return { confirmed, waitlist };
}

export function findUserGoingPosition(
  userId: string,
  lists: GoingLists
): RankedParticipantEntry | null {
  return (
    lists.confirmed.find((p) => p.userId === userId) ??
    lists.waitlist.find((p) => p.userId === userId) ??
    null
  );
}
