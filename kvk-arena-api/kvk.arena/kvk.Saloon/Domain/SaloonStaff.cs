using kvk.BuildingBlocks.Common;

namespace kvk.Saloon.Domain;

public class SaloonStaff : AuditableEntity
{
    
    public string Name { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Designation { get; set; }

    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<SaloonStaffService> StaffServices { get; set; }
        = new List<SaloonStaffService>();

    public virtual ICollection<SaloonBookingService> BookingServices { get; set; }
        = new List<SaloonBookingService>();

    public virtual ICollection<SaloonStaffSchedule> Schedules { get; set; }
        = new List<SaloonStaffSchedule>();
}