using kvk.BuildingBlocks.Enums;
using kvk.Saloon.Domain;

namespace kvk.Saloon.Features.Booking;

public class SaloonBookingResponse
{
    public Guid Id { get; set; }
    public Guid SaloonId { get; set; }
    public string? CustomerName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? MemberId { get; set; }
    public DateOnly BookingDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public SaloonBookingStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public List<SaloonBookingServiceResponse> Services { get; set; } = new();
    
    public PaymentType PaymentType { get; set; }
}

public class SaloonBookingServiceResponse
{
    public Guid Id { get; set; }
    public Guid SaloonBookingId { get; set; }
    public Guid SaloonServiceId { get; set; }
    public Guid SaloonStaffId { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public decimal DiscountAmount { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}
