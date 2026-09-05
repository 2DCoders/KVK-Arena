namespace kvk.Saloon.Features.Staff;

public class SaloonStaffCreateRequest
{
    public string Name { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Designation { get; set; }
    public bool IsActive { get; set; } = true;
}
