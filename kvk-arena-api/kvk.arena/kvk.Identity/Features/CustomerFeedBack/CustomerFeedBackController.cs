using Microsoft.AspNetCore.Mvc;

namespace kvk.Identity.Features.CustomerFeedBack;

[ApiController]
[Route("api/identity/customer-feedback")]
public class CustomerFeedBackController : ControllerBase
{
    private readonly ICustomerFeedBackService _customerFeedBackService;

    public CustomerFeedBackController(ICustomerFeedBackService customerFeedBackService)
    {
        _customerFeedBackService = customerFeedBackService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CustomerFeedBackCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _customerFeedBackService.CreateCustomerFeedBackAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var feedBacks = await _customerFeedBackService.GetAllCustomerFeedBacksAsync(cancellationToken);
        return Ok(feedBacks);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var feedBack = await _customerFeedBackService.GetCustomerFeedBackByIdAsync(id, cancellationToken);
            return Ok(feedBack);
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }
}
