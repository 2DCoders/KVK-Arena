import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const CAR_API_URL = `${API_URL}car-service/wash-service`;

export const getCarServices = () => {
    try {
        const response = axios.get(`${CAR_API_URL}`);
        return response;
    } catch (error) {
        throw error;
    }
}