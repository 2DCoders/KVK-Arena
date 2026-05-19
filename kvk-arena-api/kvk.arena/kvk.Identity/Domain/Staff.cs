namespace kvk.Identity.Domain;

public class Staff : BuildingBlocks.Common.User
{
    public ICollection<StaffRole> StaffRoles { get; set; } = new List<StaffRole>();

    public ICollection<StaffModule> StaffModules { get; set; } = new List<StaffModule>();
}
