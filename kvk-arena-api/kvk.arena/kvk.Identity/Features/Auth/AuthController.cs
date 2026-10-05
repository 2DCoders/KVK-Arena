using Microsoft.AspNetCore.Mvc;
using kvk.BuildingBlocks.Common;

namespace kvk.Identity.Features.Auth;

[ApiController]
[Route("api/identity-m/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService ?? throw new ArgumentNullException(nameof(authService));
    }

    /// <summary>
    /// Register a new staff member.
    /// </summary>
    [HttpPost("staff/register")]
    public async Task<IActionResult> Register([FromBody] AuthRegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _authService.RegisterAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        if (result.AdditionalData.TryGetValue("response", out var responseData) &&
            responseData is AuthResponse response)
            return CreatedAtAction(nameof(GetProfile), new { id = response.UserId }, result);

        return Ok(result);
    }

    /// <summary>
    /// Authenticate staff member and return token + permissions.
    /// </summary>
    [HttpPost("staff/login")]
    public async Task<IActionResult> Login([FromBody] AuthLoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get staff profile by ID.
    /// </summary>
    [HttpGet("me/{id:guid}")]
    public async Task<IActionResult> GetProfile(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _authService.GetProfileAsync(id, cancellationToken);

        if (!result.Succeeded)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Change staff password.
    /// </summary>
    [HttpPost("staff/change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _authService.ChangePasswordAsync(request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }


    [HttpGet("staff/list")]
    public async Task<IActionResult> GetAllStaff(CancellationToken cancellationToken = default)
    {
        var result = await _authService.GetAllStaffAsync(cancellationToken);
        return Ok(result);
    }

    //staff delete
    [HttpDelete("staff/{id:guid}")]
    public async Task<IActionResult> DeleteStaff(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _authService.DeleteStaffByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    //edit staff
    [HttpPut("staff/{id:guid}")]
    public async Task<IActionResult> EditStaff([FromBody] EditStaffRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _authService.EditStaffAsync(request, cancellationToken);
        return Ok(result);
    }
}