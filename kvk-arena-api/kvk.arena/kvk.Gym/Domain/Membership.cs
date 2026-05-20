using kvk.BuildingBlocks.Common;
using kvk.Gym.Enums;

namespace kvk.Gym.Domain;

public class Membership : User
{
    /// <summary>
    /// Optional link to an Identity user when this membership is created from Identity (staff/trainer).
    /// </summary>
    public string? IdentityUserId { get; set; }

    public DateTime DateOfBirth { get; set; }
    
    public MemberType MemberType { get; set; }
    
    public Gender Gender { get; set; }

    public MembershipStatus MembershipStatus { get; set; } = MembershipStatus.Inactive;
    
    public MembershipPlan MembershipPlan { get; set; } = MembershipPlan.Monthly;
    
    public required string MembershipNumber { get; set; }
    // Display-only formatted string. Use MembershipNumberFormatter in BuildingBlocks to create a compatible value.
    
    // Device-provided fingerprint identifiers (no raw templates stored)
    public string? DeviceFingerprintId1 { get; set; }
    
    public string? DeviceFingerprintId2 { get; set; }
}