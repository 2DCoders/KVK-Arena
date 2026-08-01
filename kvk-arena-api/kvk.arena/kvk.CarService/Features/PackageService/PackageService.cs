using kvk.BuildingBlocks.Common;
using kvk.CarService.Domain;
using kvk.CarService.Features.CarWashService;
using kvk.CarService.Interfaces;
using kvk.Gaming;
using Microsoft.EntityFrameworkCore;

namespace kvk.CarService.Features.PackageService;

public class PackageService(CarServiceDbContext dbContext) : IPackageService
{
    public async Task<Result> CreatePackageAsync(PackageCreateRequest request, CancellationToken cancellationToken = default)
    {
        byte[] imageBytes = [];
        if (request.Image is not null && request.Image.Length > 0)
        {
            using var memoryStream = new MemoryStream();
            await request.Image.CopyToAsync(memoryStream, cancellationToken);
            imageBytes = memoryStream.ToArray();
        }

        var packageId = Guid.NewGuid();
        var package = new Package
        {
            Id = packageId,
            Title = request.Title,
            Description = request.Description,
            Image = imageBytes,
            DurationInMinutes = 0,
            BasPrice = request.BasPrice,
            PricesWithoutDiscounts = request.PricesWithoutDiscounts,
            IsActive = request.IsActive
        };

        if (request.ServiceIds.Count > 0)
        {
            var validServiceIds = await dbContext.Services
                .Where(s => request.ServiceIds.Contains(s.Id))
                .Select(s => s.Id)
                .ToListAsync(cancellationToken);

            foreach (var serviceId in validServiceIds)
            {
                package.PackageServices.Add(new Domain.PackageService
                {
                    Id = Guid.NewGuid(),
                    PackageId = packageId,
                    ServiceId = serviceId
                });
            }
        }

        await dbContext.Packages.AddAsync(package, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success("Package created successfully");
    }

    public async Task<Result> UpdatePackageAsync(PackageUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var existingPackage = await dbContext.Packages
            .Include(p => p.PackageServices)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (existingPackage is null)
        {
            return Result.Failure("Package not found");
        }

        existingPackage.Title = request.Title;
        existingPackage.Description = request.Description;
        existingPackage.DurationInMinutes = 0;
        existingPackage.BasPrice = request.BasPrice;
        existingPackage.PricesWithoutDiscounts = request.PricesWithoutDiscounts;
        existingPackage.IsActive = request.IsActive;

        if (request.Image is not null && request.Image.Length > 0)
        {
            using var memoryStream = new MemoryStream();
            await request.Image.CopyToAsync(memoryStream, cancellationToken);
            existingPackage.Image = memoryStream.ToArray();
        }

        // Update mapped services
        dbContext.PackageServices.RemoveRange(existingPackage.PackageServices);

        if (request.ServiceIds.Count > 0)
        {
            var validServiceIds = await dbContext.Services
                .Where(s => request.ServiceIds.Contains(s.Id))
                .Select(s => s.Id)
                .ToListAsync(cancellationToken);

            foreach (var serviceId in validServiceIds)
            {
                existingPackage.PackageServices.Add(new Domain.PackageService
                {
                    Id = Guid.NewGuid(),
                    PackageId = existingPackage.Id,
                    ServiceId = serviceId
                });
            }
        }

        dbContext.Packages.Update(existingPackage);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success("Package updated successfully");
    }

    public async Task<Result> DeletePackageAsync(Guid packageId, CancellationToken cancellationToken = default)
    {
        var existingPackage = await dbContext.Packages
            .Include(p => p.PackageServices)
            .FirstOrDefaultAsync(p => p.Id == packageId, cancellationToken);

        if (existingPackage is null)
        {
            return Result.Failure("Package not found");
        }

        dbContext.PackageServices.RemoveRange(existingPackage.PackageServices);
        dbContext.Packages.Remove(existingPackage);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success("Package deleted successfully");
    }

    public async Task<List<PackageResponse>> GetPackagesAsync(Guid packageId = default, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Packages
            .AsNoTracking()
            .Include(p => p.PackageServices)
                .ThenInclude(ps => ps.Service)
            .AsQueryable();

        if (packageId != Guid.Empty)
        {
            query = query.Where(p => p.Id == packageId);
        }

        return await query.Select(p => new PackageResponse
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            Image = p.Image,
            DurationInMinutes = p.DurationInMinutes,
            BasPrice = p.BasPrice,
            PricesWithoutDiscounts = p.PricesWithoutDiscounts,
            IsActive = p.IsActive,
            Services = p.PackageServices.Select(ps => new CarWashServiceResponse
            {
                Id = ps.Service.Id,
                Title = ps.Service.Title,
                Description = ps.Service.Description,
                Price = ps.Service.Price,
                Features = ps.Service.Features,
                Image = ps.Service.Image,
                DurationInMinutes = ps.Service.DurationInMinutes,
                ServiceCategory = ps.Service.ServiceCategory
            }).ToList()
        }).ToListAsync(cancellationToken);
    }

    public async Task<PackageResponse?> GetPackageByIdAsync(Guid packageId, CancellationToken cancellationToken = default)
    {
        var package = await dbContext.Packages
            .AsNoTracking()
            .Include(p => p.PackageServices)
                .ThenInclude(ps => ps.Service)
            .FirstOrDefaultAsync(p => p.Id == packageId, cancellationToken);

        if (package is null)
        {
            return null;
        }

        return new PackageResponse
        {
            Id = package.Id,
            Title = package.Title,
            Description = package.Description,
            Image = package.Image,
            DurationInMinutes = package.DurationInMinutes,
            BasPrice = package.BasPrice,
            PricesWithoutDiscounts = package.PricesWithoutDiscounts,
            IsActive = package.IsActive,
            Services = package.PackageServices.Select(ps => new CarWashServiceResponse
            {
                Id = ps.Service.Id,
                Title = ps.Service.Title,
                Description = ps.Service.Description,
                Price = ps.Service.Price,
                Features = ps.Service.Features,
                Image = ps.Service.Image,
                DurationInMinutes = ps.Service.DurationInMinutes,
                ServiceCategory = ps.Service.ServiceCategory
            }).ToList()
        };
    }
}
