import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const GAME_API_URL = `${API_URL}gaming-m/games`;

export const getGames = async () => {
  try {
    const response = await axios.get(GAME_API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};
