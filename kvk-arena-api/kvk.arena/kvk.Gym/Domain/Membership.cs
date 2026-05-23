using System.ComponentModel.DataAnnotations;
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
    
    public Guid? MembershipPlanId { get; set; }
    public MembershipPlan? MembershipPlan { get; set; }
    
    public required string MembershipNumber { get; set; }
    // Display-only formatted string. Use MembershipNumberFormatter in BuildingBlocks to create a compatible value.
    
    [MaxLength(4)]
    public int Otp { get; set; }
    
    // Device-provided fingerprint identifiers (no raw templates stored)
    public string? DeviceFingerprintId1 { get; set; }
    
    public string? DeviceFingerprintId2 { get; set; }

    // Soft-delete support
    /// <summary>
    /// Marks a membership as soft-deleted. Soft-deleted records should be excluded from normal queries.
    /// </summary>
    public bool IsDeleted { get; set; }

    /// <summary>
    /// Timestamp indicating when the membership was soft-deleted. Null when not deleted.
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    // Navigation collections for cascade-delete configuration
    public ICollection<MemberPayment> MemberPayments { get; set; } = new List<MemberPayment>();

    public ICollection<MemberAttendance> MemberAttendances { get; set; } = new List<MemberAttendance>();
}