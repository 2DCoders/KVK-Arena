using kvk.Badminton.Features.CourtSlotConfiguration;
using kvk.BuildingBlocks.Common;
using kvk.Gaming.Features.GamingSlotGeneration;

namespace kvk.Gaming.Interfaces;

public interface IGamingSlotGenerationService
{
    Task<Result> GenerateSlotsForGamingCategoryeAsync(GamingCategorySlotConfigurationRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(GamingSlotGenerationConfigurationUpdateRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<GameSlotResponse>> GetByStationCategoryIdAndDate(Guid stationId, Guid categoryId, DateOnly date, CancellationToken cancellationToken = default);

}

public class GameSlotResponse
{
    public Guid Id { get; set; }
    public Guid StationId { get; set; }
    public Guid CategoryId { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public bool IsActive { get; set; }
    public decimal Price { get; set; }
    public bool IsBooked { get; set; } // Added IsBooked property
    public DateTime CreatedAt { get; set; }
    public DateTime? LastModifiedAt { get; set; }
}
