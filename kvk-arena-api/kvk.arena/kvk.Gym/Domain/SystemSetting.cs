using System.ComponentModel.DataAnnotations;

namespace kvk.Gym.Domain;

public class SystemSetting
{
    [Key]
    public Guid Id { get; set; }
    
    public DateTime PreviousDayEnd { get; set; }
    
    public DateTime CurrentDay { get; set; }
    
    public DateTime NextWorkingDay { get; set; }
}