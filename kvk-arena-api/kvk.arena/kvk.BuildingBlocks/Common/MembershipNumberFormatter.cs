namespace kvk.BuildingBlocks.Common;

public static class MembershipNumberFormatter
{
    /// <summary>
    /// Format a display-only membership number. Accepts a member type name (e.g. "Client", "Trainer", "Staff").
    /// This formatter is cosmetic only; the persisted entity uses a GUID as the primary key.
    /// </summary>
    public static string Format(string memberTypeName, int year, string token = "0001")
    {
        var prefix = memberTypeName?.ToLowerInvariant() switch
        {
            "client" => "GYM-MEM",
            "trainer" => "GYM-TRA",
            "staff" => "GYM-STA",
            "tempMember" => "GYM-TMP",
            _ => "GYM-UNK"
        };

        // Example: GYM-MEM-20260001
        return $"{prefix}-{year}{token}";
    }
}


