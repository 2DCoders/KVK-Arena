import {getEnv} from "../env";
import axios from "axios";

const API_BASE_URL = getEnv().API_URL + "gym/members";

export const registerMember = async (memberData: any) => {
    try {
        const response = await axios.post(API_BASE_URL, memberData);
        return response.data;
    } catch (error) {
        throw error;
    }
}