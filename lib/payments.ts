import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type PaymentStatus = "unpaid" | "paid";

export type PaymentMap = Record<string, PaymentStatus>;

/** Whether a given user has been marked as paid for an event. */
export function isPaid(payments: PaymentMap, userId: string): boolean {
  return payments[userId] === "paid";
}

/**
 * Persist a player's payment status on the event document's `payments` map.
 * Removing the entry (unpaid) keeps the map clean.
 */
export async function setPaymentStatus(
  eventId: string,
  currentPayments: PaymentMap,
  userId: string,
  paid: boolean
): Promise<void> {
  const next: PaymentMap = { ...currentPayments };
  if (paid) {
    next[userId] = "paid";
  } else {
    delete next[userId];
  }
  await updateDoc(doc(db, "events", eventId), { payments: next });
}
