export type GymPaymentStatus = {
  orderId: string;
  paymentStatus: number;
  startDate?: string | null;
  endDate?: string | null;
};

// Browser checkout completion alone cannot confirm payment. Read the signed
// server notification's persisted result, allowing time for callback delivery.
export async function waitForGymPayment(
  readStatus: () => Promise<GymPaymentStatus>,
  attempts = 15,
  pause: () => Promise<void> = () => new Promise((resolve) => setTimeout(resolve, 2000)),
): Promise<GymPaymentStatus> {
  let latest: GymPaymentStatus | undefined;
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      latest = await readStatus();
      if (latest.paymentStatus !== 1) return latest;
    } catch (error) { lastError = error; }
    if (attempt + 1 < attempts) await pause();
  }
  if (latest) return latest;
  throw lastError ?? new Error("Unable to check payment confirmation");
}
