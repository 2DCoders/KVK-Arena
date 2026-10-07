using kvk.BuildingBlocks.Common;
using kvk.CarService.Features.CarWashService;
using kvk.CarService.Features.PackageService;
using kvk.CarService.Persistence.DesignTime;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

// Run from the solution directory against a migrated database.
// All test records are created inside a transaction that is always rolled back.
await using var db = new CarServiceTimeDbContextFactory().CreateDbContext([]);
if (args.Contains("--inspect"))
{
    var rows = await db.Packages.AsNoTracking().Select(p => new
    {
        p.Id, p.IsActive,
        Services = p.PackageServices.Count,
        CarWashServices = p.PackageServices.Count(ps => ps.Service.ServiceCategory == kvk.CarService.Enums.ServiceCategory.CarWash),
        InactiveServices = p.PackageServices.Count(ps => !ps.Service.IsActive)
    }).ToListAsync();
    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(rows));
    var result = await new PackageService(db).GetPackagesWithServicesAsync();
    var expectedIds = rows.Where(p => p.IsActive && p.CarWashServices > 0).Select(p => p.Id).Order().ToArray();
    Assert(result.PackagesWithServices!.Select(p => p.Id).Order().SequenceEqual(expectedIds),
        $"Package endpoint returns all {expectedIds.Length} active carwash packages");
    return;
}
await using var transaction = await db.Database.BeginTransactionAsync();
try
{
    var services = new CarWashService(db);
    var packages = new PackageService(db);
    var title = "CRUD test " + Guid.NewGuid().ToString("N");
    using var imageStream = new MemoryStream([1, 2, 3, 4]);
    var image = new FormFile(imageStream, 0, imageStream.Length, "Image", "test.jpg");
    Check(await services.CreateCarWashServiceAsync(new CarWashCreateRequest
    {
        Title = title, Price = 100, IsActive = false, Image = image, Features = "Wash"
    }), "Create inactive service");
    var service = await db.Services.SingleAsync(s => s.Title == title);
    db.ChangeTracker.Clear();
    var readService = await services.GetCarWashServiceByIdAsync(service.Id);
    Assert(readService is { IsActive: false } && readService.Image.SequenceEqual(new byte[] { 1, 2, 3, 4 }),
        "Inactive status and uploaded image persist");

    Check(await services.UpdateCarWashServiceAsync(new CarWashUpdateRequest
    {
        Id = service.Id, Title = title, Price = 150, Features = "Updated"
    }), "Update service from older cashier without status or image");
    db.ChangeTracker.Clear();
    readService = await services.GetCarWashServiceByIdAsync(service.Id);
    Assert(readService is { IsActive: false, Price: 150 } && readService.Image.Length == 4,
        "Older cashier edits preserve inactive status and image");
    Check(await packages.CreatePackageAsync(new PackageCreateRequest
    {
        Title = title, BasPrice = 90, PricesWithoutDiscounts = 150,
        IsActive = true, ServiceIds = [service.Id], Image = image
    }), "Create package with included service");
    var packageId = await db.Packages.Where(p => p.Title == title).Select(p => p.Id).SingleAsync();
    db.ChangeTracker.Clear();
    var package = await packages.GetPackageByIdAsync(packageId);
    Assert(package is { IsActive: true } && package.Services.Single().Id == service.Id,
        "Package includes the selected service");
    var available = await packages.GetPackagesWithServicesAsync();
    Assert(!available.AllServices!.Any(s => s.Id == service.Id)
        && available.PackagesWithServices!.Any(p => p.Id == packageId),
        "Inactive standalone services are hidden while active packages remain available");
    Assert(available.PackagesWithServices!.Single(p => p.Id == packageId).Services!
        .Any(s => s.Id == service.Id && !s.IsActive), "Active packages retain their complete included services");
    Assert(!(await services.DeleteCarWashServiceAsync(service.Id)).Succeeded,
        "Services referenced by packages cannot be deleted");

    Check(await services.UpdateCarWashServiceAsync(new CarWashUpdateRequest
    {
        Id = service.Id, Title = title, Price = 150, IsActive = true
    }), "Reactivate service");
    db.ChangeTracker.Clear();
    available = await packages.GetPackagesWithServicesAsync();
    Assert(available.AllServices!.Any(s => s.Id == service.Id)
        && available.PackagesWithServices!.Any(p => p.Id == packageId), "Reactivated service is purchasable");
    Check(await packages.UpdatePackageAsync(new PackageUpdateRequest
    {
        Id = packageId, Title = title, BasPrice = 95, PricesWithoutDiscounts = 150,
        IsActive = false, ServiceIds = [service.Id]
    }), "Deactivate package while preserving included services");
    db.ChangeTracker.Clear();
    package = await packages.GetPackageByIdAsync(packageId);
    Assert(package is { IsActive: false, BasPrice: 95 } && package.Services.Count == 1 && package.Image is { Length: 4 },
        "Package edit preserves services and image");
    available = await packages.GetPackagesWithServicesAsync();
    Assert(!available.PackagesWithServices!.Any(p => p.Id == packageId), "Inactive package is unavailable");
    Check(await packages.DeletePackageAsync(packageId), "Delete unused package");
    Check(await services.DeleteCarWashServiceAsync(service.Id), "Delete unused service");
    Assert(!await db.Packages.AnyAsync(p => p.Id == packageId) && !await db.Services.AnyAsync(s => s.Id == service.Id),
        "Deleted records are absent");
    Console.WriteLine("Carwash CRUD regression checks passed.");
}
finally { await transaction.RollbackAsync(); }

static void Check(Result result, string operation) => Assert(result.Succeeded, operation + ": " + result.Message);
static void Assert(bool condition, string message)
{
    if (!condition) throw new InvalidOperationException(message);
    Console.WriteLine("PASS: " + message);
}
