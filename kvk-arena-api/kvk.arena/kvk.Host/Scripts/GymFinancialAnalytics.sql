DROP MATERIALIZED VIEW IF EXISTS gym."MemberFinancialAnalyticsDaily";

CREATE MATERIALIZED VIEW IF NOT EXISTS gym."MemberFinancialAnalyticsDaily"
AS
SELECT
    mp."CreatedAt"::date AS "AnalyticsDate",

    EXTRACT(YEAR FROM mp."CreatedAt")::INT AS "Year",
    EXTRACT(MONTH FROM mp."CreatedAt")::INT AS "Month",
    EXTRACT(WEEK FROM mp."CreatedAt")::INT AS "Week",
    EXTRACT(QUARTER FROM mp."CreatedAt")::INT AS "Quarter",

    COUNT(*) AS "TotalTransactions",

    COUNT(*) FILTER (
        WHERE mp."PaymentStatus" IN (2, 4)
    ) AS "SuccessfulTransactions",

    COUNT(*) FILTER (
        WHERE mp."PaymentStatus" = 1
    ) AS "PendingTransactions",

    COUNT(*) FILTER (
        WHERE mp."PaymentStatus" = 3
    ) AS "OverdueTransactions",

    COUNT(*) FILTER (
        WHERE mp."PaymentStatus" = 5
    ) AS "CancelledTransactions",

    COALESCE(SUM(mp."Amount") FILTER (
        WHERE mp."PaymentStatus" IN (2, 4)
    ), 0) AS "TotalRevenue",

    COALESCE(SUM(mp."Amount") FILTER (
        WHERE mp."PaymentStatus" = 1
    ), 0) AS "PendingRevenue",

    COALESCE(SUM(mp."Amount") FILTER (
        WHERE mp."PaymentStatus" = 3
    ), 0) AS "OverdueRevenue",

    COALESCE(SUM(mp."Amount") FILTER (
        WHERE mp."PaymentStatus" = 5
    ), 0) AS "CancelledRevenue",

    COALESCE(SUM(mp."Amount") FILTER (
        WHERE mp."PaymentType" = 1
        AND mp."PaymentStatus" IN (2, 4)
    ), 0) AS "CashRevenue",

    COALESCE(SUM(mp."Amount") FILTER (
        WHERE mp."PaymentType" = 2
        AND mp."PaymentStatus" IN (2, 4)
    ), 0) AS "CreditCardRevenue",

    COALESCE(SUM(mp."Amount") FILTER (
        WHERE mp."PaymentType" = 3
        AND mp."PaymentStatus" IN (2, 4)
    ), 0) AS "PayPalRevenue",

    COUNT(*) FILTER (
        WHERE mp."MemberShipStartDate" IS NOT NULL
    ) AS "NewMemberships",

    COUNT(*) FILTER (
        WHERE mp."MemberShipRenewalDate" IS NOT NULL
    ) AS "RenewedMemberships",

    COUNT(*) FILTER (
        WHERE mp."MemberShipEndDate" IS NOT NULL
        AND mp."MemberShipEndDate" < (NOW() AT TIME ZONE 'Asia/Colombo')
    ) AS "ExpiredMemberships",

    (NOW() AT TIME ZONE 'Asia/Colombo') AS "LastRefreshAt"

FROM gym."MemberPayments" mp
GROUP BY
    mp."CreatedAt",
    EXTRACT(YEAR FROM mp."CreatedAt"),
    EXTRACT(MONTH FROM mp."CreatedAt"),
    EXTRACT(WEEK FROM mp."CreatedAt"),
    EXTRACT(QUARTER FROM mp."CreatedAt");