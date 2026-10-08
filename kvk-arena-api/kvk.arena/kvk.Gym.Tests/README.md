# Gym gateway regression checks

Run from the API solution directory:

```powershell
dotnet run --project kvk.Gym.Tests --verbosity quiet
```

Uses the existing Gym design-time database configuration and migrated schema.
All fixtures run inside a transaction that is always rolled back. Notifications
use fake merchant credentials; no gateway requests, charges, or SMS are sent.

Covers signed notification validation, UTC dates, Admin member/payment queries,
renewal periods, duplicate callbacks, cancellation ownership, late success,
failed checkout, expired membership activation, inactive plans and price validation.

## Deployment

Deploy the API and Arena UI together: the UI now reads
`GET /api/payments/status/{orderId}?memberId={memberId}` to confirm payment.
Admin gym member/payment lists refresh on focus and every 30 seconds while visible.

Set `PayHere:Sandbox` (`PayHere__Sandbox` environment variable) to `false` for live
merchant credentials, or `true` for sandbox credentials. The API returns this
setting to the gym checkout; the default preserves existing sandbox behavior.
Keep the merchant secret on the server. The notification URL must point to the
same publicly accessible API/database used by Admin.

No database migration is required. Existing pending orders are supported when
their order references are still present. Previously deleted orders and payments
without a verified callback require reconciliation against PayHere records;
browser completion alone is not proof of payment.
