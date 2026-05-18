using System.ComponentModel.DataAnnotations;

namespace kvk.BuildingBlocks.Common;

public class BaseEntity
{
    [Key]
    public Guid Id { get; set; }

    public Guid TenantId { get; set; }
}