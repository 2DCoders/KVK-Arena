using kvk.Badminton.Domain;
using kvk.BuildingBlocks.Enums;
using Microsoft.AspNetCore.Http;

namespace kvk.Badminton.Features.CourtBookingTemporary;

public class CreateCourtBookingTemporaryRequest
{
    public Guid CourtId { get; set; }

    public DateTime StartDate { get; set; }

    public int NumberOfSlots { get; set; }

    public required List<Guid> SlotIds { get; set; }

    public required List<DaysOfWeek> DaysOfWeek { get; set; }

    public string MemberId { get; set; }

    public string? CouponCode { get; set; }

    public PaymentType PaymentType { get; set; }

    //optional when paymenttype is online payment
    public IFormFile? PaymentProof { get; set; }

    public bool IsHalfPayment { get; set; }

    public decimal Amount { get; set; }
}




