// using kvk.BuildingBlocks.Common;
// using kvk.Gaming.Interfaces;
// using Microsoft.AspNetCore.Mvc;
//
// namespace kvk.Gaming.Features.GamingStationGameMapping;
//
// [ApiController]
// [Route("api/gaming-m/gaming-station-game-mappings")]
// public class GamingStationGameMappingController : ControllerBase
// {
//     private readonly IGamingStationGameMappingService _service;
//
//     public GamingStationGameMappingController(IGamingStationGameMappingService service)
//     {
//         _service = service ?? throw new ArgumentNullException(nameof(service));
//     }
//
//     [HttpPost("assign-games")]
//     public async Task<IActionResult> AssignGamesToGamingStation([FromBody] AssignGamesToGamingStationRequest request, CancellationToken cancellationToken = default)
//     {
//         var result = await _service.AssignGamesToGamingStationAsync(request, cancellationToken);
//
//         if (!result.Succeeded)
//             return BadRequest(result);
//
//         return Ok(result);
//     }
//
//     [HttpPut("replace-games")]
//     public async Task<IActionResult> ReplaceGamesForGamingStation([FromBody] ReplaceGamesForGamingStationRequest request, CancellationToken cancellationToken = default)
//     {
//         var result = await _service.ReplaceGamesForGamingStationAsync(request, cancellationToken);
//
//         if (!result.Succeeded)
//             return BadRequest(result);
//
//         return Ok(result);
//     }
//
//     [HttpDelete("remove-game")]
//     public async Task<IActionResult> RemoveGameFromGamingStation([FromBody] RemoveGameFromGamingStationRequest request, CancellationToken cancellationToken = default)
//     {
//         var result = await _service.RemoveGameFromGamingStationAsync(request, cancellationToken);
//
//         if (!result.Succeeded)
//             return BadRequest(result);
//
//         return Ok(result);
//     }
//
//     [HttpGet("by-station/{gamingStationId:guid}")]
//     public async Task<ActionResult<List<GamingStationGameMappingResponse>>> GetGamesByGamingStation(Guid gamingStationId, CancellationToken cancellationToken = default)
//     {
//         var result = await _service.GetGamesByGamingStationAsync(gamingStationId, cancellationToken);
//         return Ok(result);
//     }
//
//     [HttpGet("by-game/{gameId:guid}")]
//     public async Task<ActionResult<List<GamingStationGameMappingResponse>>> GetGamingStationsByGame(Guid gameId, CancellationToken cancellationToken = default)
//     {
//         var result = await _service.GetGamingStationsByGameAsync(gameId, cancellationToken);
//         return Ok(result);
//     }
// }