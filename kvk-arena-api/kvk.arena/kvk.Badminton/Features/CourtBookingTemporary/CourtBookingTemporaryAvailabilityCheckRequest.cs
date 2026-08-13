using System.Text.Json.Serialization;

namespace kvk.Badminton.Features.CourtBookingTemporary;

public class CourtBookingTemporaryAvailabilityCheckRequest
{
    public Guid CourtId { get; set; }

    public DateTime StartDate { get; set; }

    public int NumberOfSlots { get; set; }

    public required List<Guid> SlotIds { get; set; }

    public required List<DaysOfWeek> DaysOfWeek { get; set; }
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum DaysOfWeek
{
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday
}