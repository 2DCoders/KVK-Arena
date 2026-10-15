import axios from "axios";
import { getEnv } from "@/env";

export type MemberCourt = { id: string; name: string; pricePerSlot?: number };
export type MemberSlot = { courtId: string; slotId: string; startTime: string; endTime: string; price: number };
export type BookingSchedule = { courtId: string; startDate: string; numberOfSlots: number; slotIds: string[]; daysOfWeek: string[] };
export type AvailabilityQuote = {
  isAvailable: boolean;
  durationInWeeks: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  unavailableSchedules: { dayOfWeek?: string; slotId?: string; slotName?: string; message: string }[];
};
export type MemberBookingRequest = BookingSchedule & {
  memberId: string; couponCode: string; paymentType: 1 | 2; isHalfPayment: boolean; amount: number;
};

const headers = () => {
  const token = localStorage.getItem("memberToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
const endpoint = (path: string) => `${getEnv().API_URL.replace(/\/?$/, "/")}${path}`;

export async function getMemberCourtSlots(courtId: string, signal?: AbortSignal) {
  const { data } = await axios.get<MemberSlot[]>(endpoint(`member-badminton-bookings/courts/${encodeURIComponent(courtId)}/slots`), { headers: headers(), signal });
  return data;
}

export async function checkMemberBooking(schedule: BookingSchedule, memberId: string, couponCode: string) {
  const { data } = await axios.post<AvailabilityQuote>(endpoint("member-badminton-bookings/check-availability"), schedule, {
    headers: headers(), params: { memberId, couponCode: couponCode || undefined },
  });
  return data;
}

export async function createMemberBooking(request: MemberBookingRequest) {
  const body = new FormData();
  body.append("CourtId", request.courtId);
  body.append("StartDate", request.startDate);
  body.append("NumberOfSlots", String(request.numberOfSlots));
  request.slotIds.forEach(id => body.append("SlotIds", id));
  request.daysOfWeek.forEach(day => body.append("DaysOfWeek", day));
  body.append("MemberId", request.memberId);
  body.append("CouponCode", request.couponCode);
  body.append("PaymentType", String(request.paymentType));
  body.append("IsHalfPayment", String(request.isHalfPayment));
  body.append("Amount", String(request.amount));
  const { data } = await axios.post(endpoint("member-badminton-bookings/"), body, { headers: headers() });
  if (data?.succeeded !== true) {
    throw new Error(data?.message || "Your booking could not be confirmed. Please contact KVK Arena before retrying.");
  }
  return data;
}

export function bookingError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401 || error.response?.status === 403) return "Member access could not be verified. Please contact KVK Arena for assistance.";
    const data = error.response?.data;
    return (typeof data === "string" && data.length < 250 ? data : data?.message || data?.title || data?.error) || "Unable to connect. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

