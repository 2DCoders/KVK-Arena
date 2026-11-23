using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using kvk.Badminton.Features.MemberBooking;
using kvk.Badminton.Features.CourtBookingTemporary;
using kvk.Badminton.Domain;
using kvk.Badminton.Enums;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Constants;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

var checks = 0;
void Assert(bool value, string message) { if (!value) throw new Exception(message); checks++; }
var start = new DateOnly(2027, 1, 1);
Assert(MemberSchedule.EndDate(start, 12) == new DateOnly(2027, 3, 25), "End date must be inclusive.");
var dates = MemberSchedule.Dates(start, 12, [DaysOfWeek.Monday, DaysOfWeek.Friday]);
Assert(dates.Count == 24, "Two weekdays for 12 weeks must produce 24 exact booking dates.");
Assert(dates.All(d => d >= start && d <= MemberSchedule.EndDate(start, 12)), "Sessions must stay inside the booking period.");
Assert(dates.All(d => d.DayOfWeek is DayOfWeek.Monday or DayOfWeek.Friday), "Only selected weekdays may be booked.");
Assert(MemberSchedule.EndDate(new DateOnly(2028, 2, 26), 1) == new DateOnly(2028, 3, 3), "Leap day must be included.");
Assert(MemberSchedule.Dates(start, 1, [DaysOfWeek.Friday]).Single() == start, "A matching start day must be booked.");
Assert(ReservationCouponPricing.Discount([100m, 200m, 300m], 50m, 2) == 150m, "Coupon cap must use actual slot prices.");
Assert(ReservationCouponPricing.Discount([100m, 200m], 100m, 20) == 300m, "A full coupon can cover all selected slots.");
Assert(ReservationCouponPricing.Discount([100m], 0m, 20) == 0m, "An eligible unused coupon can have zero badminton discount.");
Assert(ReservationCouponPricing.Discount([100m], 200m, 20) == 100m, "Discount cannot exceed the full price.");
Assert(ReservationCouponPricing.Discount([.01m], 50m, 20) == .01m, "Coupon amounts must round consistently.");
foreach (var discount in new[] { 0m, .01m, 100m, 300m }) {
  var amounts = MemberSchedule.Amounts([100m, 100m, 100m], discount);
  Assert(amounts.Sum() == 300m - discount && amounts.All(a => a >= 0), "Booking rows must sum exactly to the discounted total.");
}
Assert(MemberSchedule.Amounts([0m, 0m], 0m).Sum() == 0m, "Free configured slots must not divide by zero.");
var request = new MemberConfirmRequest { HoldToken = Guid.NewGuid(), CustomerName = "Test", Email = "test@example.com", PhoneNumber = "0771234567", CouponCode = "" };
var errors = new List<ValidationResult>();
Assert(!Validator.TryValidateObject(request, new ValidationContext(request), errors, true), "A coupon must be required at confirmation.");
request.CouponCode = "UNUSED";
errors.Clear();
Assert(Validator.TryValidateObject(request, new ValidationContext(request), errors, true), "Customer details and coupon are sufficient without a member ID.");
request.PhoneNumber = "invalid";
errors.Clear();
Assert(!Validator.TryValidateObject(request, new ValidationContext(request), errors, true), "Invalid customer phone numbers must be rejected.");


