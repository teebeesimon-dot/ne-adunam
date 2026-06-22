import type { GeneratedTeams, ParticipantEntry } from "@/lib/types";

function shuffle<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateRandomTeams(
  confirmedPlayers: ParticipantEntry[]
): GeneratedTeams {
  const shuffled = shuffle(confirmedPlayers);
  const splitIndex = Math.ceil(shuffled.length / 2);

  return {
    teamA: shuffled.slice(0, splitIndex),
    teamB: shuffled.slice(splitIndex),
  };
}

export function mapFirestoreTeams(value: unknown): GeneratedTeams | null {
  if (!value || typeof value !== "object") return null;

  const data = value as Record<string, unknown>;
  const mapPlayers = (players: unknown): ParticipantEntry[] => {
    if (!Array.isArray(players)) return [];
    return players.map((player) => {
      const p = player as Record<string, unknown>;
      return {
        userId: (p.userId as string) ?? "",
        name: (p.name as string) ?? "",
        photoURL: (p.photoURL as string | null) ?? null,
      };
    });
  };

  const teamA = mapPlayers(data.teamA);
  const teamB = mapPlayers(data.teamB);

  if (teamA.length === 0 && teamB.length === 0) return null;

  return {
    teamA,
    teamB,
    generatedAt: data.generatedAt,
  };
}
