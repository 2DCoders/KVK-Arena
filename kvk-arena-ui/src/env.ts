// src/env.ts
export const getEnv = () => {
  const env = (window as any).env;
  return {
    API_URL: env?.API_URL ?? "",
    BASE_URL: env?.BASE_URL ?? "",
    OFFER_END_DATE: env?.OFFER_END_DATE ?? "",
    MEMBERSHIP_PRICE: env?.MEMBERSHIP_PRICE ?? 0,
    GYM_RATE: env?.GYM_RATE ?? 0,
    BADMINTON_RATE: env?.BADMINTON_RATE ?? 0,
    CARWASH_RATE: env?.CARWASH_RATE ?? 0,
    GAMING_RATE: env?.GAMING_RATE ?? 0,
    CAFE_RATE: env?.CAFE_RATE ?? 0,
  };
};
