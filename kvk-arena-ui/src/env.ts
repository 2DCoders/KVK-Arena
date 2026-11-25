// src/env.ts
const comingSoonEnabled = (value: unknown): boolean =>
  value == null ? true : value === true || value === "true";

export const getEnv = () => {
  const env = (window as any).env;
  return {
    API_URL: env?.API_URL ?? "",
    BASE_URL: env?.BASE_URL ?? "",
    BADMINTON_BOOKING_START_DATE: env?.BADMINTON_BOOKING_START_DATE ?? "",
    COUPON_CODE_ID: env?.COUPON_CODE_ID ?? "",
    BADMINTON_BANK_NAME: env?.BADMINTON_BANK_NAME ?? "",
    BADMINTON_ACCOUNT_OWNER_NAME: env?.BADMINTON_ACCOUNT_OWNER_NAME ?? "",
    BADMINTON_ACCOUNT_NUMBER: env?.BADMINTON_ACCOUNT_NUMBER ?? "",
    BADMINTON_BRANCH_NAME: env?.BADMINTON_BRANCH_NAME ?? "",
    BADMINTON_PAYMENT_INSTRUCTIONS: env?.BADMINTON_PAYMENT_INSTRUCTIONS ?? "",
    MAXIMUM_DISCOUNTABLE_SLOTS: env?.MAXIMUM_DISCOUNTABLE_SLOTS ?? 20,
    BOOKING_DURATION: env?.BOOKING_DURATION ?? 0,
    IS_PAYMENT_GATEWAY_ENABLED: env?.IS_PAYMENT_GATEWAY_ENABLED ?? false,
    IS_PROMOTION: env?.IS_PROMOTION === true,
    PROMOTION_MEMBERSHIP_PLANS: env?.PROMOTION_MEMBERSHIP_PLANS ?? [],
    IS_CARWASH_PACKAGES_ENABLED:
      env?.IS_CARWASH_PACKAGES_ENABLED === true || env?.IS_CARWASH_PACKAGES_ENABLED === "true",
    GYM_COMING_SOON: comingSoonEnabled(env?.GYM_COMING_SOON),
    BADMINTON_COMING_SOON: comingSoonEnabled(env?.BADMINTON_COMING_SOON),
    GAMING_COMING_SOON: comingSoonEnabled(env?.GAMING_COMING_SOON),
    CARWASH_COMING_SOON: comingSoonEnabled(env?.CARWASH_COMING_SOON),
    CAFE_COMING_SOON: comingSoonEnabled(env?.CAFE_COMING_SOON),
    SALON_COMING_SOON: comingSoonEnabled(env?.SALON_COMING_SOON),
  };
};
