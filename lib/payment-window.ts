import "server-only";
import { isAssurBemlacha, Location } from "@hebcal/core";

const MARGIN_MINUTES = 30;
const STEP_MINUTES = 5;
const MAX_SEARCH_MINUTES = 5 * 24 * 60;
const NETANYA = new Location(
  32.3215,
  34.8532,
  true,
  "Asia/Jerusalem",
  "Netanya",
  "IL",
);

function shifted(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

export function paymentOperationIsBlocked(at = new Date()) {
  return [-MARGIN_MINUTES, 0, MARGIN_MINUTES].some((minutes) =>
    isAssurBemlacha(shifted(at, minutes), NETANYA, false),
  );
}

export function paymentWindowStatus(at = new Date()) {
  const blocked = paymentOperationIsBlocked(at);
  if (!blocked) return { blocked: false as const, nextAllowedAt: null };

  for (let minutes = STEP_MINUTES; minutes <= MAX_SEARCH_MINUTES; minutes += STEP_MINUTES) {
    const candidate = shifted(at, minutes);
    if (!paymentOperationIsBlocked(candidate)) {
      return { blocked: true as const, nextAllowedAt: candidate.toISOString() };
    }
  }

  return { blocked: true as const, nextAllowedAt: null };
}

export const PAYMENT_WINDOW_MARGIN_MINUTES = MARGIN_MINUTES;
