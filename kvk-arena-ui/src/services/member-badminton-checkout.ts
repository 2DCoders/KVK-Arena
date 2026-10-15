import { createMemberPayment, getMemberPaymentStatus, reverseMemberPayment, type BookingConfirmation, type MemberBookingRequest, type BookingHold, type CouponQuote, type BookingSchedule, type MemberPaymentStatus } from "./member-badminton-api";
import { startPayHereCheckout } from "./payhere";

export type ReservationView = { schedule: BookingSchedule; hold: BookingHold; deadline: number; customerName: string; phone: string; email: string; quote: CouponQuote };
export type PendingMemberPayment = { token: string; view: ReservationView };
type Callbacks = {
  onConfirmed: (confirmation: BookingConfirmation) => void;
  onPending: () => void;
  onReversed: () => void;
  onFailed: () => void;
  onExpired: () => void;
  onReview: () => void;
  onError: (error: unknown) => void;
};
const key = "pendingMemberBadmintonPayment";
export function pendingMemberPayment(): PendingMemberPayment | null {
  try { return JSON.parse(sessionStorage.getItem(key) || "null"); } catch { return null; }
}
function clear(token: string) { if (pendingMemberPayment()?.token === token) sessionStorage.removeItem(key); }

export async function waitForMemberPayment(read: () => Promise<MemberPaymentStatus>, attempts = 15,
  pause: () => Promise<void> = () => new Promise(resolve => setTimeout(resolve, 2000))) {
  let result: MemberPaymentStatus | undefined;
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try { result = await read(); if (result.status !== "pending") return result; } catch (error) { lastError = error; }
    if (i + 1 < attempts) await pause();
  }
  if (!result) throw lastError ?? new Error("Payment status could not be checked.");
  return result;
}
async function verify(token: string, callbacks: Callbacks, attempts = 15) {
  try {
    const result = await waitForMemberPayment(() => getMemberPaymentStatus(token), attempts);
    if (result.status === "confirmed" && result.confirmation?.succeeded === true && result.confirmation.bookings?.length) {
      clear(token); callbacks.onConfirmed(result.confirmation);
    } else if (result.status === "reversed") { clear(token); callbacks.onReversed(); }
    else if (result.status === "failed" || result.status === "not_started") { clear(token); callbacks.onFailed(); }
    else if (result.status === "expired") { clear(token); callbacks.onExpired(); }
    else if (result.status === "review") callbacks.onReview();
    else callbacks.onPending();
  } catch (error) { callbacks.onError(error); }
}
export async function resumeMemberPayment(callbacks: Callbacks) {
  const pending = pendingMemberPayment();
  if (pending) await verify(pending.token, callbacks);
}
export async function startMemberCheckout(request: MemberBookingRequest, view: ReservationView, callbacks: Callbacks) {
  if (!window.payhere) throw new Error("PayHere is not loaded. Please refresh and try again.");
  const previous = pendingMemberPayment();
  if (previous) {
    const status = await getMemberPaymentStatus(previous.token);
    if (["expired", "reversed", "failed", "not_started"].includes(status.status)) clear(previous.token);
    else if (status.status === "confirmed" || status.status === "paid" || status.status === "review") {
      await verify(previous.token, callbacks, 1);
      return;
    } else throw new Error("Please check your existing payment before starting another checkout.");
  }
  let payment;
  try {
    payment = await createMemberPayment(request);
    const confirmed = payment.confirmation?.succeeded === true && !!payment.confirmation.bookings?.length;
    if (!confirmed && (!payment.orderId || !payment.hash || !payment.merchantId || !payment.currency || !payment.amount))
      throw new Error("Payment could not be prepared. Please try again.");
  } catch (error) {
    // The gateway has not opened, so this attempt cannot have charged the customer.
    // Cancel any order prepared before a timeout, without creating a local pending lock.
    try {
      const status = await reverseMemberPayment(request.holdToken);
      if (status.status === "paid" || status.status === "review" || status.status === "confirmed") {
        sessionStorage.setItem(key, JSON.stringify({ token: request.holdToken, view }));
        await verify(request.holdToken, callbacks, 1);
        return;
      }
    } catch { /* Keep the controls available when checkout never opened. */ }
    clear(request.holdToken);
    callbacks.onReversed();
    callbacks.onError(error);
    return;
  }
  if (payment.confirmation?.succeeded && payment.confirmation.bookings?.length) { clear(request.holdToken); callbacks.onConfirmed(payment.confirmation); return; }
  if (view.deadline <= Date.now()) {
    try { await reverseMemberPayment(request.holdToken, payment.orderId); } catch { /* No gateway was opened. */ }
    callbacks.onExpired();
    return;
  }
  const pending = { token: request.holdToken, view };
  sessionStorage.setItem(key, JSON.stringify(pending));
  callbacks.onPending();
  let handling = false;
  const check = async (attempts: number) => {
    if (handling) return;
    handling = true;
    try { await verify(request.holdToken, callbacks, attempts); } finally { handling = false; }
  };
  const dismiss = async () => {
    if (handling) return;
    handling = true;
    try {
      const status = await getMemberPaymentStatus(request.holdToken);
      if (status.status === "confirmed" || status.status === "paid" || status.status === "review") {
        await verify(request.holdToken, callbacks, 1);
        return;
      }
      const result = await reverseMemberPayment(request.holdToken, payment.orderId);
      if (result.status === "reversed") { clear(request.holdToken); callbacks.onReversed(); }
      else await verify(request.holdToken, callbacks, 1);
    } catch (error) { callbacks.onError(error); }
    finally { handling = false; }
  };
  try { startPayHereCheckout({
    orderId: payment.orderId, merchantId: payment.merchantId, currency: payment.currency,
    amount: payment.amount, hash: payment.hash, sandbox: payment.sandbox,
    firstName: request.customerName, phone: request.phoneNumber, email: request.email,
    items: "KVK Badminton Court Reservations", notifyPath: "member-badminton-bookings/notify",
  }, {
    onCompleted: () => { void check(15); },
    onDismissed: () => { void dismiss(); },
    onError: error => { void dismiss().then(() => callbacks.onError(error)); },
  }); } catch (error) {
    await dismiss();
    callbacks.onError(error);
  }
}
