Run from the solution directory against the configured, migrated database:

```powershell
dotnet run --project kvk.Gaming.Tests
```

Checks the DELETE controller removes active and inactive games and rejects empty
and missing IDs. All test records are rolled back, including on failure.
