window.env = {
  API_URL: "https://api-kvkarena.premiumasp.net/api/",
  // API_URL: "https://klc.runasp.net/api/",
  // API_URL: "https://localhost:7007/api/",
  BASE_URL: "https://kvkarena.lk/",
  // Member badminton booking start date (YYYY-MM-DD). Leave empty until set.
  BADMINTON_BOOKING_START_DATE: "2026-12-02",
  BADMINTON_BANK_NAME: "Hatton National Bank",
  BADMINTON_ACCOUNT_OWNER_NAME: "M/S. KVK ARENA (PVT) LTD",
  BADMINTON_ACCOUNT_NUMBER: "096010224044",
  BADMINTON_BRANCH_NAME: "Colombo 13",
  BADMINTON_PAYMENT_INSTRUCTIONS: "", // Approved bank transfer instructions shown on the tracking page.
  MAXIMUM_DISCOUNTABLE_SLOTS: 10, // The API enforces its configured upper limit.
  BOOKING_DURATION: "12", //weeks
  COUPON_CODE_ID: "b025087f-c79b-4eea-8945-566226168557",
  // true = coming-soon page; false = full module page. Refresh after changing.
  GYM_COMING_SOON: false,
  BADMINTON_COMING_SOON: false,
  GAMING_COMING_SOON: false,
  CARWASH_COMING_SOON: false,
  CAFE_COMING_SOON: true,
  SALON_COMING_SOON: true,

  IS_CARWASH_PACKAGES_ENABLED: false, // true = carwash packages enabled; false = disabled. Refresh after changing.
  IS_PAYMENT_GATEWAY_ENABLED: false, // true = payment gateway enabled; false = disabled. Refresh after changing.
  IS_PROMOTION: true, // true = use the plans below; false = load plans from the API.
  // Keep IDs and prices aligned with the Gym API used by this deployment for signup and payment.
  PROMOTION_MEMBERSHIP_PLANS: [
    {
      id: "7e9a5333-b445-4365-9148-1c34f4e16ada",
      title: "Monthly",
      price: 14990,
      discountedPrice: 11990,
      durationInDays: 30,
      isActive: 1,
      description: "Enjoy a flexible one-month membership with exclusive member benefits. Ideal for customers who want to experience our services without a long-term commitment.",
      features: [
        "30-day membership access",
        "Exclusive member benefits",
        "Access to member-only offers",
        "Flexible monthly renewal",
        "No long-term commitment",
      ],
    },
    {
      id: "6920ef7f-2347-4918-8ee9-f4b878ee86b4",
      title: "Semi-Annual",
      price: 79990,
      discountedPrice: 69990,
      durationInDays: 180,
      isActive: 1,
      description: "Enjoy six months of membership benefits at a reduced overall cost. Perfect for regular customers looking for greater value and long-term convenience.",
      features: [
        "6 months membership access",
        "Exclusive member benefits",
        "Access to member-only offers",
        "Save Rs. 9,950 compared to monthly membership",
        "Convenient six-month renewal",
      ],
    },
    {
      id: "ead02d25-16de-4cb5-a13b-82fc9c902f25",
      title: "Annual",
      price: 149990,
      discountedPrice: 129990,
      durationInDays: 365,
      isActive: 1,
      description: "Unlock a full year of membership benefits with our best-value membership package. Designed for loyal customers who want maximum savings and year-round convenience.",
      features: [
        "365-day membership access",
        "Exclusive member benefits",
        "Access to member-only offers",
        "Save Rs. 29,890 compared to monthly membership",
        "Convenient annual renewal",
      ],
    },
  ],
};
