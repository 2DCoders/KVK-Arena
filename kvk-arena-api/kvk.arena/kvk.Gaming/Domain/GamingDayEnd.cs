using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace kvk.Gaming.Domain;

public class GamingDayEnd
{
    [Key]
    public int Id { get; set; }
    
    [Column(TypeName = "timestamp without time zone")]
    public DateTime CurrentDate { get; set; }
    
    [Column(TypeName = "numeric(18,2)")]
    public decimal ExpectedCashTotal { get; set; }

    [Column(TypeName = "numeric(18,2)")]
    public decimal ActualCashCount { get; set; }

    [Column(TypeName = "numeric(18,2)")]
    public decimal Discrepancy { get; set; }

    [Required]
    public string? Remark { get; set; } = string.Empty;

    [Column(TypeName = "numeric(18,2)")]
    public decimal HoldForNextDay { get; set; }
    
    [Column(TypeName = "numeric(18,2)")]
    public decimal CashFromPrevDay { get; set;}
}