using System.Globalization;
using kvk.BuildingBlocks;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Services;
using kvk.Gym.Domain;
using kvk.Gym.Enums;
using kvk.Gym.Features.PaymentGateway;
using kvk.Gym.Persistence.DesignTime;
using kvk.Gym.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

// No gateway requests or SMS are sent. All fixtures are rolled back.
await using var db = new GymDesignTimeDbContextFactory().CreateDbContext([]);
await using var transaction = await db.Database.BeginTransactionAsync();
var hash = new HashService();
var options = new PayHereOptions { MerchantId = "test-merchant", MerchantSecret = "test-secret", Sandbox = false };
var gateway = new GymPaymentGatewayService(db, hash, Options.Create(options), NullLogger<GymPaymentGatewayService>.Instance);
var suffix = Guid.NewGuid().ToString("N");
var plan = new MembershipPlan { Title = "Gateway test " + suffix, Price = 1500, DurationInDays = 30, IsActive = ActiveStatus.Active };
var otherPlan = new MembershipPlan { Title = "Other test " + suffix, Price = 2000, DurationInDays = 90, IsActive = ActiveStatus.Active };
var member = new Membership
{
    FirstName = "Gateway", LastName = "Test", UserName = suffix, Email = suffix + "@example.test",
    PasswordHash = "unused", Status = "Active", MembershipNumber = suffix,
    DateOfBirth = DateTime.SpecifyKind(new DateTime(1990, 1, 1), DateTimeKind.Utc),
    MembershipPlan = plan, MemberType = MemberType.Client, MembershipStatus = MembershipStatus.Inactive
};
try
{
    db.AddRange(plan, otherPlan, member);
    await db.SaveChangesAsync();
    db.MemberPayments.Add(new MemberPayment { MembershipId = member.Id, PaymentStatus = PaymentStatus.Pending, Amount = plan.Price });
    await db.SaveChangesAsync();
    var initialPayments = await db.MemberPayments.CountAsync(p => p.MembershipId == member.Id);

    var order = await Create(plan);
    Assert(order.Sandbox == false && order.Amount == "1500.00", "Checkout mode comes from server configuration");
    Assert(member.MembershipPlanId == plan.Id && await db.MemberPayments.CountAsync(p => p.MembershipId == member.Id) == initialPayments,
        "Starting checkout preserves the current membership and payment state");
    Assert((await gateway.GetPaymentStatus(order.OrderId, member.Id))?.PaymentStatus == PaymentStatus.Pending,
        "Browser sees pending until the verified callback arrives");

    var badSignature = Notification(order);
    badSignature.Md5Sig = "invalid";
    await gateway.VerifyPayment(badSignature);
    var wrongAmount = Notification(order, amount: 1);
    await gateway.VerifyPayment(wrongAmount);
    var wrongMerchant = Notification(order);
    wrongMerchant.MerchantId = "other-merchant";
    wrongMerchant.Md5Sig = Sign(wrongMerchant);
    await gateway.VerifyPayment(wrongMerchant);
    var wrongCurrency = Notification(order);
    wrongCurrency.PayhereCurrency = "USD";
    wrongCurrency.Md5Sig = Sign(wrongCurrency);
    await gateway.VerifyPayment(wrongCurrency);
    Assert((await gateway.GetPaymentStatus(order.OrderId, member.Id))?.PaymentStatus == PaymentStatus.Pending,
        "Invalid signature, amount, merchant, and currency cannot mark a payment paid");

    await gateway.VerifyPayment(Notification(order));
    db.ChangeTracker.Clear();
    var payment = await db.MemberPayments.SingleAsync(p => p.MembershipId == member.Id);
    var record = await db.PaymentRecords.SingleAsync(p => p.TransactionReference == order.OrderId);
    Assert(payment.PaymentStatus == PaymentStatus.Paid && payment.MemberShipStartDate?.Kind == DateTimeKind.Utc
        && payment.MemberShipEndDate == payment.MemberShipStartDate?.AddDays(30), "Successful callback persists UTC membership dates");
    Assert(record.PaymentStatus == PaymentStatus.Paid && record.MemberPaymentId == payment.Id
        && record.MembershipPlanTitle == plan.Title && record.MemberShipEndDate == payment.MemberShipEndDate,
        "Admin payment record contains paid status, purchased plan, member number, and matching dates");
    var adminPayments = await new PaymentService(db, null!).GetPaymentsByMembershipIdAsync(member.Id);
    Assert(adminPayments.Any(p => p.Id == record.Id && p.PaymentStatus == PaymentStatus.Paid && p.MembershipPlanTitle == plan.Title),
        "Admin payment query returns the verified online payment");
    var adminMember = await new MembershipService(db, null!, null!, null!).GetMemberAsync(member.Id);
    Assert(adminMember.PaymentStatus == PaymentStatus.Paid && adminMember.MembershipEndDate == payment.MemberShipEndDate,
        "Admin member query reflects the online payment");

    var originalEnd = payment.MemberShipEndDate;
    await gateway.VerifyPayment(Notification(order));
    var reversePaid = await gateway.DeletePendingPayment(new PendingPaymentDeleteRequest
        { MemberId = member.Id, OrderId = order.OrderId, MembershipPlanId = plan.Id });
    db.ChangeTracker.Clear();
    Assert(reversePaid.Succeeded && (await gateway.GetPaymentStatus(order.OrderId, member.Id))?.PaymentStatus == PaymentStatus.Paid
        && (await db.MemberPayments.SingleAsync(p => p.MembershipId == member.Id)).MemberShipEndDate == originalEnd,
        "Duplicate notifications and late browser cancellation cannot change a verified payment");

    var renewal = await Create(otherPlan);
    Assert((await db.Memberships.FindAsync(member.Id))?.MembershipPlanId == plan.Id, "Unpaid upgrades do not change the member plan");
    await gateway.VerifyPayment(Notification(renewal));
    db.ChangeTracker.Clear();
    payment = await db.MemberPayments.SingleAsync(p => p.MembershipId == member.Id);
    Assert(payment.MemberShipStartDate == originalEnd && payment.MemberShipEndDate == originalEnd?.AddDays(90)
        && (await db.Memberships.FindAsync(member.Id))?.MembershipPlanId == otherPlan.Id,
        "Paid renewal extends the remaining membership using the purchased plan");

    var cancelled = await Create(plan);
    var wrongOwner = await gateway.DeletePendingPayment(new PendingPaymentDeleteRequest
        { MemberId = Guid.NewGuid(), OrderId = cancelled.OrderId, MembershipPlanId = plan.Id });
    Assert(!wrongOwner.Succeeded, "Cancellation requires the order's matching member");
    await gateway.DeletePendingPayment(new PendingPaymentDeleteRequest
        { MemberId = member.Id, OrderId = cancelled.OrderId, MembershipPlanId = plan.Id });
    Assert((await gateway.GetPaymentStatus(cancelled.OrderId, member.Id))?.PaymentStatus == PaymentStatus.Cancelled,
        "Cancelled checkout retains its order for late notifications");
    await gateway.VerifyPayment(Notification(cancelled));
    Assert((await gateway.GetPaymentStatus(cancelled.OrderId, member.Id))?.PaymentStatus == PaymentStatus.Paid,
        "Late verified success after dismissal is recorded instead of lost");

    var failed = await Create(plan);
    var endBeforeFailure = (await db.MemberPayments.SingleAsync(p => p.MembershipId == member.Id)).MemberShipEndDate;
    await gateway.VerifyPayment(Notification(failed, status: -2));
    Assert((await gateway.GetPaymentStatus(failed.OrderId, member.Id))?.PaymentStatus == PaymentStatus.Cancelled
        && (await db.MemberPayments.SingleAsync(p => p.MembershipId == member.Id)).MemberShipEndDate == endBeforeFailure,
        "Failed gateway payment does not renew membership");

    var expiredMember = (await db.Memberships.FindAsync(member.Id))!;
    expiredMember.MembershipStatus = MembershipStatus.Blocked;
    expiredMember.DeviceFingerprintId1 = "test-fingerprint";
    await db.SaveChangesAsync();
    var reactivation = await Create(plan);
    await gateway.VerifyPayment(Notification(reactivation));
    Assert(expiredMember.MembershipStatus == MembershipStatus.Active, "Verified payment reactivates an expired enrolled member");

    await Reject(new PaymentGatewayRequest { MemberId = member.Id, MembershipPlanId = plan.Id, Amount = 1 }, "Tampered checkout price is rejected");
    plan = (await db.MembershipPlans.FindAsync(plan.Id))!;
    plan.IsActive = ActiveStatus.Inactive;
    await db.SaveChangesAsync();
    await Reject(new PaymentGatewayRequest { MemberId = member.Id, MembershipPlanId = plan.Id, Amount = plan.Price }, "Inactive plans cannot be paid online");

    var culture = CultureInfo.CurrentCulture;
    try
    {
        var expected = hash.GeneratePayHereHash("merchant", "secret", "order", 1234.56m, "LKR");
        CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo("de-DE");
        Assert(hash.GeneratePayHereHash("merchant", "secret", "order", 1234.56m, "LKR") == expected,
            "Gateway hashes use decimal points regardless of server culture");
    }
    finally { CultureInfo.CurrentCulture = culture; }
    Console.WriteLine("Gym gateway regression checks passed.");
}
finally { await transaction.RollbackAsync(); }

