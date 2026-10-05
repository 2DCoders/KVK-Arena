import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const SALON_SERVICE_API_URL = `${API_URL}saloon/service-items`;

export type SalonServiceItemResponse = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  bufferMinutes: number;
  isActive: boolean;
  image?: string | null;
};

export const getSalonServiceItems = () =>
  axios.get<SalonServiceItemResponse[]>(SALON_SERVICE_API_URL);
