import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const MEMBER_API_URL = `${API_URL}identity/members/`;

export const registerMember = async (memberData: FormData) => {
    try {
        const res = await axios.post(`${MEMBER_API_URL}register`, memberData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res;
    } catch (error) {
        throw error;
    }
}