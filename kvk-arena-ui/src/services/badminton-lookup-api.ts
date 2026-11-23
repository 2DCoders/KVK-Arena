import axios from "axios";
import { getEnv } from "@/env";

export type TrackedBadmintonBooking = {
  bookingNumber: string;
  bookingDate: string;
  courtName: string;
  startTime: string;
  endTime: string;
  bookingAmount: number;
  status: string;
};

const endpoint = () => `${getEnv().API_URL.replace(/\/?$/, "/")}badminton/booking-lookup`;

export async function sendBadmintonLookupCode(phoneNumber: string) {
  return (await axios.post<{ challengeId: string }>(`${endpoint()}/send-code`, { phoneNumber })).data.challengeId;
}

export async function lookupBadmintonBookings(phoneNumber: string, challengeId: string, code: string) {
  return (await axios.post<TrackedBadmintonBooking[]>(`${endpoint()}/search`, { phoneNumber, challengeId, code })).data;
}

export function badmintonLookupError(error: unknown) {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message;
  }
  return "Booking lookup is temporarily unavailable. Please try again.";
}
