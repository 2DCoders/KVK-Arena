using Kvk.Cafe.Enums;
using Kvk.Cafe.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Cafe.Features.Menu;

[ApiController]
[Route("api/cafe/menu")]
public class MenuController(IMenuService menuService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] MenuCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await menuService.CreateMenuAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromForm] MenuUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await menuService.UpdateMenuAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await menuService.DeleteMenuAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<MenuResponse>>> Get(CancellationToken cancellationToken = default)
    {
        var menus = await menuService.GetMenusAsync(cancellationToken);
        return Ok(menus);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MenuResponse>> GetById(Guid id,
        CancellationToken cancellationToken = default)
    {
        var menu = await menuService.GetMenuByIdAsync(id, cancellationToken);
        return Ok(menu);
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<List<MenuResponse>>> GetByCategory(MenuCategory category,
        CancellationToken cancellationToken = default)
    {
        var menus = await menuService.GetMenuByCategoryAsync(category, cancellationToken);
        return Ok(menus);
    }
}