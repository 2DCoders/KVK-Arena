import axios from "axios";
import { getEnv } from "@/env";

const { API_URL } = getEnv();
const CAFE_API_URL = `${API_URL}cafe/menu/`;

export type CafeMenuResponse = {
    id: string;
    name: string;
    image?: string | null;
    category: number;
    price: number;
    description?: string | null;
    isActive: boolean;
    facts?: string | null;
    ingredients?: string | null;
    preparationTimeInMinutes: number;
    portionSize: number;
};

export const getCafeMenu = (category: number) =>
    axios.get<CafeMenuResponse[]>(`${CAFE_API_URL}category/${category}`);