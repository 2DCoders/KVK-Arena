import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const GAMING_SLOT_GENERATION_API_URL = `${API_URL}gaming-m/gaming-slot-generation`;

export const getGamingSlotAvailability = async (
  stationId: string,
  categoryId: string,
  date: string
) => {
  try {
    const response = await axios.get(`${GAMING_SLOT_GENERATION_API_URL}/availability-by-station-category`, {
      params: { stationId, categoryId, date },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGamingSlotConfigurationByCategory = async (categoryId: string) => {
  try {
    const response = await axios.get(`${GAMING_SLOT_GENERATION_API_URL}/configuration-by-category`, {
      params: { categoryId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
