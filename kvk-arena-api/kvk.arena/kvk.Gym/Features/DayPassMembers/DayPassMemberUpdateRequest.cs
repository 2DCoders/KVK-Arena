using kvk.Gym.Enums;

namespace kvk.Gym.Features.DayPassMembers;

public class DayPassMemberUpdateRequest
{
    public string? Name { get; set; }
    public string? MobileNumber { get; set; }
    public DateTime? Date { get; set; }
    public decimal? Amount { get; set; }
    public PaymentType? PaymentType { get; set; }
    public PaymentStatus? PaymentStatus { get; set; }
}

