using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace kvk.Gym.Domain;

public class SystemSetting
{
    public static readonly Guid SingletonId = Guid.Parse("7b06f7f7-4a17-45b2-9b7c-2f6f0b49b2e2");

    [Key]
    public Guid Id { get; set; } = SingletonId;
    
    [Column(TypeName = "timestamp without time zone")]
    public DateTime PreviousDayEnd { get; set; }
    
    [Column(TypeName = "timestamp without time zone")]
    public DateTime CurrentDay { get; set; }
    
    [Column(TypeName = "timestamp without time zone")]
    public DateTime NextWorkingDay { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? LastDayEndCheckedDate { get; set; }

    public bool IsDayEndCompleted { get; set; }
}