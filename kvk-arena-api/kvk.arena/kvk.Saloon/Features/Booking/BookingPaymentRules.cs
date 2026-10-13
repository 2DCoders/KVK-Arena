using kvk.BuildingBlocks.Enums;
using kvk.Saloon.Domain;

namespace kvk.Saloon.Features.Booking;

internal static class BookingPaymentRules
{
    public static bool CanChangeServiceStatus(SaloonBookingStatus current, SaloonBookingStatus next) =>
        (current == SaloonBookingStatus.Confirmed && next == SaloonBookingStatus.InProgress) ||
        (current == SaloonBookingStatus.InProgress && next == SaloonBookingStatus.Completed);

    public static bool CanCollectPayment(SaloonBookingStatus status, bool isPaid, PaymentType method) =>
        status == SaloonBookingStatus.Completed && !isPaid &&
        method is PaymentType.Cash or PaymentType.CreditCard or PaymentType.DebitCard;
}
