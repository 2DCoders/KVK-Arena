import {getEnv} from "../env";
import axios from "axios";

const API_BASE_URL = getEnv().API_URL + "payments/create";

export const createPayment = async (body: any) => {
    try{
        const response = await axios.post(API_BASE_URL, body);
        return response.data;
    } catch (error) {
        throw error;
    }
}