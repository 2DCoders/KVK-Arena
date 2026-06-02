using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Identity.Controllers;

[ApiController]
[Route("api/identity/holidays")]
public class HolidaysController : ControllerBase
{
    private readonly IHolidayService _holidayService;

    public HolidaysController(IHolidayService holidayService)
    {
        _holidayService = holidayService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int year)
    {
        if (year <= 0) return BadRequest("Year is required");
        var list = await _holidayService.GetHolidaysAsync(year);
        return Ok(list);
    }

    [HttpPost("import")]
    public async Task<IActionResult> Import([FromQuery] int year)
    {
        if (year <= 0) return BadRequest("Year is required");

        try
        {
            await _holidayService.ImportIcsForYearAsync(year);
            var result = await _holidayService.GetHolidaysAsync(year);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CalenderHolidays dto)
    {
        var created = await _holidayService.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { year = int.Parse(created.Year) }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] CalenderHolidays dto)
    {
        try
        {
            await _holidayService.UpdateAsync(id, dto);
            return Ok();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        await _holidayService.DeleteAsync(id);
        return NoContent();
    }
}

