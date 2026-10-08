import { getEnv } from "@/env";
import { createPayment, getPaymentStatus, reversePayment } from "./pay-api";
import { waitForGymPayment } from "./gym-payment-status";

type PendingPayment = { memberId: string; membershipPlanId: string; orderId: string };
type Callbacks = {
  onPaid: () => void;
  onPending: () => void;
  onCancelled: () => void;
  onError: (error: unknown) => void;
};
const storageKey = "pendingMembershipPayment";
export const hasPendingGymPayment = () => !!localStorage.getItem(storageKey);
const clearPending = (orderId: string) => {
  const stored = localStorage.getItem(storageKey);
  if (stored && JSON.parse(stored).orderId === orderId) localStorage.removeItem(storageKey);
};

async function confirmPayment(payment: PendingPayment, callbacks: Callbacks) {
  try {
    const status = await waitForGymPayment(() => getPaymentStatus(payment.orderId, payment.memberId));
    if (status.paymentStatus === 2) {
      clearPending(payment.orderId);
      callbacks.onPaid();
    } else if (status.paymentStatus === 5) {
      clearPending(payment.orderId);
      callbacks.onCancelled();
    } else callbacks.onPending();
  } catch (error) { callbacks.onError(error); }
}

export async function resumeGymPayment(callbacks: Callbacks) {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return;
  // Refreshing must never reverse a payment that may be awaiting notification.
  await confirmPayment(JSON.parse(stored), callbacks);
}

export async function startGymPayment(
  request: { memberId: string; membershipPlanId: string; amount: number },
  customer: { firstName: string; lastName: string; email: string; phone: string },
  callbacks: Callbacks,
) {
  if (!window.payhere) throw new Error("PayHere is not loaded. Please refresh and try again.");
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    const previous: PendingPayment = JSON.parse(stored);
    const status = await getPaymentStatus(previous.orderId, previous.memberId);
    if (status.paymentStatus === 1)
      throw new Error("Your previous payment is awaiting confirmation. Please check its status before paying again.");
    clearPending(previous.orderId);
    if (status.paymentStatus === 2) { callbacks.onPaid(); return; }
  }
  const payment = await createPayment(request);
  const pending: PendingPayment = { ...request, orderId: payment.orderId };
  localStorage.setItem(storageKey, JSON.stringify(pending));
  // Install callbacks only for the checkout being started, rather than having
  // signup and profile modals overwrite one another's global SDK handlers.
  let handling = false;
  window.payhere.onCompleted = async () => {
    if (handling) return;
    handling = true;
    await confirmPayment(pending, callbacks);
  };
  window.payhere.onDismissed = async () => {
    if (handling) return;
    handling = true;
    try {
      await reversePayment(pending);
      await confirmPayment(pending, callbacks);
    } catch (error) { callbacks.onError(error); }
  };
  window.payhere.onError = async (error: unknown) => {
    if (handling) return;
    handling = true;
    try {
      await reversePayment(pending);
      clearPending(pending.orderId);
    } catch { /* Keep the stored order if the server cannot be reached. */ }
    callbacks.onError(error);
  };
  try {
    window.payhere.startPayment({
      sandbox: payment.sandbox ?? true,
      merchant_id: payment.merchantId, order_id: payment.orderId,
      currency: payment.currency, amount: payment.amount, hash: payment.hash,
      items: "Gym Membership", first_name: customer.firstName,
      last_name: customer.lastName || "Customer", email: customer.email,
      phone: customer.phone.length === 9 ? `0${customer.phone}` : customer.phone,
      address: "N/A", city: "Colombo", country: "Sri Lanka",
      return_url: undefined, cancel_url: undefined,
      notify_url: `${getEnv().API_URL.replace(/\/?$/, "/")}payments/notify`,
    });
  } catch (error) {
    await window.payhere.onError(error);
  }
}
