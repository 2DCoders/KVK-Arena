DROP MATERIALIZED VIEW IF EXISTS gym."MemberFinancialAnalyticsDaily";

CREATE MATERIALIZED VIEW IF NOT EXISTS gym."MemberFinancialAnalyticsDaily"
AS
WITH AllPayments AS (
    SELECT
        pr."CreatedAt" AS "PaymentDate",
        pr."Amount",
        pr."PaymentType",
        pr."PaymentStatus"
    FROM gym."PaymentRecords" pr
    
    UNION ALL
    
    SELECT
        dpm."CreatedAt" AS "PaymentDate",
        dpm."Amount",
        dpm."PaymentType",
        dpm."PaymentStatus"
    FROM gym."DayPassMembers" dpm
)
SELECT
    ap."PaymentDate"::date AS "AnalyticsDate",

    EXTRACT(YEAR FROM ap."PaymentDate")::INT AS "Year",
    EXTRACT(MONTH FROM ap."PaymentDate")::INT AS "Month",
    EXTRACT(WEEK FROM ap."PaymentDate")::INT AS "Week",
    EXTRACT(QUARTER FROM ap."PaymentDate")::INT AS "Quarter",

    COUNT(*) AS "TotalTransactions",

    COUNT(*) FILTER (
        WHERE ap."PaymentStatus" IN (2, 4)
    ) AS "SuccessfulTransactions",

    COUNT(*) FILTER (
        WHERE ap."PaymentStatus" = 1
    ) AS "PendingTransactions",

    COUNT(*) FILTER (
        WHERE ap."PaymentStatus" = 3
    ) AS "OverdueTransactions",

    COUNT(*) FILTER (
        WHERE ap."PaymentStatus" = 5
    ) AS "CancelledTransactions",

    COALESCE(SUM(ap."Amount") FILTER (
        WHERE ap."PaymentStatus" IN (2, 4)
    ), 0) AS "TotalRevenue",

    COALESCE(SUM(ap."Amount") FILTER (
        WHERE ap."PaymentStatus" = 1
    ), 0) AS "PendingRevenue",

    COALESCE(SUM(ap."Amount") FILTER (
        WHERE ap."PaymentStatus" = 3
    ), 0) AS "OverdueRevenue",

    COALESCE(SUM(ap."Amount") FILTER (
        WHERE ap."PaymentStatus" = 5
    ), 0) AS "CancelledRevenue",

    COALESCE(SUM(ap."Amount") FILTER (
        WHERE ap."PaymentType" = 1
        AND ap."PaymentStatus" IN (2, 4)
    ), 0) AS "CashRevenue",

    COALESCE(SUM(ap."Amount") FILTER (
        WHERE ap."PaymentType" = 2
        AND ap."PaymentStatus" IN (2, 4)
    ), 0) AS "CreditCardRevenue",

    COALESCE(SUM(ap."Amount") FILTER (
        WHERE ap."PaymentType" = 3
        AND ap."PaymentStatus" IN (2, 4)
    ), 0) AS "PayPalRevenue",

    -- The following metrics are specific to PaymentRecords and cannot be directly applied to DayPassMembers
    -- For now, I will keep them as they are, assuming they should only count for PaymentRecords.
    -- If DayPassMembers also have similar concepts of memberships, this part would need further clarification.
    COUNT(pr_filtered."MemberShipStartDate") AS "NewMemberships",

    COUNT(pr_filtered."MemberShipRenewalDate") AS "RenewedMemberships",

    COUNT(*) FILTER (
        WHERE pr_filtered."MemberShipEndDate" IS NOT NULL
        AND pr_filtered."MemberShipEndDate" < (NOW() AT TIME ZONE 'Asia/Colombo')
    ) AS "ExpiredMemberships",

    (NOW() AT TIME ZONE 'Asia/Colombo') AS "LastRefreshAt"

FROM AllPayments ap
LEFT JOIN gym."PaymentRecords" pr_filtered ON ap."PaymentDate" = pr_filtered."CreatedAt" AND ap."Amount" = pr_filtered."Amount" AND ap."PaymentType" = pr_filtered."PaymentType" AND ap."PaymentStatus" = pr_filtered."PaymentStatus" -- This join is to re-introduce PaymentRecords specific columns for membership analytics
GROUP BY
    ap."PaymentDate",
    EXTRACT(YEAR FROM ap."PaymentDate"),
    EXTRACT(MONTH FROM ap."PaymentDate"),
    EXTRACT(WEEK FROM ap."PaymentDate"),
    EXTRACT(QUARTER FROM ap."PaymentDate");