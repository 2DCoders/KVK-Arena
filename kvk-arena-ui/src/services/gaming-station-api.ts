import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const GAMING_STATIONS_API_URL = `${API_URL}gaming-m/gaming-stations`;

export const getGamingStationsByCategory = async (categoryId: string) => {
  try {
    const response = await axios.get(`${GAMING_STATIONS_API_URL}/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
