namespace kvk.Identity.Features.Auth;

public class EditStaffRequest
{
    public Guid Id { get; set; }
    
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    
    public string Status { get; set; } = string.Empty;
}