using Microsoft.AspNetCore.Mvc;

namespace kvk.Identity.Features;

[ApiController]
[ApiExplorerSettings(GroupName = "IdentityModule")]
public abstract class BaseIdentityModuleController : ControllerBase
{
    protected const string BaseApiPath = "api/identity-m";
}