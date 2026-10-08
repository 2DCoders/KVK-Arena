import {getEnv} from "../env";
import axios from "axios";

const API_BASE_URL = getEnv().API_URL + "payments";

export const createPayment = async (body: any) => {
    try{
        const response = await axios.post(API_BASE_URL + "/create", body);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const reversePayment = async (body: any) => {
    try{
        const response = await axios.post(API_BASE_URL + "/reverse", body);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getPaymentStatus = async (orderId: string, memberId: string) => {
    const response = await axios.get(`${API_BASE_URL}/status/${encodeURIComponent(orderId)}`, {
        params: { memberId },
        timeout: 10000,
    });
    return response.data;
};
