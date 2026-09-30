import { getEnv } from "@/env";

export type PayHereCheckoutDetails = {
  orderId: string;
  merchantId: string;
  currency: string;
  amount: string;
  hash: string;
  items: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  notifyPath: string;
};

export type PayHereCallbacks = {
  onCompleted: (orderId: string) => void;
  onDismissed: () => void;
  onError: (error: any) => void;
};

export const startPayHereCheckout = (
  details: PayHereCheckoutDetails,
  callbacks: PayHereCallbacks,
) => {
  if (!window.payhere) {
    callbacks.onError("PayHere is not available. Please refresh and try again.");
    return;
  }

  window.payhere.onCompleted = callbacks.onCompleted;
  window.payhere.onDismissed = callbacks.onDismissed;
  window.payhere.onError = callbacks.onError;

  window.payhere.startPayment({
    sandbox: true,

    merchant_id: details.merchantId,
    order_id: details.orderId,
    currency: details.currency,
    amount: details.amount,
    hash: details.hash,

    items: details.items,

    first_name: details.firstName,
    last_name: details.lastName ?? "",
    email: details.email ?? "guest@kvkarena.lk",
    phone: details.phone,

    address: "N/A",
    city: "Colombo",
    country: "Sri Lanka",

    return_url: `${getEnv().BASE_URL}success`,
    cancel_url: `${getEnv().BASE_URL}cancel`,
    notify_url: `${getEnv().API_URL}${details.notifyPath}`,
  });
};
