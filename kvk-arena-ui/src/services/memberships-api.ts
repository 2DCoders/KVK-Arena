import {getEnv} from "../env";
import axios from "axios";

const API_BASE_URL = getEnv().API_URL + "gym/membership-plans";

export const getMembershipPlans = async () => {
    try{
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        throw error;
    }
}