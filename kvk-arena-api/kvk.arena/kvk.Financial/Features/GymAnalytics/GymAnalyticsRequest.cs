using System.ComponentModel.DataAnnotations;

namespace kvk.Financial.Features.GymAnalytics;

public class GymAnalyticsRequest
{
    // Accept dates as strings in format yyyy-MM-dd (e.g. 2026-05-21)
    [Required]
    [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "StartDate must be in format yyyy-MM-dd (e.g. 2026-05-21)")]
    public string StartDate { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "EndDate must be in format yyyy-MM-dd (e.g. 2026-05-21)")]
    public string EndDate { get; set; } = string.Empty;
}

