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
  console.log("[PayHere] startPayHereCheckout called with:", details);

  if (!window.payhere) {
    console.error("[PayHere] window.payhere is not defined — the SDK script has not loaded.");
    callbacks.onError("PayHere is not available. Please refresh and try again.");
    return;
  }

  const missingFields = (
    ["orderId", "merchantId", "currency", "amount", "hash"] as const
  ).filter((key) => !details[key]);

  if (missingFields.length > 0) {
    console.error("[PayHere] Missing required checkout fields:", missingFields, details);
    callbacks.onError(`Payment could not be started (missing: ${missingFields.join(", ")}).`);
    return;
  }

  window.payhere.onCompleted = (orderId: string) => {
    console.log("[PayHere] onCompleted:", orderId);
    callbacks.onCompleted(orderId);
  };

  window.payhere.onDismissed = () => {
    console.log("[PayHere] onDismissed");
    callbacks.onDismissed();
  };

  window.payhere.onError = (error: any) => {
    console.error("[PayHere] onError:", error);
    callbacks.onError(error);
  };

  // PayHere requires both first_name and last_name to be non-empty. If only a
  // single full name was supplied, split it so last_name is never blank.
  const nameParts = details.firstName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "Customer";
  const lastName = details.lastName?.trim() || nameParts.slice(1).join(" ") || "Customer";

  const paymentDetails = {
    sandbox: true,

    merchant_id: details.merchantId,
    order_id: details.orderId,
    currency: details.currency,
    amount: details.amount,
    hash: details.hash,

    items: details.items,

    first_name: firstName,
    last_name: lastName,
    email: details.email ?? "guest@kvkarena.lk",
    phone: details.phone,

    address: "N/A",
    city: "Colombo",
    country: "Sri Lanka",

    return_url: `${getEnv().BASE_URL}success`,
    cancel_url: `${getEnv().BASE_URL}cancel`,
    notify_url: `${getEnv().API_URL}${details.notifyPath}`,
  };

  console.log("[PayHere] Calling window.payhere.startPayment with:", paymentDetails);

  try {
    window.payhere.startPayment(paymentDetails);
  } catch (error) {
    console.error("[PayHere] startPayment threw synchronously:", error);
    callbacks.onError(error);
  }
};
