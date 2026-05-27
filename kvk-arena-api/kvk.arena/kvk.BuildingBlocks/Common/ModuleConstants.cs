namespace kvk.BuildingBlocks.Common;

/// <summary>
/// Centralized module name constants across all KVK Arena modules.
/// </summary>
public static class ModuleConstants
{
    public const string Gym = "Gym";
    public const string CarWash = "CarWash";
    public const string BadmintonCourt = "BadmintonCourt";
    public const string GamingCenter = "GamingCenter";
    public const string Retail = "Retail";

    /// <summary>
    /// Returns all supported module names.
    /// </summary>
    public static ReadOnlySpan<string> GetAllModuleNames()
    {
        return new[] { Gym, CarWash, BadmintonCourt, GamingCenter, Retail };
    }
}

