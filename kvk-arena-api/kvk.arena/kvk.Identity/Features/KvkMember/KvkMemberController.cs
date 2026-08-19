using Microsoft.AspNetCore.Mvc;

namespace kvk.Identity.Features.KvkMember;

[ApiController]
[Route("api/identity/members")]
public class KvkMemberController(IKvkMemberService kvkMemberService) : ControllerBase
{
    private readonly IKvkMemberService _kvkMemberService = kvkMemberService;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromForm] KvkMemberRegisterRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _kvkMemberService.RegisterAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var members = await _kvkMemberService.GetMembersAsync(cancellationToken);
        return Ok(members);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var member = await _kvkMemberService.GetMemberByIdAsync(id, cancellationToken);
            return Ok(member);
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var result = await _kvkMemberService.DeleteMemberAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = result.Errors });
        }
        return Ok(result);
    }

    [HttpPost("pay")]
    public async Task<IActionResult> RecordAsPaid([FromBody] MemberPayRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _kvkMemberService.RecordMemberAsPaidAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = result.Errors });
        }
        return Ok(result);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> ActiveOrDeactivateMember([FromRoute] Guid id, [FromQuery] bool isActive,
        CancellationToken cancellationToken)
    {
        var result = await _kvkMemberService.ActiveOrDeactivateMemberAsync(id, isActive, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = result.Errors });
        }
        return Ok(result);
    }
    
    [HttpPost("send-sms-coupon-code-bulk")]
    public async Task<IActionResult> SendSmsCouponCodeBulk(CancellationToken cancellationToken)
    {
        var result = await _kvkMemberService.SendSmsCouponCodeBulkAsync(cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = result.Errors });
        }
        return Ok(result);
    }


    [HttpPost("send-sms-coupon-code-single")]
    public async Task<IActionResult> SendSmsCouponCodeSingle([FromForm] string memberId,
        CancellationToken cancellationToken)
    {
        var result = await _kvkMemberService.SendSmsCouponCodeSingleAsync(memberId, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = result.Errors });
        }

        return Ok(result);
    }

}