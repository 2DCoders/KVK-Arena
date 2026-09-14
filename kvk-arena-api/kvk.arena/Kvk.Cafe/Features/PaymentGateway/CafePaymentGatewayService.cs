using kvk.BuildingBlocks;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Services;
using kvk.Cafe.Domain;
using Kvk.Cafe.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Kvk.Cafe.Features.PaymentGateway;

public class CafePaymentGatewayService : ICafePaymentGatewayService
{
    private readonly PayHereOptions _payHereOptions;
    private readonly IHashService _hashService;
    private readonly CafeDbContext _db;
    private readonly ILogger<CafePaymentGatewayService> _logger;

    public CafePaymentGatewayService(IOptions<PayHereOptions> payHereOptions, IHashService hashService,
        CafeDbContext db, ILogger<CafePaymentGatewayService> logger)
    {
        _payHereOptions = payHereOptions.Value;
        _hashService = hashService;
        _db = db;
        _logger = logger;
    }


    public async Task<CafePaymentGatewayResponse> ProcessPayment(CafePaymentGatewayRequest request,
        CancellationToken cancellationToken = default)
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
            IsPaid = false,
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

        _db.Orders.Add(newOrder);
        await _db.SaveChangesAsync(cancellationToken);

        var hash = _hashService.GeneratePayHereHash(
            _payHereOptions.MerchantId,
            _payHereOptions.MerchantSecret,
            orderNumber,
            discountedTotal,
            _payHereOptions.Currency);


        return new CafePaymentGatewayResponse
        {
            MerchantId = _payHereOptions.MerchantId,
            OrderId = orderNumber,
            Amount = discountedTotal.ToString("0.00"),
            Currency = _payHereOptions.Currency,
            Hash = hash
        };
    }

    public async Task<Result> DeletePendingPayment(CafePendingPaymentDeleteRequest request,
        CancellationToken cancellationToken = default)
    {
        var record = await _db.Orders
            .Where(x => x.OrderNumber == request.OrderId && x.IsPaid == false)
            .FirstOrDefaultAsync(cancellationToken);

        if (record is null)
            return Result.Failure($"Pending payment with order number {request.OrderId} was not found.");

        _db.Orders.Remove(record);
        await _db.SaveChangesAsync(cancellationToken);

        return Result.Success("Pending payment deleted successfully");
    }

    public async Task VerifyPayment(PaymentNotificationRequest request)
    {
        var record = await _db.Orders
            .Where(x => x.OrderNumber == request.OrderId && x.IsPaid == false)
            .FirstOrDefaultAsync();

        if (record is null)
            throw new Exception($"Pending payment with order number {request.OrderId} was not found.");

        var expectedMd5Sig =
            _hashService.GenerateNotificationMd5Sig(
                request.MerchantId,
                _payHereOptions.MerchantSecret,
                request.OrderId,
                request.PayhereAmount,
                request.PayhereCurrency,
                request.StatusCode);

        _logger.LogInformation("Expected MD5 Signature: {ExpectedMd5Sig}, Received MD5 Signature: {ReceivedMd5Sig}",
            expectedMd5Sig, request.Md5Sig);

        if (!string.Equals(
                expectedMd5Sig,
                request.Md5Sig,
                StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        if (request.StatusCode != 2)
            return;

        if (record.DiscountedTotalAmount != request.PayhereAmount)
            return;

        record.IsPaid = true;
        _db.Orders.Update(record);
        await _db.SaveChangesAsync();
    }


    private static string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.Now:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";
    }
}