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

/** userId -> true for users with an active subscription in a given month. */
export type SubscriptionMap = Record<string, true>;

/** ISO date (YYYY-MM-DD) -> month key (YYYY-MM). */
export function monthKeyFromDate(isoDate: string): string {
  return (isoDate || "").slice(0, 7);
}

/** Human-readable Romanian month label, e.g. "iunie 2026". */
export function monthLabel(monthKey: string): string {
  if (!monthKey) return "";
  const date = new Date(`${monthKey}-01T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Monthly subscriptions are stored one document per user+month, with a
 * deterministic id `{userId}_{YYYY-MM}` so they are easy to toggle and look up.
 */
function subscriptionId(userId: string, month: string): string {
  return `${userId}_${month}`;
}

export async function setSubscription(
  userId: string,
  month: string,
  subscribed: boolean,
  meta: { createdBy: string; userName?: string }
): Promise<void> {
  const ref = doc(db, "subscriptions", subscriptionId(userId, month));
  if (subscribed) {
    await setDoc(ref, {
      userId,
      month,
      userName: meta.userName ?? "",
      createdBy: meta.createdBy,
      createdAt: Timestamp.now(),
    });
  } else {
    await deleteDoc(ref);
  }
}

/**
 * Subscribe to the map of userIds that have an active subscription for a
 * given month. Calls `onChange` with a { userId: true } map whenever it changes.
 */
export function subscribeToMonthSubscriptions(
  month: string,
  onChange: (subscriptions: SubscriptionMap) => void
): () => void {
  if (!month) {
    onChange({});
    return () => {};
  }

  const q = query(
    collection(db, "subscriptions"),
    where("month", "==", month)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const map: SubscriptionMap = {};
      snapshot.docs.forEach((docSnap) => {
        const userId = docSnap.data().userId as string | undefined;
        if (userId) map[userId] = true;
      });
      onChange(map);
    },
    // Swallow transient errors (e.g. permission-denied before auth attaches).
    () => onChange({})
  );
}
