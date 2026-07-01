import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const COURT_SLOT_API_URL = `${API_URL}badminton/court-slot-configurations/`;

export const getCourtSlotsAvailability = async (courtId: string, date: string) => {
    try {
        const response = await axios.get(`${COURT_SLOT_API_URL}availability-by-court?courtId=${courtId}&date=${date}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}