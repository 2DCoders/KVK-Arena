import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const CAR_API_URL = `${API_URL}car-service/wash-service`;
const CAR_PKG_API_URL = `${API_URL}car-service/package`;

export const getCarServices = () => {
    try {
        const response = axios.get(`${CAR_API_URL}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getCarPackages = () => {
    try {
        const response = axios.get(`${CAR_PKG_API_URL}`);
        return response;
    } catch (error) {
        throw error;
    }
}