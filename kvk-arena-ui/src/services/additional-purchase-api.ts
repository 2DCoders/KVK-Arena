import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const ADDITIONAL_PURCHASES_API_URL = `${API_URL}gaming-m/additional-purchases`;

export const getAdditionalPurchasesByCategory = async (categoryId: string) => {
  try {
    const response = await axios.get(`${ADDITIONAL_PURCHASES_API_URL}/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
