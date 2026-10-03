# Hangfire Day-End Rollover Test Guide

This guide shows how to verify the `SystemSetting` rollover job runs and how to tell it worked.

## Prereqs

- A running PostgreSQL database.
- Connection string set in `kvk.Host/appsettings.json`.
- Migrations applied (includes `SystemSettings` table).

## 1) Configure connection strings

Use one database or separate ones.

Example (single DB):

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=...;Database=kvk_app;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true",
  "HangfireConnection": ""
}
```

Example (separate DB for Hangfire):

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=...;Database=kvk_app;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true",
  "HangfireConnection": "Host=...;Database=kvk_hangfire;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true"
}
```

## 2) Apply migrations

If you use EF Core migrations, run from the solution root:

```powershell
cd "D:\KVK Arena\Code\KVK-Arena\kvk-arena-api\kvk.arena"

dotnet ef database update --project "kvk.Gym" --startup-project "kvk.Host"
```

If you do not use EF Core migrations, apply the SQL created in your migration file manually.

## 3) Run the API

```powershell
cd "D:\KVK Arena\Code\KVK-Arena\kvk-arena-api\kvk.arena"

dotnet run --project "kvk.Host"
```

## 4) Open the Hangfire dashboard

Open:

```
https://<your-host>/hangfire
```

You must be authenticated. If you are not logged in, the dashboard will be denied.

## 5) Verify the recurring job is registered

In the Hangfire dashboard:

- Go to **Recurring Jobs**.
- Look for **Gym.SystemSettingRollover**.
- Status should be **Scheduled**.

## 6) Verify the catch-up run works

### Option A: Use SQL to backdate `SystemSettings.CurrentDay`

Run this SQL against your Gym DB (schema `gym`):

```sql
UPDATE gym."SystemSettings"
SET "CurrentDay" = (NOW() - INTERVAL '2 days')::date
WHERE "Id" = '7b06f7f7-4a17-45b2-9b7c-2f6f0b49b2e2';
```

Then restart the API. On startup it will enqueue a catch-up run.

### Option B: Delete the row

```sql
DELETE FROM gym."SystemSettings"
WHERE "Id" = '7b06f7f7-4a17-45b2-9b7c-2f6f0b49b2e2';
```

Restart the API. It will recreate the singleton row and run once.

## 7) Confirm it worked

Check `SystemSettings` and the day-end status:

```sql
SELECT
  "Id",
  "PreviousDayEnd",
  "CurrentDay",
  "NextWorkingDay",
  "LastDayEndCheckedDate",
  "IsDayEndCompleted"
FROM gym."SystemSettings";
```

Expected:

- `CurrentDay` is today (based on `Gym:DayEnd:TimeZoneId`).
- `PreviousDayEnd` is yesterday.
- `LastDayEndCheckedDate` equals `PreviousDayEnd`.
- `IsDayEndCompleted` is `true` only if a `DayEndRecord` exists for that date.

## 8) Verify the day-end record check

If you want `IsDayEndCompleted = true`, insert a record for the previous day:

```sql
INSERT INTO gym."DayEnds"
(
  "Id",
  "CurrentDate",
  "NextWorkingDate",
  "CashFromPrevDay",
  "ExpectedCashTotal",
  "ActualCashCount",
  "Discrepancy",
  "Remark",
  "HoldForNextDay",
  "CreatedAt"
)
VALUES
(
  gen_random_uuid(),
  (NOW() - INTERVAL '1 day')::date,
  NOW()::date,
  0, 0, 0, 0,
  'test',
  0,
  NOW()
);
```

Restart the API or trigger the job manually in Hangfire Dashboard (**Recurring Jobs** > **Trigger**).

## Notes

- The schedule time is read from `Gym:DayEnd:RunAt` (hours and minutes). Seconds are ignored by Hangfire cron.
- The job runs on the server host, not the client PC.

