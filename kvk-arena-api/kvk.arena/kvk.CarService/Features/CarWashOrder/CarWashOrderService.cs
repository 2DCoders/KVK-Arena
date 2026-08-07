using kvk.BuildingBlocks.Common;
using kvk.CarService.Domain;
using kvk.CarService.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace kvk.CarService.Features.CarWashOrder;

public class CarWashOrderService(CarServiceDbContext db) : ICarWashOrderService
{
    public async Task<Result> CreateCarWashOrderAsync(CarWashOrderCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var newOrder = new Domain.CarWashOrder
        {
            Id = Guid.NewGuid(),
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            OrderNumber = await GenerateOrderNumberAsync(cancellationToken),
            OrderDate = DateTime.Now,
            SubTotalAmount = request.SubTotalAmount,
            Discount = request.Discount,
            DiscountedTotalAmount = request.DiscountedTotalAmount,
            IsPaid = request.IsPaid,
            PaymentMethod = request.PaymentMethod,
            VehicleType = request.VehicleType,
            CarWashOrderStatus = request.CarWashOrderStatus,
            TotalMinutesSpent = 0
        };

        // Add Packages
        if (request.PackageIds?.Any() == true)
        {
            foreach (var packageId in request.PackageIds)
            {
                var package = await db.Packages
                    .Where(x => x.Id == packageId)
                    .FirstOrDefaultAsync(cancellationToken);

                if (package is null)
                    return Result.Failure($"Car wash package '{packageId}' was not found.");

                newOrder.Packages.Add(new Domain.CarWashOrderPackage
                {
                    Id = Guid.NewGuid(),
                    CarWashPackageId = package.Id,
                });
            }
        }

        // Add Individual Services
        if (request.ServicesIds?.Any() == true)
        {
            foreach (var serviceId in request.ServicesIds)
            {
                var service = await db.Services
                    .Where(x => x.Id == serviceId && x.ServiceCategory == Enums.ServiceCategory.CarWash)
                    .FirstOrDefaultAsync(cancellationToken);

                if (service is null)
                    return Result.Failure($"Car wash service '{serviceId}' was not found.");

                newOrder.Services.Add(new Domain.CarWashOrderService
                {
                    Id = Guid.NewGuid(),
                    CarWashServiceId = service.Id,
                });
            }
        }

        db.CarWashOrders.Add(newOrder);
        db.CarWashOrderPackages.AddRange(newOrder.Packages);
        db.CarWashOrderServices.AddRange(newOrder.Services);

        await db.SaveChangesAsync(cancellationToken);


        return Result.Success("Order wash order created.");
    }

    public async Task<Result> UpdateCarWashOrderAsync(CarWashOrderUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var exist = await db.CarWashOrders
            .Include(x => x.Packages)
            .Include(x => x.Services)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);


        if (exist is null)
            return Result.Failure($"Car wash order with id {request.Id} was not found.");


        exist.CustomerName = request.CustomerName;
        exist.CustomerPhone = request.CustomerPhone;
        exist.VehicleType = request.VehicleType;

        exist.SubTotalAmount = request.SubTotalAmount;
        exist.Discount = request.Discount;
        exist.DiscountedTotalAmount = request.DiscountedTotalAmount;

        exist.IsPaid = request.IsPaid;
        exist.PaymentMethod = request.PaymentMethod;
        exist.CarWashOrderStatus = request.CarWashOrderStatus;

        // Remove existing package/service items
        db.CarWashOrderPackages.RemoveRange(exist.Packages);
        db.CarWashOrderServices.RemoveRange(exist.Services);

        exist.Packages.Clear();
        exist.Services.Clear();

        // Add packages
        if (request.PackageIds?.Any() == true)
        {
            foreach (var packageId in request.PackageIds)
            {
                var package = await db.CarWashOrderPackages
                    .FirstOrDefaultAsync(x => x.Id == packageId, cancellationToken);

                if (package is null)
                    return Result.Failure($"Car wash package '{packageId}' was not found.");

                exist.Packages.Add(new Domain.CarWashOrderPackage
                {
                    Id = Guid.NewGuid(),
                    CarWashPackageId = package.Id,
                });
            }
        }

