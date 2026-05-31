namespace kvk.BuildingBlocks.Common;

public class CalenderHolidays : AuditableEntity
{
    public string Year { get; set; } = string.Empty;
    
    public string Month { get; set; } = string.Empty;
    
    public string Day { get; set; } = string.Empty;
    public string? Description { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    // Indicates the record was created by an external import (e.g. ICS)
    public bool IsImported { get; set; }

    // Optional source of imported data (e.g. "officeholidays.com")
    public string? Source { get; set; } = string.Empty;

    // Duration in days (1 = single day)
    public int DurationDays { get; set; } = 1;
}


