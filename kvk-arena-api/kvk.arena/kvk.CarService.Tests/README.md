Run from the solution directory after applying the car service migrations:

```powershell
dotnet run --project kvk.CarService.Tests
```

Uses the configured car service database. Tests service and package CRUD, inactive
status persistence, image preservation, older cashier compatibility, package
service mappings, purchase availability, and deletion of referenced services.
All changes are wrapped in a transaction that is rolled back, including on failure.