Task<PaymentGatewayResponse> Create(MembershipPlan selected) => gateway.ProcessPayment(new PaymentGatewayRequest
    { MemberId = member.Id, MembershipPlanId = selected.Id, Amount = selected.Price });
PaymentNotificationRequest Notification(PaymentGatewayResponse checkout, int status = 2, decimal? amount = null)
{
    var result = new PaymentNotificationRequest
    {
        MerchantId = options.MerchantId, OrderId = checkout.OrderId, PaymentId = "TEST-" + checkout.OrderId,
        PayhereAmount = amount ?? decimal.Parse(checkout.Amount, CultureInfo.InvariantCulture), PayhereCurrency = "LKR", StatusCode = status
    };
    result.Md5Sig = Sign(result);
    return result;
}
string Sign(PaymentNotificationRequest request) => hash.GenerateNotificationMd5Sig(request.MerchantId,
    options.MerchantSecret, request.OrderId, request.PayhereAmount, request.PayhereCurrency, request.StatusCode);
async Task Reject(PaymentGatewayRequest request, string message)
{
    try { await gateway.ProcessPayment(request); }
    catch (ArgumentException) { Assert(true, message); return; }
    throw new InvalidOperationException(message);
}
static void Assert(bool condition, string message)
{
    if (!condition) throw new InvalidOperationException(message);
    Console.WriteLine("PASS: " + message);
}
