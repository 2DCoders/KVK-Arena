using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace kvk.Badminton.Domain;

public class BadmintonDayEnd
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
    public string? Remark { get; set; } = string.Empty; // Changed from Notes to Remark to match the request

    [Column(TypeName = "numeric(18,2)")]
    public decimal HoldForNextDay { get; set; }
    
    [Column(TypeName = "numeric(18,2)")]
    public decimal CashFromPrevDay { get; set;}
    // Add other properties relevant to Badminton DayEnd if needed
}