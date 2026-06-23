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
  createdBy: string
): Promise<void> {
  await setDoc(doc(db, "subscriptions", subscriptionId(userId, month)), {
    userId,
    month,
    createdBy,
    createdAt: Timestamp.now(),
  });
}

export async function removeSubscription(
  userId: string,
  month: string
): Promise<void> {
  await deleteDoc(doc(db, "subscriptions", subscriptionId(userId, month)));
}

/**
 * Subscribe to the set of userIds that have an active subscription for a
 * given month. Calls `onChange` with a Set of userIds whenever it changes.
 */
export function listenSubscribers(
  month: string,
  onChange: (subscriberIds: Set<string>) => void
): () => void {
  if (!month) {
    onChange(new Set());
    return () => {};
  }

  const q = query(
    collection(db, "subscriptions"),
    where("month", "==", month)
  );

  return onSnapshot(q, (snapshot) => {
    const ids = new Set<string>();
    snapshot.docs.forEach((docSnap) => {
      const userId = docSnap.data().userId as string | undefined;
      if (userId) ids.add(userId);
    });
    onChange(ids);
  });
}
