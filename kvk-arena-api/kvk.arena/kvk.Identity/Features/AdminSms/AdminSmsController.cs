using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using kvk.BuildingBlocks.Interfaces;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace kvk.Identity.Features.AdminSms;

[Authorize]
[ApiController]
[Route("api/identity/admin-sms")]
public class AdminSmsController(
    IdentityApplicationDbContext db, ISmsService sms, IConfiguration configuration,
    ILogger<AdminSmsController> logger) : ControllerBase
{
    public record Contact(Guid Id, string Name, string? Phone, bool IsManual = false);
    public record ContactInput(string Name, string Phone);
    public record Recipient(string Phone, string? Name, string Status);
    public record GroupInput(string Name, Guid[] MemberIds);
    public record Draft(string Message, Guid[] MemberIds, string[] PhoneNumbers, Guid? GroupId);
    public record SendInput(Guid Id, string QuoteToken, Draft Draft);
    public record Settings(decimal Price, int Length, int MonthlyLimit, int MaxSegments);
    public record Quote(string Message, Recipient[] Recipients, string? GroupName, int Segments,
        int Used, int Total, int Excess, decimal Charge, Settings Settings, string BillingMonth);

    private Guid StaffId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    private bool CanManageSms => User.HasClaim("permission", "admin.sms");

    private Settings GetSettings() => new(
        configuration.GetValue("AdminSms:Price", 0.59m),
        configuration.GetValue("AdminSms:Length", 160),
        configuration.GetValue("AdminSms:MonthlyLimit", 0),
        configuration.GetValue("AdminSms:MaxSegments", 5));

    [HttpGet("contacts")]
    public async Task<IActionResult> Contacts(CancellationToken ct)
    {
        if (!CanManageSms) return Forbid();
        return Ok(await GetContacts(ct));
    }

    [HttpGet("groups")]
    public async Task<IActionResult> Groups(CancellationToken ct)
    {
        if (!CanManageSms) return Forbid();
        return Ok(await db.AdminSmsGroups.AsNoTracking().OrderBy(x => x.Name)
            .Select(x => new { x.Id, x.Name, x.MemberIds }).ToListAsync(ct));
    }

    [HttpPost("contacts")]
    public async Task<IActionResult> AddContact(ContactInput input, CancellationToken ct)
    {
        if (!CanManageSms) return Forbid();
        var name = input.Name.Trim();
        var phone = NormalizePhone(input.Phone);
        if (name.Length is 0 or > 100 || phone is null)
            return BadRequest(new { message = "Enter a name of up to 100 characters and a valid mobile number." });

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(73040202)", ct);
        var existing = (await GetContacts(ct)).FirstOrDefault(x => x.Phone == phone);
        if (existing is not null) return Ok(existing);

        var contact = new AdminSmsContact { Name = name, Phone = phone };
        db.AdminSmsContacts.Add(contact);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Ok(new Contact(contact.Id, contact.Name, contact.Phone, true));
    }

    [HttpPut("contacts/{id:guid}")]
    public async Task<IActionResult> EditContact(Guid id, ContactInput input, CancellationToken ct)
    {
        if (!CanManageSms) return Forbid();
        var name = input.Name.Trim();
        var phone = NormalizePhone(input.Phone);
        if (name.Length is 0 or > 100 || phone is null)
            return BadRequest(new { message = "Enter a name of up to 100 characters and a valid mobile number." });

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(73040202)", ct);
        var contact = await db.AdminSmsContacts.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (contact is null) return NotFound(new { message = "This saved contact no longer exists." });
        if (contact.Phone != phone && (await GetContacts(ct)).Any(x => x.Id != id && x.Phone == phone))
            return Conflict(new { message = "This mobile number already belongs to another contact." });

        contact.Name = name;
        contact.Phone = phone;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Ok(new Contact(contact.Id, contact.Name, contact.Phone, true));
    }

    [HttpDelete("contacts/{id:guid}")]
    public async Task<IActionResult> DeleteContact(Guid id, CancellationToken ct)
    {
        if (!CanManageSms) return Forbid();
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(73040202)", ct);
        var contact = await db.AdminSmsContacts.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (contact is null) return NoContent();

        var groups = await db.AdminSmsGroups.Where(x => Enumerable.Contains(x.MemberIds, id)).ToListAsync(ct);
        foreach (var group in groups)
            group.MemberIds = group.MemberIds.Where(memberId => memberId != id).ToArray();
        db.AdminSmsContacts.Remove(contact);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return NoContent();
    }

    [HttpPut("groups/{id:guid}")]
    public async Task<IActionResult> SaveGroup(Guid id, GroupInput input, CancellationToken ct)
    {
        if (!CanManageSms) return Forbid();
        var name = input.Name.Trim();
        if (name.Length is 0 or > 100 || id == Guid.Empty)
            return BadRequest(new { message = "Enter a group name of up to 100 characters." });

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(73040202)", ct);
        var contacts = await GetContacts(ct);
        var allowedIds = contacts.Select(x => x.Id).ToHashSet();
        var group = await db.AdminSmsGroups.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (group is null)
        {
            group = new AdminSmsGroup { Id = id, Name = name };
            db.AdminSmsGroups.Add(group);
        }
        group.Name = name;
        group.MemberIds = input.MemberIds.Distinct().Where(allowedIds.Contains).ToArray();
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Ok(new { group.Id, group.Name, group.MemberIds });
    }

    [HttpGet("history")]
    public async Task<IActionResult> History([FromQuery] int page = 1, CancellationToken ct = default)
    {
        if (!CanManageSms) return Forbid();
        const int pageSize = 20;
        if (page is < 1 or > 1000000) return BadRequest();
        var rows = await db.AdminSmsBatches.AsNoTracking().OrderByDescending(x => x.SubmittedUtc)
            .ThenByDescending(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize + 1).ToListAsync(ct);
        var staffIds = rows.Take(pageSize).Select(x => x.StaffId).Distinct().ToArray();
        // EF Core 8 translates Enumerable.Contains, while .NET 10 can bind array.Contains to a span overload.
        var staffNames = await StaffNames(db.Staffs.Where(x => Enumerable.Contains(staffIds, x.Id)))
            .ToDictionaryAsync(x => x.Id, x => x.Name, ct);
        var settings = GetSettings();
        var month = CurrentMonth(DateTime.UtcNow);
        var monthly = MonthlyBatches(month);
        var accepted = await monthly.SumAsync(x => x.AcceptedSegments, ct);
        var reserved = await monthly.SumAsync(x => x.ReservedSegments, ct);
        var charge = await monthly.SumAsync(x => x.MaintenanceCharge, ct);
        return Ok(new
        {
            settings, month = month.AddMinutes(330).ToString("yyyy-MM"), accepted, reserved,
            excess = Math.Max(0, accepted - settings.MonthlyLimit), charge,
            items = rows.Take(pageSize).Select(x => Summary(x, staffNames.GetValueOrDefault(x.StaffId))),
            hasMore = rows.Count > pageSize
        });
    }

    [HttpPost("quote")]
    public async Task<IActionResult> Preview(Draft draft, CancellationToken ct)
    {
        if (!CanManageSms) return Forbid();
        try
        {
            var quote = await BuildQuote(draft, DateTime.UtcNow, ct);
            return Ok(new { quote, token = QuoteToken(quote) });
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("report")]
    public async Task<IActionResult> Report([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
    {
        if (!CanManageSms) return Forbid();
        if (year is < 2000 or > 9998 || month is < 1 or > 12)
            return BadRequest(new { message = "Select a valid report year and month." });

        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc).AddMinutes(-330);
        if (start > CurrentMonth(DateTime.UtcNow))
            return BadRequest(new { message = "The report month must be current or past." });

        var batches = await MonthlyBatches(start).AsNoTracking().OrderBy(x => x.SubmittedUtc).ThenBy(x => x.Id)
            .Select(x => new { x.Id, x.SubmittedUtc, x.GroupName, x.RecipientsJson, x.AcceptedSegments, x.MaintenanceCharge })
            .ToListAsync(ct);
        var rows = batches.Select(batch =>
        {
            var counts = JsonSerializer.Deserialize<Recipient[]>(batch.RecipientsJson)!
                .CountBy(x => x.Status).ToDictionary(x => x.Key, x => x.Value);
            return new
            {
                batch.Id, batch.SubmittedUtc, promotional = batch.GroupName != null,
                batch.AcceptedSegments, batch.MaintenanceCharge,
                accepted = counts.GetValueOrDefault("Accepted"),
                failed = counts.GetValueOrDefault("Failed"),
                skipped = counts.GetValueOrDefault("Skipped"),
                unknown = counts.GetValueOrDefault("Unknown"),
                pending = counts.GetValueOrDefault("Pending")
            };
        }).ToArray();
        return Ok(new
        {
            year, month, maintenanceOverage = rows.Sum(x => x.MaintenanceCharge),
            acceptedSegments = rows.Sum(x => x.AcceptedSegments), rows
        });
    }

    [HttpPost("send")]
    public async Task<IActionResult> Send(SendInput input, CancellationToken ct)
    {
        if (!CanManageSms) return Forbid();
        if (input.Id == Guid.Empty) return BadRequest(new { message = "A confirmation ID is required." });
        if (new[] { "UserId", "ApiKey", "SenderId" }.Any(key => string.IsNullOrWhiteSpace(configuration[$"Sms:{key}"])))
            return StatusCode(503, new { message = "SMSlenz credentials are missing on the server." });

        AdminSmsBatch batch;
        Quote quote;
        await using (var tx = await db.Database.BeginTransactionAsync(ct))
        {
            // Serialize quota reservations and confirmation ID checks across API instances.
            await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(73040201)", ct);
            var existing = await db.AdminSmsBatches.AsNoTracking().SingleOrDefaultAsync(x => x.Id == input.Id, ct);
            if (existing is not null)
                return existing.StaffId == StaffId ? Ok(await SummaryForSender(existing)) : Forbid();

            var now = DateTime.UtcNow;
            try { quote = await BuildQuote(input.Draft, now, ct); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            var token = QuoteToken(quote);
            if (token != input.QuoteToken)
                return Conflict(new { quote, token, message = "Recipients or monthly usage changed. Review the updated summary." });

            batch = new AdminSmsBatch
            {
                Id = input.Id, StaffId = StaffId, SubmittedUtc = now, Message = quote.Message,
                GroupName = quote.GroupName, RecipientsJson = JsonSerializer.Serialize(quote.Recipients),
                SegmentsPerRecipient = quote.Segments, ReservedSegments = quote.Total,
                MonthlyLimit = quote.Settings.MonthlyLimit, SegmentPrice = quote.Settings.Price
            };
            db.AdminSmsBatches.Add(batch);
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }

        // Once committed, finish the batch even if the browser loses its connection.
        for (var index = 0; index < quote.Recipients.Length; index++)
        {
            var recipient = quote.Recipients[index];
            if (recipient.Status != "Pending") continue;
            var status = "Unknown";
            int? acceptedPages = null;
            try
            {
                using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(20));
                acceptedPages = await sms.SendSingleMessageWithPagesAsync(recipient.Phone, quote.Message, timeout.Token);
                status = acceptedPages.HasValue ? "Accepted" : "Failed";
            }
            catch (Exception ex) when (ex is HttpRequestException or OperationCanceledException or JsonException)
            {
                logger.LogWarning("SMS provider response unknown for batch {BatchId}, recipient {Index}: {ErrorType}",
                    batch.Id, index, ex.GetType().Name);
            }
            quote.Recipients[index] = recipient with { Status = status };

            await using var tx = await db.Database.BeginTransactionAsync();
            await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(73040201)");
            if (acceptedPages is int pages)
            {
                var previous = await MonthlyBatches(CurrentMonth(batch.SubmittedUtc)).SumAsync(x => x.AcceptedSegments);
                batch.AcceptedSegments += pages;
                batch.ReservedSegments += pages - quote.Segments;
                batch.MaintenanceCharge += Excess(previous, pages, batch.MonthlyLimit) * batch.SegmentPrice;
            }
            if (status == "Failed") batch.ReservedSegments -= quote.Segments;
            batch.RecipientsJson = JsonSerializer.Serialize(quote.Recipients);
            batch.Completed = quote.Recipients.All(x => x.Status != "Pending");
            await db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        return Ok(await SummaryForSender(batch));
    }

    private IQueryable<AdminSmsBatch> MonthlyBatches(DateTime month) =>
        db.AdminSmsBatches.Where(x => x.SubmittedUtc >= month && x.SubmittedUtc < month.AddMinutes(330).AddMonths(1).AddMinutes(-330));

    private static DateTime CurrentMonth(DateTime now)
    {
        var local = now.AddMinutes(330);
        return new DateTime(local.Year, local.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMinutes(-330);
    }

    private async Task<Contact[]> GetContacts(CancellationToken ct)
    {
        var members = await db.KvkMembers.AsNoTracking()
            .Where(x => x.Phone != null)
            .Select(x => new Contact(x.Id, x.FirstName + " " + x.LastName, x.Phone, false)).ToListAsync(ct);
        var manual = await db.AdminSmsContacts.AsNoTracking()
            .Select(x => new Contact(x.Id, x.Name, x.Phone, true)).ToListAsync(ct);
        return members.Select(x => x with { Phone = NormalizePhone(x.Phone) }).Where(x => x.Phone != null)
            .Concat(manual).OrderBy(x => x.Name, StringComparer.OrdinalIgnoreCase).ThenBy(x => x.Id).ToArray();
    }

    private async Task<Quote> BuildQuote(Draft draft, DateTime now, CancellationToken ct)
    {
        var settings = GetSettings();
        var message = draft.Message.Trim();
        if (message.Length is 0 or > 1500)
            throw new ArgumentException("Enter a message between 1 and 1,500 characters.");
        var segments = CountSegments(message, settings.Length);
        if (segments > settings.MaxSegments)
            throw new ArgumentException($"Messages can use up to {settings.MaxSegments} SMS segments.");

        var contacts = (await GetContacts(ct)).ToDictionary(x => x.Id);
        var group = draft.GroupId is Guid groupId
            ? await db.AdminSmsGroups.AsNoTracking().SingleOrDefaultAsync(x => x.Id == groupId, ct)
                ?? throw new ArgumentException("The selected group no longer exists.")
            : null;
        var ids = group?.MemberIds ?? draft.MemberIds;
        var optOuts = configuration.GetSection("AdminSms:PromotionalOptOutNumbers")
            .Get<string[]>()?.Select(NormalizePhone).ToHashSet() ?? [];
        var recipients = ids.Distinct().Order().Select(id => contacts.TryGetValue(id, out var contact)
            ? new Recipient(contact.Phone!, contact.Name, group is not null && optOuts.Contains(contact.Phone) ? "Skipped" : "Pending")
            : new Recipient("", id.ToString(), "Skipped")).ToList();
        foreach (var number in group is null ? draft.PhoneNumbers : [])
        {
            var phone = NormalizePhone(number) ?? throw new ArgumentException($"Invalid Sri Lankan mobile number: {number}");
            var name = contacts.Values.FirstOrDefault(x => x.Phone == phone)?.Name;
            recipients.Add(new Recipient(phone, name, "Pending"));
        }
        var unique = recipients.DistinctBy(x => string.IsNullOrEmpty(x.Phone) ? x.Name : x.Phone).ToArray();
        var count = unique.Count(x => x.Status == "Pending");
        if (count == 0) throw new ArgumentException("Select at least one eligible recipient.");

        var month = CurrentMonth(now);
        var used = await MonthlyBatches(month).SumAsync(x => x.ReservedSegments, ct);
        var total = count * segments;
        var excess = Excess(used, total, settings.MonthlyLimit);
        return new Quote(message, unique, group?.Name, segments, used, total, excess,
            excess * settings.Price, settings, month.AddMinutes(330).ToString("yyyy-MM"));
    }

    private static int Excess(int used, int total, int limit) =>
        Math.Max(0, used + total - limit) - Math.Max(0, used - limit);

    private static string QuoteToken(Quote quote) =>
        Convert.ToHexString(SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(quote)));

    private record StaffName(Guid Id, string Name);

    private static IQueryable<StaffName> StaffNames(IQueryable<Staff> staff) => staff.AsNoTracking()
        .Select(x => new StaffName(x.Id, (x.FirstName + " " + x.LastName).Trim()));

    private async Task<object> SummaryForSender(AdminSmsBatch batch)
    {
        var staff = await StaffNames(db.Staffs.Where(x => x.Id == batch.StaffId)).SingleOrDefaultAsync();
        return Summary(batch, staff?.Name);
    }

    private static object Summary(AdminSmsBatch x, string? adminName) => new
    {
        x.Id, adminName, x.SubmittedUtc, x.Message, x.GroupName, x.SegmentsPerRecipient,
        x.AcceptedSegments, x.MaintenanceCharge, x.Completed,
        recipients = JsonSerializer.Deserialize<Recipient[]>(x.RecipientsJson)
    };

    private static string? NormalizePhone(string? value)
    {
        var number = Regex.Replace(value ?? "", @"[\s()-]", "");
        if (number.StartsWith('0')) number = "+94" + number[1..];
        else if (number.StartsWith("94", StringComparison.Ordinal)) number = "+" + number;
        return Regex.IsMatch(number, @"^\+947[0-9]{8}$") ? number : null;
    }

    private const string Gsm = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
    private const string Extended = "\f^{}\\[~]|€";

    private static int CountSegments(string message, int length)
    {
        var gsm = message.All(c => Gsm.Contains(c) || Extended.Contains(c));
        var single = gsm ? Math.Clamp(length, 8, 160) : 70;
        var units = gsm ? message.Sum(c => Extended.Contains(c) ? 2 : 1) : message.Length;
        if (units <= single) return 1;

        var capacity = single - (gsm ? 7 : 3);
        var segments = 1;
        var offset = 0;
        foreach (var rune in message.EnumerateRunes())
        {
            var size = gsm ? (Extended.Contains((char)rune.Value) ? 2 : 1) : rune.Utf16SequenceLength;
            if (offset + size > capacity)
            {
                segments++;
                offset = 0;
            }
            offset += size;
        }
        return segments;
    }
}
