using kvk.BuildingBlocks.Common;
using kvk.CarService.Domain;
using kvk.CarService.Enums;
using kvk.CarService.Features.PackageService;
using kvk.CarService.Interfaces;
using kvk.Gaming;
using Microsoft.EntityFrameworkCore;

namespace kvk.CarService.Features.CarWashService;

public class CarWashService(CarServiceDbContext dbContext) : ICarWashService
{
    public async Task<Result> CreateCarWashServiceAsync(CarWashCreateRequest carService, CancellationToken cancellationToken = default)
    {
        byte[] imageBytes = [];
         if (carService.Image is not null && carService.Image.Length > 0)
        {
            using var memoryStream = new MemoryStream();
            await carService.Image.CopyToAsync(memoryStream, cancellationToken);
            imageBytes = memoryStream.ToArray();
        }

        var entity = new Domain.CarService
        {
            Id = Guid.NewGuid(),
            Title = carService.Title,
            Description = carService.Description,
            Price = carService.Price,
            IsActive = carService.IsActive ?? true,
            Features = carService.Features,
            Image = imageBytes,
            ServiceCategory = ServiceCategory.CarWash
        };

        await dbContext.Services.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success("Car wash service created successfully");
    }

    public async Task<Result> UpdateCarWashServiceAsync(CarWashUpdateRequest carService, CancellationToken cancellationToken = default)
    {
        var existingService = await dbContext.Services
            .FirstOrDefaultAsync(s => s.Id == carService.Id && s.ServiceCategory == ServiceCategory.CarWash, cancellationToken);

        if (existingService is null)
        {
            return Result.Failure("Car wash service not found");
        }

        existingService.Title = carService.Title;
        existingService.Description = carService.Description;
        existingService.Price = carService.Price;
        existingService.Features = carService.Features;
        if (carService.IsActive.HasValue)
            existingService.IsActive = carService.IsActive.Value;

        if (carService.Image is not null && carService.Image.Length > 0)
        {
            using var memoryStream = new MemoryStream();
            await carService.Image.CopyToAsync(memoryStream, cancellationToken);
            existingService.Image = memoryStream.ToArray();
        }

        dbContext.Services.Update(existingService);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success("Car wash service updated successfully");
    }

    public async Task<Result> DeleteCarWashServiceAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        var existingService = await dbContext.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.ServiceCategory == ServiceCategory.CarWash, cancellationToken);

        if (existingService is null)
        {
            return Result.Failure("Car wash service not found");
        }

        var now = DateTime.Now;
        if (await dbContext.CarWashOrderServices.AnyAsync(os => os.CarWashServiceId == serviceId
                && os.CarWashOrder.OrderDate > now
                && os.CarWashOrder.CarWashOrderStatus != CarWashOrderStatus.Cancelled
                && os.CarWashOrder.CarWashOrderStatus != CarWashOrderStatus.Completed, cancellationToken)
            || await dbContext.CarWashOrderPackages.AnyAsync(op =>
                op.Package.PackageServices.Any(ps => ps.ServiceId == serviceId)
                && op.CarWashOrder.OrderDate > now
                && op.CarWashOrder.CarWashOrderStatus != CarWashOrderStatus.Cancelled
                && op.CarWashOrder.CarWashOrderStatus != CarWashOrderStatus.Completed, cancellationToken))
            return Result.Failure("Cannot delete this service because it is included in a future carwash booking, either directly or through a package. Resolve the booking before deleting the service.");

        if (await dbContext.PackageServices.AnyAsync(ps => ps.ServiceId == serviceId, cancellationToken)
            || await dbContext.CarWashOrderServices.AnyAsync(os => os.CarWashServiceId == serviceId, cancellationToken))
            return Result.Failure("This service is used by a package or order. Deactivate it instead of deleting it.");

        dbContext.Services.Remove(existingService);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success("Car wash service deleted successfully");
    }

    public async Task<List<CarWashServiceResponse>> GetCarWashServiceAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Services
            .AsNoTracking()
            .Where(s => s.ServiceCategory == ServiceCategory.CarWash);

        if (serviceId != Guid.Empty)
        {
            query = query.Where(s => s.Id == serviceId);
        }

        return await query.Select(s => new CarWashServiceResponse
        {
            Id = s.Id,
            Title = s.Title,
            Description = s.Description,
            Price = s.Price,
            IsActive = s.IsActive,
            Features = s.Features,
            Image = s.Image,
            DurationInMinutes = s.DurationInMinutes,
            ServiceCategory = s.ServiceCategory
        }).ToListAsync(cancellationToken);
    }

    public async Task<CarWashServiceResponse?> GetCarWashServiceByIdAsync(Guid carWashServiceId, CancellationToken cancellationToken = default)
    {
        var service = await dbContext.Services
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == carWashServiceId && s.ServiceCategory == ServiceCategory.CarWash, cancellationToken);

        if (service is null)
        {
            return null;
        }

        return new CarWashServiceResponse
        {
            Id = service.Id,
            Title = service.Title,
            Description = service.Description,
            Price = service.Price,
            IsActive = service.IsActive,
            Features = service.Features,
            Image = service.Image,
            DurationInMinutes = service.DurationInMinutes,
            ServiceCategory = service.ServiceCategory
        };
    }

   
    

    
    
    
}
