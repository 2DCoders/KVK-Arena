using System.Data.Common;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Persistence;
using kvk.Identity.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace kvk.Identity.Services;

public class ReservationCouponService(IdentityApplicationDbContext db, IConfiguration configuration,
    ITenantService tenant, ILogger<AppDbContextBase> logger, IHttpContextAccessor accessor) : IReservationCouponService
{
    public Task<CouponValidationResult> QuoteAsync(string couponCode, IReadOnlyList<decimal> slotPrices, CancellationToken ct)
        => CalculateAsync(db, couponCode, slotPrices, false, ct);

    public async Task<CouponValidationResult> RedeemAsync(string couponCode, IReadOnlyList<decimal> slotPrices,
        DbTransaction transaction, CancellationToken ct)
    {
        // Both schemas share the application database. Enlist coupon redemption in the booking transaction.
        var connection = transaction.Connection ?? throw new InvalidOperationException("The booking transaction is no longer active.");
        var identityConnection = db.Database.GetDbConnection();
        if (connection.Database != identityConnection.Database || connection.DataSource != identityConnection.DataSource)
            throw new InvalidOperationException("Coupon bookings require identity and badminton to share the application database.");
        var options = new DbContextOptionsBuilder<IdentityApplicationDbContext>().UseNpgsql(connection).Options;
        await using var enlisted = new IdentityApplicationDbContext(options, tenant, logger, accessor);
        await enlisted.Database.UseTransactionAsync(transaction, ct);
        return await CalculateAsync(enlisted, couponCode, slotPrices, true, ct);
    }

    private async Task<CouponValidationResult> CalculateAsync(IdentityApplicationDbContext context, string code,
        IReadOnlyList<decimal> prices, bool redeem, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(code)) return Invalid("A coupon code is required.");
        code = code.Trim().ToUpperInvariant();
        var coupon = await context.MemberEligibleOffers.AsNoTracking().Include(x => x.OfferRate)
            .SingleOrDefaultAsync(x => x.CouponCode == code, ct);
        if (coupon is null || !coupon.IsEligible || !coupon.OfferRate.IsActive)
            return Invalid("This coupon is invalid or no longer eligible.");
        if (coupon.IsRedeemed) return Invalid("This coupon has already been redeemed.");
        var discount = ReservationCouponPricing.Discount(prices, coupon.OfferRate.RateBadminton ?? 0,
            configuration.GetValue<int>("BadmintonMaxDiscountSlotLimit"));
        if (redeem)
        {
            var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
            var updated = await context.MemberEligibleOffers.Where(x => x.Id == coupon.Id && !x.IsRedeemed && x.IsEligible && x.OfferRate.IsActive)
                .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.IsRedeemed, true).SetProperty(x => x.RedeemedDate, now), ct);
            if (updated != 1) return Invalid("This coupon is no longer available. Please use another unredeemed code.");
        }
        return new CouponValidationResult { IsValid = true, DiscountAmount = discount };
    }

    private static CouponValidationResult Invalid(string message) => new() { IsValid = false, ErrorMessage = message };
}
