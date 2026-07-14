import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const FEEDBACK_API_URL = `${API_URL}identity/customer-feedback`;

export const sendFeedback = async (body: any) => {
    try {
        const response = await axios.post(`${FEEDBACK_API_URL}`, body);
        return response.data;
    } catch (error) {
        throw error;
    }
}