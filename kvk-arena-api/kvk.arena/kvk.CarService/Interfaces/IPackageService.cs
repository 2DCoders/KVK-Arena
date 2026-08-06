using kvk.BuildingBlocks.Common;
using kvk.CarService.Features.PackageService;

namespace kvk.CarService.Interfaces;

public interface IPackageService
{
    Task<Result> CreatePackageAsync(PackageCreateRequest request, CancellationToken cancellationToken = default);

    Task<Result> UpdatePackageAsync(PackageUpdateRequest request, CancellationToken cancellationToken = default);

    Task<Result> DeletePackageAsync(Guid packageId, CancellationToken cancellationToken = default);

    Task<List<PackageResponse>> GetPackagesAsync(Guid packageId = default, CancellationToken cancellationToken = default);

    Task<PackageResponse?> GetPackageByIdAsync(Guid packageId, CancellationToken cancellationToken = default);
    
    Task<CarWashAPackagesServicesCombineResponse> GetPackagesWithServicesAsync(CancellationToken cancellationToken = default);
}
