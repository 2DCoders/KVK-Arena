using kvk.BuildingBlocks.Common;
using kvk.Gym.Domain;
using kvk.Gym.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gym.Features.Payments;

[Authorize(Policy = ModuleConstants.GymStaffPolicy)]
[ApiController]
[Route("api/gym/payments/{id:guid}/receipt")]
public class PaymentReceiptsController(GymDbContext db) : ControllerBase
{
    private const int MaximumBytes = GymPaymentReceipt.MaximumBytes;

    [HttpPut]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaximumBytes + 65536)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaximumBytes)]
    public async Task<IActionResult> Upload(Guid id, [FromQuery] bool dayPass, IFormFile receipt, CancellationToken ct)
    {
        if (receipt.Length is < 1 or > MaximumBytes)
            return BadRequest(new { message = "Choose a PDF, PNG or JPEG receipt up to 5 MB." });
        using var stream = new MemoryStream();
        await receipt.CopyToAsync(stream, ct);
        var document = stream.ToArray();
        var type = GymPaymentReceipt.DetectContentType(document);
        if (type is null) return BadRequest(new { message = "Choose a valid PDF, PNG or JPEG receipt." });

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({id.ToString()}, 73040501))", ct);
        var paid = dayPass
            ? await db.DayPassMembers.AnyAsync(x => x.Id == id && x.PaymentStatus == PaymentStatus.Paid, ct)
            : await db.PaymentRecords.AnyAsync(x => x.Id == id && x.PaymentStatus == PaymentStatus.Paid, ct);
        if (!paid) return NotFound(new { message = "Paid transaction not found." });

        var saved = await Receipts(id, dayPass).SingleOrDefaultAsync(ct);
        if (saved is null)
        {
            saved = new GymPaymentReceipt { PaymentRecordId = dayPass ? null : id, DayPassMemberId = dayPass ? id : null,
                Document = document, ContentType = type };
            db.PaymentReceipts.Add(saved);
        }
        else
        {
            saved.Document = document;
            saved.ContentType = type;
        }
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Download(Guid id, [FromQuery] bool dayPass, CancellationToken ct)
    {
        var file = await Receipts(id, dayPass).AsNoTracking().Select(x => new { x.Document, x.ContentType }).SingleOrDefaultAsync(ct);
        if (file is null) return NotFound(new { message = "This payment has no receipt." });
        var extension = file.ContentType switch { "image/png" => "png", "image/jpeg" => "jpg", _ => "pdf" };
        return File(file.Document, file.ContentType, $"gym-receipt-{id:N}.{extension}");
    }

    private IQueryable<GymPaymentReceipt> Receipts(Guid id, bool dayPass) => dayPass
        ? db.PaymentReceipts.Where(x => x.DayPassMemberId == id)
        : db.PaymentReceipts.Where(x => x.PaymentRecordId == id);

}
