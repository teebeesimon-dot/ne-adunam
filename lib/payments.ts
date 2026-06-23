export type PaymentStatus = "unpaid" | "paid";

/** Returns the YYYY-MM month key for a given ISO date string (YYYY-MM-DD). */
export function getMonthKey(isoDate: string): string {
  return (isoDate || "").slice(0, 7);
}

/** Human-readable Romanian month label, e.g. "iunie 2026". */
export function formatMonthLabel(isoDate: string): string {
  const month = getMonthKey(isoDate);
  if (!month) return "";
  const date = new Date(`${month}-01T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });
}

/**
 * How a confirmed player's cost is covered for a given event.
 * - "subscription": covered by a monthly subscription
 * - "paid": marked paid by the organizer for this event
 * - "unpaid": still owes the per-player amount
 */
export type CoverageStatus = PaymentStatus | "subscription";

export function resolveCoverage(
  hasSubscription: boolean,
  paymentStatus: PaymentStatus | undefined
): CoverageStatus {
  if (hasSubscription) return "subscription";
  return paymentStatus === "paid" ? "paid" : "unpaid";
}

export const COVERAGE_LABEL: Record<CoverageStatus, string> = {
  paid: "Plătit",
  unpaid: "Neplătit",
  subscription: "Abonament",
};
