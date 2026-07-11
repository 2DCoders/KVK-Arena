using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;
using Microsoft.AspNetCore.Http;

namespace kvk.Identity.Features.KvkMember;

public class KvkMemberRegisterRequest
{
    [MaxLength(50)]
    public required string FirstName { get; set; }

    [MaxLength(50)]
    public required string LastName { get; set; }

    [MaxLength(50)]
    public required string UserName { get; set; }

    [MaxLength(100)]
    public required string Email { get; set; }

    [MaxLength(25)]
    public string? Phone { get; set; }

    [MaxLength(256)]
    public required string PasswordHash { get; set; }

    [MaxLength(25)]
    public required string Status { get; set; }
    
    public Gender Gender { get; set; }
    
    public IFormFile? ProfilePicture { get; set; } 
    
    public string? NicNumber { get; set; }

}