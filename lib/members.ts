import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
