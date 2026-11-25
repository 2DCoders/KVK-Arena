import {getEnv} from "../env";
import axios from "axios";

const API_BASE_URL = getEnv().API_URL + "gym/membership-plans";

type MembershipPlan = { title?: string; createdAt?: string | null };

const creationTime = (plan: MembershipPlan) => {
    const timestamp = Date.parse(plan.createdAt ?? "");
    return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
};

export const getMembershipFeatures = (features?: string | string[] | null): string[] => {
    const items = typeof features === "string" ? features.split(/(?<!\d),|,(?!\d)/) : features ?? [];
    return items.map((item) => item.trim()).filter(Boolean);
};

export const getMembershipPlans = async () => {
    const env = getEnv();
    if (env.IS_PROMOTION) {
        return { additionalData: { response: env.PROMOTION_MEMBERSHIP_PLANS } };
    }

    const { data } = await axios.get(API_BASE_URL, { params: { activeOnly: true } });
    return {
        ...data,
        additionalData: {
            ...data.additionalData,
            response: (data.additionalData.response as MembershipPlan[])
                .filter((plan) => plan.title?.trim().toLowerCase() !== "day pass")
                .sort((first, second) => creationTime(first) - creationTime(second)),
        },
    };
};
