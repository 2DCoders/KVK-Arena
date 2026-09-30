import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const BOOKINGS_API_URL = `${API_URL}saloon/bookings`;

export const checkDayAvailability = async (
  date: string,
  serviceIds: string[],
) => {
  try {
    const params = new URLSearchParams();
    params.append("Date", date);
    serviceIds.forEach((id) => params.append("SaloonServiceIds", id));

    const response = await axios.get(
      `${BOOKINGS_API_URL}/day-availability?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createSalonBooking = async (payload: any) => {
  try {
    const response = await axios.post(`${BOOKINGS_API_URL}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
