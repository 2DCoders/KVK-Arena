import {getEnv} from "../env";
import axios from "axios";

const API_BASE_URL = getEnv().API_URL + "gym/trainers";

export const createRequest = async (data: FormData, token: string) => {
    try {
        const response = await axios.post(API_BASE_URL, data, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
    } catch (error) {
        throw error;
    }    
};

export const getRequestById = async (id: string, token: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
    } catch (error) {
        throw error;
    }
}