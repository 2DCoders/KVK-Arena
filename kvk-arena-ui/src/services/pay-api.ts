import {getEnv} from "../env";
import axios from "axios";

const API_BASE_URL = getEnv().API_URL + "payments";

export const rememberGymCheckoutLogin = (memberId: string, token: string) =>
    sessionStorage.setItem(`gymCheckoutToken:${memberId}`, token);

export const forgetGymCheckoutLogin = (memberId: string) =>
    sessionStorage.removeItem(`gymCheckoutToken:${memberId}`);

function paymentAuth(memberId: string) {
    const memberToken = localStorage.getItem("memberId") === memberId ? localStorage.getItem("memberToken") : null;
    const token = sessionStorage.getItem(`gymCheckoutToken:${memberId}`) || memberToken;
    if (!token) throw new Error("Sign in to your Gym account to continue with payment.");
    return { headers: { Authorization: `Bearer ${token}` } };
}

export const createPayment = async (body: { memberId: string; membershipPlanId: string; amount: number }) => {
    try{
        const response = await axios.post(API_BASE_URL + "/create", body, paymentAuth(body.memberId));
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const reversePayment = async (body: { memberId: string; membershipPlanId: string; orderId: string }) => {
    try{
        const response = await axios.post(API_BASE_URL + "/reverse", body, paymentAuth(body.memberId));
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getPaymentStatus = async (orderId: string, memberId: string) => {
    const response = await axios.get(`${API_BASE_URL}/status/${encodeURIComponent(orderId)}`, {
        params: { memberId },
        ...paymentAuth(memberId),
        timeout: 10000,
    });
    return response.data;
};
