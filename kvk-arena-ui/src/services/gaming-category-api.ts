import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const GAMING_CATEGORIES_API_URL = `${API_URL}gaming-m/gaming-categories`;

export const getGamingCategories = async (isActive: boolean = true) => {
  try {
    const response = await axios.get(GAMING_CATEGORIES_API_URL, {
      params: { IsActive: isActive },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGamingCategoryById = async (categoryId: string) => {
  try {
    const response = await axios.get(`${GAMING_CATEGORIES_API_URL}/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
