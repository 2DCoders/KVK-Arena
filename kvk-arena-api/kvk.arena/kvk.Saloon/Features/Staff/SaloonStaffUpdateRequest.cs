namespace kvk.Saloon.Features.Staff;

public class SaloonStaffUpdateRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Designation { get; set; }
    public bool IsActive { get; set; }
}
