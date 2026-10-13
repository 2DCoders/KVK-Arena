using kvk.BuildingBlocks.Enums;
using kvk.Saloon.Domain;

namespace kvk.Saloon.Features.Booking;

public class SaloonCollectPaymentRequest
{
    public PaymentType PaymentType { get; set; }
}

public class SaloonServiceStatusRequest
{
    public SaloonBookingStatus Status { get; set; }
}
