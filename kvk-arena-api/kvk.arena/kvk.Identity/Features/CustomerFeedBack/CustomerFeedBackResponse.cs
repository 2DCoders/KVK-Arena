namespace kvk.Identity.Features.CustomerFeedBack;

public class CustomerFeedBackResponse
{
    public Guid Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    
    public required string Email { get; set; }
    
    public string? Phone { get; set; }
    
    public required string FeedBack { get; set; }
    
}