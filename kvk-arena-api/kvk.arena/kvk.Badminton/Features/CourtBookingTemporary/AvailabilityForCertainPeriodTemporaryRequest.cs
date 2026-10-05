namespace kvk.Badminton.Features.CourtBookingTemporary;

public class AvailabilityForCertainPeriodTemporaryRequest
{
    public required List<DaysOfWeek> DaysOfWeeks { get; set; }
    
    public  int FutureWeeksCountToCheck { get; set; }

    public DateTime StartDate { get; set; }
    
    public  Guid CourtId { get; set; }
    
}