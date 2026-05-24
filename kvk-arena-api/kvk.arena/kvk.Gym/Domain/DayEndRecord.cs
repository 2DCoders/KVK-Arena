using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace kvk.Gym.Domain;

/// <summary>
/// EF entity persisted in the gym schema to store day-end cash reconciliation records.
/// </summary>
public class DayEndRecord
{
	[Key]
	public Guid Id { get; set; } = Guid.NewGuid();

	// business date the record belongs to
	public DateTime CurrentDate { get; set; }

	public DateTime NextWorkingDate { get; set; }

	[Column(TypeName = "numeric(18,2)")]
	public decimal CashFromPrevDay { get; set; }

	[Column(TypeName = "numeric(18,2)")]
	public decimal ExpectedCashTotal { get; set; }

	[Column(TypeName = "numeric(18,2)")]
	public decimal ActualCashCount { get; set; }

	[Column(TypeName = "numeric(18,2)")]
	public decimal Discrepancy { get; set; }

	[Required]
	public string Remark { get; set; } = string.Empty;

	[Column(TypeName = "numeric(18,2)")]
	public decimal HoldForNextDay { get; set; }

	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


