// src/env.ts
export const getEnv = () => {
  const env = (window as any).env;
  return {
    API_URL: env?.API_URL ?? "",
    BASE_URL: env?.BASE_URL ?? "",
    OFFER_END_DATE: env?.OFFER_END_DATE ?? "",
  };
};
