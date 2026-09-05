using kvk.BuildingBlocks.Common;

namespace kvk.Saloon.Domain;

public class SaloonStaffService : AuditableEntity
{
    public Guid SaloonStaffId { get; set; }

    public Guid SaloonServiceId { get; set; }

    public virtual SaloonStaff Staff { get; set; } = null!;

    public virtual SaloonService Service { get; set; } = null!;
}