var options = new kvk.BuildingBlocks.PayHereOptions { MerchantId = "merchant", MerchantSecret = "test-secret", Currency = "LKR" };
var hashes = new kvk.BuildingBlocks.Services.HashService();
var notification = new PaymentNotificationRequest { MerchantId = "merchant", OrderId = "MBR-order", PayhereAmount = 900m, PayhereCurrency = "LKR", StatusCode = 2 };
notification.Md5Sig = hashes.GenerateNotificationMd5Sig(notification.MerchantId, options.MerchantSecret, notification.OrderId, notification.PayhereAmount, notification.PayhereCurrency, notification.StatusCode);
Assert(MemberPaymentSecurity.Verify(notification, options, hashes, "MBR-order", 900m, "LKR"), "Matching signed payment must verify.");
Assert(!MemberPaymentSecurity.Verify(notification, options, hashes, "another-order", 900m, "LKR"), "A signature for another order must not confirm this booking.");
Assert(!MemberPaymentSecurity.Verify(notification, options, hashes, "MBR-order", 901m, "LKR"), "A mismatched paid amount must not confirm this booking.");
Assert(!MemberPaymentSecurity.Verify(notification, options, hashes, "MBR-order", 900m, "USD"), "A mismatched currency must not confirm this booking.");
notification.StatusCode = -1;
Assert(!MemberPaymentSecurity.Verify(notification, options, hashes, "MBR-order", 900m, "LKR"), "A tampered status must invalidate the signature.");
notification.StatusCode = 2;
notification.Md5Sig = "forged";
Assert(!MemberPaymentSecurity.Verify(notification, options, hashes, "MBR-order", 900m, "LKR"), "Unsigned browser claims must not confirm payment.");
Assert(typeof(MemberBadmintonBookingController).GetMethod("Confirm") is null, "There must be no public unpaid booking confirmation endpoint.");
var cashier = new CashierMemberConfirmRequest { HoldToken = Guid.NewGuid(), CustomerName = "Cash customer", PhoneNumber = "0771234567", CouponCode = "UNUSED", PaymentType = 1 };
foreach (var method in new[] { 1, 2 }) {
    cashier.PaymentType = method;
    Assert(Validator.TryValidateObject(cashier, new ValidationContext(cashier), new List<ValidationResult>(), true), "Cash and Card must confirm without an email, gateway, or member ID.");
}
foreach (var method in new[] { 0, 3, -1 }) {
    cashier.PaymentType = method;
    Assert(!Validator.TryValidateObject(cashier, new ValidationContext(cashier), new List<ValidationResult>(), true), "Only Cash and Card are permitted.");
}
cashier.PaymentType = 1;
cashier.CouponCode = "";
Assert(Validator.TryValidateObject(cashier, new ValidationContext(cashier), new List<ValidationResult>(), true), "A promotion can be confirmed without a coupon.");
cashier.CouponCode = "UNUSED";
cashier.PhoneNumber = "invalid";
Assert(!Validator.TryValidateObject(cashier, new ValidationContext(cashier), new List<ValidationResult>(), true), "Cashier confirmation must validate the customer phone.");
foreach (var method in new[] { "CashierConfirm", "CashierAvailability", "CashierQuote" }) {
    Assert(typeof(MemberBadmintonBookingController).GetMethod(method)!.IsDefined(typeof(Microsoft.AspNetCore.Authorization.AuthorizeAttribute), true), "Cashier endpoints must require authentication.");
}
foreach (var method in new[] { "CashierSlips", "HoldForCashierSlip", "UploadCashierSlip", "DownloadCashierSlip", "ApproveCashierSlip" })
{
    var authorization = typeof(MemberBadmintonBookingController).GetMethod(method)!
        .GetCustomAttributes(typeof(Microsoft.AspNetCore.Authorization.AuthorizeAttribute), true)
        .Cast<Microsoft.AspNetCore.Authorization.AuthorizeAttribute>().Single();
    Assert(authorization.Policy == ModuleConstants.BadmintonSpecialBookingsPermission, "Staff slip endpoints require the Badminton permission.");
}
var slipHold = new CashierCustomerRequest { ExpectedAmount = 2000 };
Assert(!Validator.TryValidateObject(slipHold, new ValidationContext(slipHold), new List<ValidationResult>(), true), "Slip holds require customer details.");
slipHold.CustomerName = "Test customer";
slipHold.PhoneNumber = "0771234567";
Assert(Validator.TryValidateObject(slipHold, new ValidationContext(slipHold), new List<ValidationResult>(), true), "A valid name and phone satisfy slip hold validation.");
var slipHoldStart = new DateTime(2027, 1, 1, 8, 0, 0, DateTimeKind.Utc);
var slipHoldDeadline = slipHoldStart.AddHours(12);
var slipRevision = Guid.NewGuid();
Assert(MemberBadmintonBookingController.CashierSlipStatus(false, null, slipHoldDeadline, slipHoldStart) == "awaiting_slip", "An unexpired hold without a slip is not ready for approval.");
Assert(MemberBadmintonBookingController.CashierSlipStatus(false, slipRevision, slipHoldDeadline, slipHoldStart) == "ready", "An uploaded slip can be approved during the hold.");
Assert(MemberBadmintonBookingController.CashierSlipStatus(false, slipRevision, slipHoldDeadline, slipHoldDeadline) == "expired", "A slip does not extend the twelve-hour deadline.");
Assert(MemberBadmintonBookingController.CashierSlipStatus(true, slipRevision, slipHoldDeadline, slipHoldDeadline.AddHours(1)) == "approved", "Approved bookings remain confirmed after the original deadline.");
var configuredCouponId = Guid.NewGuid();
var discountSettings = CashierDiscountSettings.Parse("""
window.env = {
  SPECIAL_BOOKING_DISCOUNTS: {
    "couponCodeId": "COUPON_ID",
    "promotionStartDate": "2027-01-01",
    "promotionEndDate": "2027-01-03",
    "promotionPercentage": 20,
    "promotionMaximumSlots": 2
  },
  API_URL: "unused"
};
""".Replace("COUPON_ID", configuredCouponId.ToString()));
Assert(discountSettings.CouponLimit.MaximumSlots(configuredCouponId, Guid.NewGuid(), 48) == 10, "The configured coupon ID is capped at ten sessions.");
var issuedCouponId = Guid.NewGuid();
var campaignSlotLimit = discountSettings.CouponLimit.MaximumSlots(issuedCouponId, configuredCouponId, 96);
Assert(campaignSlotLimit == 10, "Coupons issued under the configured offer rate are capped at ten sessions.");
Assert(ReservationCouponPricing.Discount(Enumerable.Repeat(2000m, 96).ToArray(), 20, campaignSlotLimit) == 4000m,
    "A 20 percent campaign coupon discounts only ten of 96 equally priced slots.");
