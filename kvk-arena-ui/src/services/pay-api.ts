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