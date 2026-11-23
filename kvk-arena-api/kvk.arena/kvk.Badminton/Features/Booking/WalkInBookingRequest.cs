namespace kvk.Badminton.Features.Booking;

public record WalkInBookingRequest(List<Guid> HoldIds, string CustomerName, string PhoneNumber);

public record WalkInPaymentRequest(PaymentTypes PaymentType);
