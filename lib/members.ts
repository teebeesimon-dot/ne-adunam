import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SPORT_LABELS } from "@/lib/labels";
import type { Sport } from "@/lib/types";

export type GroupType = "series" | "event";

export interface Member {
  id: string;
  groupId: string;
  groupType: GroupType;
  /** Owner of the series/event — used to scope removal permissions. */
  ownerId: string;
  userId: string;
  userName: string;
  userPhoto: string | null;
  joinedAt: unknown;
}

/** Map of userId -> Member for quick lookup alongside payments/attendance. */
export type MemberMap = Record<string, Member>;

/** Deterministic membership id so each user appears once per group. */
function memberId(groupId: string, userId: string): string {
  return `${groupId}_${userId}`;
}

/**
 * Resolve the group a given event belongs to. Series occurrences share the
 * series roster; standalone events keep their own roster.
 */
export function resolveGroup(event: {
  id: string;
  seriesId?: string;
  ownerId: string;
}): { groupId: string; groupType: GroupType } {
  if (event.seriesId) {
    return { groupId: event.seriesId, groupType: "series" };
  }
  return { groupId: event.id, groupType: "event" };
}

/** Join a group as the current user (anyone signed in with the link). */
export async function joinGroup(params: {
  groupId: string;
  groupType: GroupType;
  ownerId: string;
  userId: string;
  userName: string;
  userPhoto: string | null;
}): Promise<void> {
  const ref = doc(db, "members", memberId(params.groupId, params.userId));
  await setDoc(
    ref,
    {
      groupId: params.groupId,
      groupType: params.groupType,
      ownerId: params.ownerId,
      userId: params.userId,
      userName: params.userName,
      userPhoto: params.userPhoto,
      joinedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

/**
 * Add an existing site user to a group on their behalf. Used by the group
 * owner / super admin from the admin panel or the group page. Same write as
 * `joinGroup`; Firestore rules enforce that the caller is owner/super admin.
 */
export async function addMember(params: {
  groupId: string;
  groupType: GroupType;
  ownerId: string;
  userId: string;
  userName: string;
  userPhoto: string | null;
}): Promise<void> {
  await joinGroup(params);
}

/** One-time fetch of the set of userIds already in a group. */
export async function getGroupMemberIds(groupId: string): Promise<Set<string>> {
  if (!groupId) return new Set();
  const q = query(collection(db, "members"), where("groupId", "==", groupId));
  const snap = await getDocs(q);
  return new Set(snap.docs.map((d) => (d.data() as { userId: string }).userId));
}

/** A selectable group for the admin panel (series or standalone event). */
export interface AdminGroup {
  groupId: string;
  groupType: GroupType;
  ownerId: string;
  label: string;
  sport: string;
  /** Empty for series; formatted date (RO) for standalone events. */
  dateLabel: string;
}

/** Format an ISO date string (yyyy-mm-dd) as a short Romanian label. */
function formatRoDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Romanian sport label, falling back to the raw value. */
function sportLabel(sport: unknown): string {
  if (typeof sport !== "string") return "—";
  return SPORT_LABELS[sport as Sport] ?? sport;
}

/**
 * List every group (all series + standalone events) for the admin picker.
 * Requires super-admin list permission on series/events (see Firestore rules).
 * Series occurrences are skipped — they share their series roster.
 */
export async function getAllGroupsForAdmin(): Promise<AdminGroup[]> {
  const [seriesSnap, eventsSnap] = await Promise.all([
    getDocs(collection(db, "series")),
    getDocs(collection(db, "events")),
  ]);

  const groups: AdminGroup[] = [];

  seriesSnap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    groups.push({
      groupId: d.id,
      groupType: "series",
      ownerId: (data.ownerId as string) ?? "",
      label: (data.title as string) ?? "Serie",
      sport: sportLabel(data.sport),
      dateLabel: "",
    });
  });

  eventsSnap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    if (data.seriesId) return; // occurrences belong to their series group
    groups.push({
      groupId: d.id,
      groupType: "event",
      ownerId: (data.ownerId as string) ?? "",
      label: (data.title as string) ?? "Eveniment",
      sport: sportLabel(data.sport),
      dateLabel: data.date ? formatRoDate(data.date as string) : "",
    });
  });

  return groups.sort((a, b) => a.label.localeCompare(b.label, "ro"));
}

/**
 * Remove a member from a group. Used both for self-leave and for
 * organizer/admin removal — Firestore rules enforce who is allowed.
 */
export async function removeMember(
  groupId: string,
  userId: string
): Promise<void> {
  await deleteDoc(doc(db, "members", memberId(groupId, userId)));
}

/**
 * Subscribe to the roster of a group. Calls `onChange` with members sorted by
 * join time whenever the roster changes. Transient permission errors (e.g.
 * before auth attaches) yield an empty list instead of throwing.
 */
export function subscribeToGroupMembers(
  groupId: string,
  onChange: (members: Member[]) => void
): () => void {
  if (!groupId) {
    onChange([]);
    return () => {};
  }

  const q = query(collection(db, "members"), where("groupId", "==", groupId));

  return onSnapshot(
    q,
    (snapshot) => {
      const members = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Member, "id">),
      }));
      members.sort((a, b) => {
        const ta = (a.joinedAt as Timestamp | undefined)?.toMillis?.() ?? 0;
        const tb = (b.joinedAt as Timestamp | undefined)?.toMillis?.() ?? 0;
        return ta - tb;
      });
      onChange(members);
    },
    () => onChange([])
  );
}