Assert(discountSettings.CouponLimit.MaximumSlots(issuedCouponId, configuredCouponId, 4) == 4, "A short campaign booking discounts only its booked slots.");
Assert(discountSettings.CouponLimit.MaximumSlots(issuedCouponId, Guid.NewGuid(), 48) == 48, "All other cashier coupons can discount the full booking.");
decimal[] testPrices = [100, 200, 300];
var promotion = discountSettings.Price(testPrices, new DateOnly(2027, 1, 3));
Assert(promotion.IsPromotion && promotion.PromotionSlotCount == 2 && promotion.PromotionDiscount == 60, "The promotion applies on its inclusive end date and respects its slot limit.");
Assert(!discountSettings.Price(testPrices, new DateOnly(2027, 1, 4)).IsPromotion, "Promotion ends after its configured last day.");
Assert(!discountSettings.Price(testPrices, new DateOnly(2026, 12, 31)).IsPromotion, "Promotion is inactive before its configured first day.");
Assert((discountSettings with { PromotionMaximumSlots = -1 }).Price(testPrices, start).PromotionDiscount == 120, "An unlimited promotion discounts every slot.");
var combined = promotion.WithCoupon(new CouponValidationResult { DiscountAmount = 40, DiscountedSlotCount = 1 });
Assert(combined.Amounts.SequenceEqual(new decimal[] { 40, 160, 300 }) && combined.FinalAmount == 500, "A coupon stacks on the post-promotion prices, within its own slot limit.");
var multiCourt = new MemberScheduleRequest { CourtIds = [Guid.NewGuid(), Guid.NewGuid()] };
var httpContext = new DefaultHttpContext();
var controller = new MemberBadmintonBookingController(null!, null!, null!, null!, null!, null!, null!)
{
    ControllerContext = new ControllerContext { HttpContext = httpContext }
};
Assert(await controller.CheckAvailability(multiCourt, default) is UnauthorizedResult, "Public callers must not check multiple courts.");
Assert(await controller.Hold(multiCourt, default) is UnauthorizedResult, "Public callers must not hold multiple courts.");
httpContext.User = new ClaimsPrincipal(new ClaimsIdentity([], "test-auth"));
Assert(await controller.CheckAvailability(multiCourt, default) is ForbidResult, "Multi-court availability requires the Badminton staff permission.");
Assert(await controller.Hold(multiCourt, default) is ForbidResult, "Multi-court holds require the Badminton staff permission.");
var period = new CashierAvailabilityRequest { StartDate = start, Weeks = 12, DaysOfWeek = [DaysOfWeek.Monday] };
Assert(Validator.TryValidateObject(period, new ValidationContext(period), new List<ValidationResult>(), true), "Availability browsing must not require selected slot IDs.");
// Availability must include every requested date, even when no slots are free.
var monday = new DateOnly(2027, 1, 4);
var recurringDates = MemberSchedule.Dates(monday, 3, [DaysOfWeek.Monday]);
Assert(recurringDates.SequenceEqual(new[] { monday, monday.AddDays(7), monday.AddDays(14) }), "Availability dates must match the real weekday without shifting by a day.");
Assert(MemberAvailability.BlocksDate(monday, monday, 1, DayOfWeek.Monday), "Legacy reservations block a matching start day.");
Assert(!MemberAvailability.BlocksDate(monday.AddDays(7), monday, 1, DayOfWeek.Monday), "Legacy reservations must not block the first day after their inclusive end date.");
Assert(!MemberAvailability.BlocksDate(monday.AddDays(-7), monday, 1, DayOfWeek.Monday), "Legacy reservations must not block dates before their start.");
Assert(!MemberAvailability.BlocksDate(monday.AddDays(1), monday, 1, DayOfWeek.Monday), "Legacy reservations only block their chosen weekday.");
Assert(MemberAvailability.BlocksDate(new DateOnly(2028, 2, 29), new DateOnly(2028, 2, 26), 1, DayOfWeek.Tuesday), "Legacy reservations must include matching leap-day sessions.");
Assert(!MemberAvailability.BlocksDate(monday, monday, 0, DayOfWeek.Monday), "Invalid legacy durations must not block slots.");
var slotA = new kvk.Badminton.Domain.CourtSlot { Id = Guid.NewGuid(), StartTime = new TimeOnly(8, 0), EndTime = new TimeOnly(9, 0) };
var slotB = new kvk.Badminton.Domain.CourtSlot { Id = Guid.NewGuid(), StartTime = new TimeOnly(9, 0), EndTime = new TimeOnly(10, 0) };
var slotC = new kvk.Badminton.Domain.CourtSlot { Id = Guid.NewGuid(), StartTime = new TimeOnly(10, 0), EndTime = new TimeOnly(11, 0) };
var occupancy = new Dictionary<(Guid, DateOnly), string> { [(slotA.Id, monday)] = "booked", [(slotA.Id, monday.AddDays(7))] = "held" };
foreach (var date in recurringDates) occupancy[(slotC.Id, date)] = "booked";
var matrix = MemberAvailability.Slots(recurringDates, [slotC, slotB, slotA], new DateTime(2027, 1, 1), occupancy);
Assert(matrix.Select(slot => slot.SlotId).SequenceEqual(new[] { slotA.Id, slotB.Id, slotC.Id }), "Availability must sort slots chronologically.");
Assert(matrix[0].AvailableCount == 1 && matrix[0].TotalCount == 3 && !matrix[0].AvailableEveryWeek, "A slot free once out of three weeks is only partly available.");
Assert(matrix[0].Sessions.Select(session => session.Status).SequenceEqual(new[] { "booked", "held", "available" }), "Date details must distinguish bookings, active holds, and free sessions.");
Assert(matrix[1].AvailableEveryWeek && matrix[1].AvailableCount == 3, "Only a slot free on every requested date may be recommended for a recurring booking.");
Assert(matrix[2].AvailableCount == 0 && matrix[2].Sessions.Count == 3, "Fully booked slots and dates must remain visible rather than disappearing from results.");
Assert(MemberAvailability.Status(monday, slotB.Id, slotB.StartTime, new DateTime(2027, 1, 4, 9, 0, 0), occupancy) == "past", "Sessions starting now must not appear available.");
Assert(MemberAvailability.Status(monday, slotB.Id, slotB.StartTime, new DateTime(2027, 1, 4, 8, 59, 0), occupancy) == "available", "A future session today remains available.");
Assert(MemberAvailability.Status(monday, slotB.Id, slotB.StartTime, new DateTime(2027, 1, 5), occupancy) == "past", "Past dates must not appear available.");
Assert(MemberAvailability.Slots([], [slotA], new DateTime(2027, 1, 1), occupancy)[0].AvailableEveryWeek == false, "An empty window must never be advertised as free every week.");

