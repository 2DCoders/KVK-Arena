import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const BOOKING_API_URL = `${API_URL}badminton/bookings/`;

const getToken = () => {
  const cashier = localStorage.getItem("cashier")
    ? JSON.parse(localStorage.getItem("cashier") as string)
    : null;

  return cashier ? cashier.token : null;
};

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const bookingSlots = async (bookingData: any) => {
    try {
        const response = await axios.post(`${BOOKING_API_URL}multi-hold`, bookingData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const confirmBooking = async (customerData: any) => {
    try {
        const response = await axios.post(`${BOOKING_API_URL}confirm-multi`, customerData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const createBadmintonMultiPayment = async (body: {
    holdIds: string[];
    customerName: string;
    phoneNumber: string;
}) => {
    try {
        const response = await axios.post(`${BOOKING_API_URL}create-multi`, body, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}