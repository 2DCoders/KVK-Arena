using kvk.BuildingBlocks.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Identity.Features.OfferRate;

[ApiController]
[Route("api/identity/offer-rate")]
public class OfferRateController(IOfferRateService offerRateService, ICouponValidationService couponValidationService)
    : ControllerBase
{
    private readonly IOfferRateService _offerRateService = offerRateService;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var offerRates = await _offerRateService.GetOfferRateListAsync(cancellationToken);
        return Ok(offerRates);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var offerRate = await _offerRateService.GetOfferRateByIdAsync(id, cancellationToken);
            return Ok(offerRate);
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] OfferRateCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _offerRateService.CreateOfferRateAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = result.Errors });
        }

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] OfferRateUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _offerRateService.UpdateOfferRateAsync(id, request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = result.Errors });
        }

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var result = await _offerRateService.DeleteOfferRateAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = result.Errors });
        }

        return Ok(result);
    }

    //generate coupons or assign members offers 
    [HttpPost("assign-and-generate-coupons")]
    public async Task<IActionResult> GenerateOffers([FromForm] Guid offerRateId, [FromForm] List<Guid>? memberList,
        CancellationToken cancellationToken)
    {
        var result = await _offerRateService.AssignOfferRateToUserAsync(offerRateId, memberList, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = result.Errors });
        }

        return Ok(result);
    }

    [HttpGet("eligible-members")]
    public async Task<IActionResult> GetEligibleMembers([FromQuery] Guid? offerRateId = default,
        [FromQuery] Guid? memberId = default, CancellationToken cancellationToken = default)
    {
        var eligibleMembers = await _offerRateService.GetEligibleMembersAsync(offerRateId, memberId, cancellationToken);
        return Ok(eligibleMembers);
    }

    //module name eka badminton or gym kiyala ewpn @LordDaziya
    [HttpGet("validate-coupons")]
    public async Task<IActionResult> ValidateCoupons([FromQuery] Guid memberId, [FromQuery] string couponCode,
        [FromQuery] decimal originalAmount, [FromQuery] string moduleName,
        CancellationToken cancellationToken = default)
    {
        var result =
            await couponValidationService.ValidateAndCalculateDiscountAsync(memberId, couponCode, originalAmount,
                moduleName);
        if (!result.IsValid)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result);
    }
}