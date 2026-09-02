using kvk.BuildingBlocks.Common;
using kvk.Cafe.Domain;
using Kvk.Cafe.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Kvk.Cafe.Features.Order;

public class OrderService(CafeDbContext db) : IOrderService
{
    public async Task<Result> CreateOrderAsync(OrderCreateRequest request, CancellationToken cancellationToken = default)
    {
        var orderNumber = GenerateOrderNumber();
        
        var orderItems = request.OrderItems.Select(item => new OrderItem
        {
            Id = Guid.NewGuid(),
            MenuId = item.MenuId,
            Quantity = item.Quantity,
            Price = item.Price,
            Discount = item.Discount,
            DiscountedPrice = item.Price - item.Discount
        }).ToList();

        var subTotal = orderItems.Sum(x => x.Price * x.Quantity);
        var totalDiscount = orderItems.Sum(x => x.Discount * x.Quantity);
        var discountedTotal = subTotal - totalDiscount;

        var newOrder = new kvk.Cafe.Domain.Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            OrderDate = DateTime.Now,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            TotalMinutesSpent = request.TotalMinutesSpent,
            SubTotalAmount = subTotal,
            Discount = totalDiscount,
            DiscountedTotalAmount = discountedTotal,
            IsPaid = request.IsPaid,
            PaymentMethod = request.PaymentMethod,
            OrderType = request.OrderType,
            Remark = request.Remark,
            Address = request.Address,
            DeliveryInstructions = request.DeliveryInstructions,
            DeliveryTime = request.DeliveryTime,
            DeliveryPerson = request.DeliveryPerson,
            DeliveryPersonPhone = request.DeliveryPersonPhone,
            TableNumber = request.TableNumber,
            OrderItems = orderItems
        };

        db.Orders.Add(newOrder);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success("Order created successfully.");
    }

    public async Task<Result> UpdateOrderAsync(OrderUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var exist = await db.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (exist is null)
            return Result.Failure($"Order with id {request.Id} was not found.");

        db.OrderItems.RemoveRange(exist.OrderItems);
        
        var newOrderItems = request.OrderItems.Select(item => new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = exist.Id,
            MenuId = item.MenuId,
            Quantity = item.Quantity,
            Price = item.Price,
            Discount = item.Discount,
            DiscountedPrice = item.Price - item.Discount
        }).ToList();

        var subTotal = newOrderItems.Sum(x => x.Price * x.Quantity);
        var totalDiscount = newOrderItems.Sum(x => x.Discount * x.Quantity);
        var discountedTotal = subTotal - totalDiscount;

        exist.CustomerName = request.CustomerName;
        exist.CustomerPhone = request.CustomerPhone;
        exist.TotalMinutesSpent = request.TotalMinutesSpent;
        exist.SubTotalAmount = subTotal;
        exist.Discount = totalDiscount;
        exist.DiscountedTotalAmount = discountedTotal;
        exist.IsPaid = request.IsPaid;
        exist.PaymentMethod = request.PaymentMethod;
        exist.OrderType = request.OrderType;
        exist.Remark = request.Remark;
        exist.Address = request.Address;
        exist.DeliveryInstructions = request.DeliveryInstructions;
        exist.DeliveryTime = request.DeliveryTime;
        exist.DeliveryPerson = request.DeliveryPerson;
        exist.DeliveryPersonPhone = request.DeliveryPersonPhone;
        exist.TableNumber = request.TableNumber;
        exist.OrderItems = newOrderItems;

        await db.SaveChangesAsync(cancellationToken);

        return Result.Success("Order updated successfully.");
    }

    public async Task<Result> DeleteOrderAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        var exist = await db.Orders
            .FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken);

        if (exist is null)
            return Result.Failure($"Order with id {orderId} was not found.");

        db.Orders.Remove(exist);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success("Order deleted successfully.");
    }

    public async Task<List<OrderResponse>> GetOrdersAsync(CancellationToken cancellationToken = default)
    {
        return await db.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Menu)
            .Select(o => new OrderResponse
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                OrderDate = o.OrderDate,
                CustomerName = o.CustomerName,
                CustomerPhone = o.CustomerPhone,
                TotalMinutesSpent = o.TotalMinutesSpent,
                SubTotalAmount = o.SubTotalAmount,
                Discount = o.Discount,
                DiscountedTotalAmount = o.DiscountedTotalAmount,
                IsPaid = o.IsPaid,
                PaymentMethod = o.PaymentMethod,
                OrderType = o.OrderType,
                Remark = o.Remark,
                Address = o.Address,
                DeliveryInstructions = o.DeliveryInstructions,
                DeliveryTime = o.DeliveryTime,
                DeliveryPerson = o.DeliveryPerson,
                DeliveryPersonPhone = o.DeliveryPersonPhone,
                TableNumber = o.TableNumber,
                OrderItems = o.OrderItems.Select(oi => new OrderItemResponse
                {
                    Id = oi.Id,
                    MenuId = oi.MenuId,
                    MenuName = oi.Menu != null ? oi.Menu.Name : string.Empty,
                    Quantity = oi.Quantity,
                    Price = oi.Price,
                    Discount = oi.Discount,
                    DiscountedPrice = oi.DiscountedPrice
                }).ToList()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<OrderResponse> GetOrderByIdAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        var order = await db.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Menu)
            .Where(o => o.Id == orderId)
            .Select(o => new OrderResponse
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                OrderDate = o.OrderDate,
                CustomerName = o.CustomerName,
                CustomerPhone = o.CustomerPhone,
                TotalMinutesSpent = o.TotalMinutesSpent,
                SubTotalAmount = o.SubTotalAmount,
                Discount = o.Discount,
                DiscountedTotalAmount = o.DiscountedTotalAmount,
                IsPaid = o.IsPaid,
                PaymentMethod = o.PaymentMethod,
                OrderType = o.OrderType,
                Remark = o.Remark,
                Address = o.Address,
                DeliveryInstructions = o.DeliveryInstructions,
                DeliveryTime = o.DeliveryTime,
                DeliveryPerson = o.DeliveryPerson,
                DeliveryPersonPhone = o.DeliveryPersonPhone,
                TableNumber = o.TableNumber,
                OrderItems = o.OrderItems.Select(oi => new OrderItemResponse
                {
                    Id = oi.Id,
                    MenuId = oi.MenuId,
                    MenuName = oi.Menu != null ? oi.Menu.Name : string.Empty,
                    Quantity = oi.Quantity,
                    Price = oi.Price,
                    Discount = oi.Discount,
                    DiscountedPrice = oi.DiscountedPrice
                }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (order is null)
        {
            throw new KeyNotFoundException($"Order with id {orderId} was not found.");
        }

        return order;
    }

    private static string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.Now:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";
    }
}