var paymentStarted = new DateTime(2027, 1, 1, 12, 0, 0);
var paymentDeadline = paymentStarted.AddHours(24);
var paymentHolds = new[]
{
    new BookingHold { CourtSlotId = slotA.Id, BookingDate = monday, Status = BookingHoldStatus.Pending, ExpiresAt = paymentDeadline },
    new BookingHold { CourtSlotId = slotB.Id, BookingDate = monday, Status = BookingHoldStatus.Pending, ExpiresAt = DateTime.MaxValue },
    new BookingHold { CourtSlotId = slotC.Id, BookingDate = monday, Status = BookingHoldStatus.Released, ExpiresAt = paymentDeadline }
}.AsQueryable();
foreach (var (now, expectedStatus) in new[]
{
    (paymentDeadline.AddSeconds(-1), "held"),
    (paymentDeadline, "available"),
    (paymentDeadline.AddSeconds(1), "available")
})
{
    var activeHolds = MemberAvailability.ActiveHolds(paymentHolds, now)
        .ToDictionary(hold => (hold.CourtSlotId, hold.BookingDate), _ => "held");
    var availability = MemberAvailability.Slots([monday], [slotA, slotB, slotC], now, activeHolds);
    Assert(availability[0].Sessions.Single().Status == expectedStatus, "An unpaid future session must reopen at the 24-hour cutoff.");
    Assert(availability[1].Sessions.Single().Status == "held", "A session awaiting slip approval must stay held beyond the cutoff.");
    Assert(availability[2].Sessions.Single().Status == "available", "Released holds must never block availability.");
}
var offer = MemberBadmintonOffer.FromConfiguration(new ConfigurationBuilder().AddInMemoryCollection(
    new Dictionary<string, string?> {
        ["MemberBadmintonBooking:OfferStartDate"] = "2026-11-19",
        ["MemberBadmintonBooking:OfferDays"] = "7"
    }).Build());
var offerCutoff = new DateTime(2026, 11, 25, 18, 30, 0, DateTimeKind.Utc);
Assert(offer.LastDay == new DateOnly(2026, 11, 25), "A seven-day offer must include its start date.");
Assert(!offer.IsExpired(offerCutoff.AddSeconds(-1)), "The offer must be open through the end of its last day in Sri Lanka.");
Assert(offer.IsExpired(offerCutoff), "The offer must expire at midnight in Sri Lanka.");
var couponSms = MessageList.GetKvkMemberCouponCodeMessage("Dasun", "#TEST", offer);
Assert(couponSms.StartsWith("Hi Dasun,\n\n") &&
       couponSms.Contains("Your coupon code: #TEST\n\n") &&
       couponSms.Contains("- Expires on 25 November 2026\n\n"),
    "The coupon SMS must include the member's code and the configured expiry.");
Console.WriteLine($"Passed {checks} member badminton booking checks.");