        // Add services
        if (request.ServicesIds?.Any() == true)
        {
            foreach (var serviceId in request.ServicesIds)
            {
                var service = await db.CarWashOrderServices
                    .FirstOrDefaultAsync(x => x.Id == serviceId, cancellationToken);

                if (service is null)
                    return Result.Failure($"Car wash service '{serviceId}' was not found.");

                exist.Services.Add(new Domain.CarWashOrderService
                {
                    Id = Guid.NewGuid(),
                    CarWashServiceId = service.Id,
                });
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> DeleteCarWashOrderAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        var exist = await db.CarWashOrders
            .FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken);

        if (exist is null)
            return Result.Failure($"Car wash order with id {orderId} was not found.");

        db.CarWashOrders.Remove(exist);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success("Car wash order deleted successfully.");
    }

    public async Task<List<CarWashOrderResponse>> GetCarWashOrdersAsync(CancellationToken cancellationToken = default)
    {
        return await db.CarWashOrders
            .Select(order => new CarWashOrderResponse
            {
                CarWashOrderId = order.Id,
                OrderNumber = order.OrderNumber,
                OrderDate = order.OrderDate,
                CustomerName = order.CustomerName,
                CustomerPhone = order.CustomerPhone,
                VehicleType = order.VehicleType,
                TotalMinutesSpent = order.TotalMinutesSpent,
                SubTotalAmount = order.SubTotalAmount,
                Discount = order.Discount,
                DiscountedTotalAmount = order.DiscountedTotalAmount,
                IsPaid = order.IsPaid,
                PaymentMethod = order.PaymentMethod,
                CarWashOrderStatus = order.CarWashOrderStatus,

                Packages = order.Packages
                    .Select(package => new CarWashOrderPackageResponse
                    {
                        CarWashPackageId = package.CarWashPackageId,
                        PackageName = package.Package.Title,
                        PackagePrice = package.Package.BasPrice
                    })
                    .ToList(),

                Services = order.Services
                    .Select(service => new CarWashOrderServiceResponse
                    {
                        CarWashServiceId = service.CarWashServiceId,
                        ServiceName = service.Service.Title,
                        ServicePrice = service.Service.Price
                    })
                    .ToList()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<CarWashOrderResponse> GetCarWashOrderByIdAsync(Guid orderId,
        CancellationToken cancellationToken = default)
    {
        var order = await db.CarWashOrders
            .Select(order => new CarWashOrderResponse
            {
                CarWashOrderId = order.Id,
                OrderNumber = order.OrderNumber,
                OrderDate = order.OrderDate,
                CustomerName = order.CustomerName,
                CustomerPhone = order.CustomerPhone,
                VehicleType = order.VehicleType,
                TotalMinutesSpent = order.TotalMinutesSpent,
                SubTotalAmount = order.SubTotalAmount,
                Discount = order.Discount,
                DiscountedTotalAmount = order.DiscountedTotalAmount,
                IsPaid = order.IsPaid,
                PaymentMethod = order.PaymentMethod,
                CarWashOrderStatus = order.CarWashOrderStatus,

                Packages = order.Packages
                    .Select(package => new CarWashOrderPackageResponse
                    {
                        CarWashPackageId = package.CarWashPackageId,
                        PackageName = package.Package.Title,
                        PackagePrice = package.Package.BasPrice
                    })
                    .ToList(),

                Services = order.Services
                    .Select(service => new CarWashOrderServiceResponse
                    {
                        CarWashServiceId = service.CarWashServiceId,
                        ServiceName = service.Service.Title,
                        ServicePrice = service.Service.Price
                    })
                    .ToList()
            })
            .Where(order => order.CarWashOrderId == orderId)
            .FirstOrDefaultAsync(cancellationToken);

        if (order is null)
        {
            throw new KeyNotFoundException($"Car wash order with id {orderId} was not found.");
        }


        return order;
    }

    private async Task<string> GenerateOrderNumberAsync(CancellationToken cancellationToken = default)
    {
        var lastOrder = await db.CarWashOrders
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        int lastOrderNumber = 0;
        if (lastOrder is not null && !string.IsNullOrEmpty(lastOrder.OrderNumber))
        {
            var parts = lastOrder.OrderNumber.Split('-');
            if (parts.Length == 2 && int.TryParse(parts[1], out int parsedNumber))
            {
                lastOrderNumber = parsedNumber;
            }
        }

        int newOrderNumber = lastOrderNumber + 1;
        return $"ORD-{newOrderNumber:D4}";
    }
}