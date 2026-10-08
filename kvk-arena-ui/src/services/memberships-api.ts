import {getEnv} from "../env";
import axios from "axios";

const API_BASE_URL = getEnv().API_URL + "gym/membership-plans";

export const getMembershipPlans = async () => {
    try{
        const response = await axios.get(API_BASE_URL, { params: { activeOnly: true } });
        return {
            ...response.data,
            additionalData: {
                ...response.data.additionalData,
                response: response.data.additionalData.response.filter(
                    (plan: { title?: string }) => plan.title?.trim().toLowerCase() !== "day pass",
                ),
            },
        };
    } catch (error) {
        throw error;
    }
}
