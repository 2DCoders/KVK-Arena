import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const COURTS_API_URL = `${API_URL}badminton/courts/`;

export const getCourts = async () => {
  try {
    const response = await axios.get(`${COURTS_API_URL}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};