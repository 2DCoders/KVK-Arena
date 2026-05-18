using Microsoft.AspNetCore.Mvc;

namespace kvk.Identity;

[ApiController]
[ApiExplorerSettings(GroupName = "IdentityModule")]
public abstract class BaseIdentityModuleController
{
    protected const string BaseApiPath = "api/identity-m";
}