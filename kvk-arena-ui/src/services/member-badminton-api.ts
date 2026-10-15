import axios from "axios";
import { getEnv } from "@/env";

export type MemberCourt = { id: string; name: string };
export type MemberSlot = { courtId: string; slotId: string; startTime: string; endTime: string; price: number };
export type BookingSchedule = { startDate: string; weeks: number; slotIds: string[]; daysOfWeek: string[] };
export type BookingSetup = { court: MemberCourt; slots: MemberSlot[]; maximumWeeks: number };
export type AvailabilityQuote = { isAvailable: boolean; originalAmount: number; endDate: string; bookingCount: number; unavailableSchedules: { date: string; slotId: string; slotName: string; message: string }[] };
export type BookingHold = { holdToken: string; expiresInSeconds: number; originalAmount: number; endDate: string; bookingCount: number };
export type CouponQuote = { originalAmount: number; discountAmount: number; finalAmount: number };
export type BookingConfirmation = { succeeded: boolean; finalAmount: number; bookings: { bookingNumber: string; bookingDate: string; bookingAmount: number }[] };
export type MemberBookingRequest = { holdToken: string; customerName: string; phoneNumber: string; couponCode: string; email: string };
const endpoint = (path: string) => `${getEnv().API_URL.replace(/\/?$/, "/")}member-badminton-bookings/${path}`;
export async function getMemberBookingSetup(signal?: AbortSignal) {
  return (await axios.get<BookingSetup>(endpoint("setup"), { signal })).data;
}
export async function checkMemberBooking(schedule: BookingSchedule) {
  return (await axios.post<AvailabilityQuote>(endpoint("check-availability"), schedule)).data;
}
export async function holdMemberBooking(schedule: BookingSchedule) {
  return (await axios.post<BookingHold>(endpoint("hold"), schedule)).data;
}
export async function checkAndHoldMemberBooking(schedule: BookingSchedule) {
  const availability = await checkMemberBooking(schedule);
  const hold = availability.isAvailable ? await holdMemberBooking(schedule) : null;
  return { availability, hold };
}
export async function quoteMemberCoupon(holdToken: string, couponCode: string) {
  return (await axios.post<CouponQuote>(endpoint("coupon"), { holdToken, couponCode })).data;
}
export async function releaseMemberHold(token: string) {
  await axios.delete(endpoint(`hold/${encodeURIComponent(token)}`), { timeout: 10000 });
}
export type MemberPayment = { orderId: string; merchantId: string; currency: string; amount: string; hash: string; sandbox: boolean; expiresInSeconds: number; confirmation?: BookingConfirmation };
export type MemberPaymentStatus = { status: "pending" | "confirmed" | "failed" | "review" | "expired" | "not_started" | "reversed" | "paid"; confirmation?: BookingConfirmation };
export async function reverseMemberPayment(holdToken: string, orderId?: string) {
  return (await axios.post<MemberPaymentStatus>(endpoint("payment/reverse"), { holdToken, orderId }, { timeout: 10000 })).data;
}
export async function createMemberPayment(request: MemberBookingRequest) {
  return (await axios.post<MemberPayment>(endpoint("payment"), request, { timeout: 10000 })).data;
}
export async function getMemberPaymentStatus(token: string) {
  return (await axios.get<MemberPaymentStatus>(endpoint(`payment-status/${encodeURIComponent(token)}`), { timeout: 10000 })).data;
}
export function bookingError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    return (typeof data === "string" && data.length < 250 ? data : data?.message || data?.title || data?.error) || "Unable to connect. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
