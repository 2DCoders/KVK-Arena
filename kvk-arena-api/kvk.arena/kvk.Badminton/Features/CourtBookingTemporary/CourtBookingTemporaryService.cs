using kvk.Badminton.Domain;
using kvk.Badminton.Persistence;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using kvk.BuildingBlocks.Common;

namespace kvk.Badminton.Features.CourtBookingTemporary;

public class CourtBookingTemporaryService
{
    private readonly BadmintonDbContext _context;
    private readonly ICouponValidationService _couponValidationService;

    public CourtBookingTemporaryService(BadmintonDbContext context, ICouponValidationService couponValidationService)
    {
        _context = context;
        _couponValidationService = couponValidationService;
    }

    public async Task<CourtBookingTemporaryAvailabilityCheckResponse> CheckAvailabilityAsync(
        CourtBookingTemporaryAvailabilityCheckRequest request, string memberId, string? couponCode = null)
    {
        var response = new CourtBookingTemporaryAvailabilityCheckResponse();

        int durationInWeeks = request.NumberOfSlots;
        response.DurationInWeeks = durationInWeeks;

        int weeklySlotCount = request.DaysOfWeek.Count * request.SlotIds.Count;
        int totalSlots = durationInWeeks * weeklySlotCount;

        if (weeklySlotCount == 0 || durationInWeeks <= 0)
        {
            response.IsAvailable = false;
            response.UnavailableSchedules.Add(new UnavailableScheduleResponse
            {
                Message = "Please select valid days, slots, and duration."
            });
            return response;
        }

        // Check if court exists and get price
        var court = await _context.Courts.FirstOrDefaultAsync(c => c.Id == request.CourtId);
        if (court == null)
        {
            response.IsAvailable = false;
            response.UnavailableSchedules.Add(new UnavailableScheduleResponse { Message = "Court not found." });
            return response;
        }

        response.OriginalAmount = court.PricePerSlot * totalSlots;

        // Check overlap
        var existingSchedules = await _context.Set<CourtBookingTemporarySchedule>()
            .Include(s => s.CourtBookingTemporary)
            .Where(s => s.CourtBookingTemporary.CourtId == request.CourtId
                        && s.CourtBookingTemporary.StartDate <= request.StartDate.AddDays(durationInWeeks * 7)
                        && s.CourtBookingTemporary.StartDate.AddDays(s.CourtBookingTemporary.NumberOfSlots * 7) >=
                        request.StartDate)
            .ToListAsync();

        bool hasOverlap = false;

        foreach (var day in request.DaysOfWeek)
        {
            foreach (var slotId in request.SlotIds)
            {
                // Check if any existing booking overlaps on this day/slot
                var overlap = existingSchedules.Any(s => s.DayOfWeek == day && s.SlotId == slotId);
                if (overlap)
                {
                    hasOverlap = true;
                    response.UnavailableSchedules.Add(new UnavailableScheduleResponse
                    {
                        DayOfWeek = day,
                        SlotId = slotId,
                        SlotName = (await _context.CourtSlots.Where(s => s.Id == slotId)
                            .Select(s => s.StartTime.ToString(@"hh\:mm") + " - " + s.EndTime.ToString(@"hh\:mm"))
                            .FirstOrDefaultAsync())!,
                        Message = "Slot is already booked for the selected period."
                    });
                }
            }
        }

        response.IsAvailable = !hasOverlap;

        if (!string.IsNullOrEmpty(couponCode))
        {
            var couponResult =
                await _couponValidationService.ValidateAndCalculateDiscountAsync(memberId, couponCode,
                    response.OriginalAmount, "badminton", request.NumberOfSlots, court.PricePerSlot);
            if (couponResult.IsValid)
            {
                response.DiscountAmount = couponResult.DiscountAmount;
            }
        }

        response.FinalAmount = response.OriginalAmount - response.DiscountAmount;
        return response;
    }

    public async Task<Result> CreateBookingAsync(CreateCourtBookingTemporaryRequest request,
        CancellationToken cancellationToken)
    {
        var checkRequest = new CourtBookingTemporaryAvailabilityCheckRequest
        {
            CourtId = request.CourtId,
            StartDate = request.StartDate,
            NumberOfSlots = request.NumberOfSlots,
            SlotIds = request.SlotIds,
            DaysOfWeek = request.DaysOfWeek
        };

        var availability = await CheckAvailabilityAsync(checkRequest, request.MemberId, request.CouponCode);

        if (!availability.IsAvailable)
        {
            throw new InvalidOperationException("Selected slots are not available.");
        }

        //convert to byte array and upload
        byte[] imageBytes = [];
        if (request.PaymentProof is not null && request.PaymentProof.Length > 0)
        {
            using var memoryStream = new MemoryStream();
            await request.PaymentProof.CopyToAsync(memoryStream, cancellationToken);
            imageBytes = memoryStream.ToArray();
        }

        var memberIdGuid = await _couponValidationService.GetMemberIdAsync(request.MemberId);


        var booking = new Domain.CourtBookingTemporary
        {
            CourtId = request.CourtId,
            MemberId = memberIdGuid,
            StartDate = request.StartDate,
            NumberOfSlots = request.NumberOfSlots,
            Amount = availability.OriginalAmount,
            DiscountAmount = availability.DiscountAmount,
            FinalAmount = availability.FinalAmount,
            CouponCode = request.CouponCode,
            PaymentType = request.PaymentType,
            IsHalfPayment = request.IsHalfPayment,
            PaymentProof = imageBytes
        };


        foreach (var day in request.DaysOfWeek)
        {
            foreach (var slotId in request.SlotIds)
            {
                booking.Schedules.Add(new CourtBookingTemporarySchedule
                {
                    DayOfWeek = day,
                    SlotId = slotId
                });
            }
        }

        _context.Set<Domain.CourtBookingTemporary>().Add(booking);
        await _context.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrEmpty(request.CouponCode))
        {
            await _couponValidationService.MarkCouponAsRedeemedAsync(request.MemberId, request.CouponCode);
        }

        // if (request.IsHalfPayment)
        // {
        //     //create a customized message this is the given amount and it already deducted from the final amount and paid for number of slots
        //     _ = $"Half payment of {availability.FinalAmount - availability.} has been made. Please pay the remaining amount of {availability.FinalAmount / 2} before the booking date.";
        // }


        return Result.Success("Booking created successfully.");
    }


    public async Task<List<AvailabilityForCertainPeriodResponse>> CheckAvailabilityForPeriodAsync(
        List<DaysOfWeek> daysOfWeek,
        int futureWeeksCountToCheck,
        DateTime startDate,
        Guid courtId)
    {
        if (daysOfWeek == null || daysOfWeek.Count == 0)
            return new List<AvailabilityForCertainPeriodResponse>();

        var requestedDays = daysOfWeek
            .Distinct()
            .ToList();

        var start = startDate.Date;
        var end = start.AddDays(futureWeeksCountToCheck * 7);

        var courtSlots = await _context.CourtSlots
            .Where(s => s.CourtId == courtId)
            .OrderBy(s => s.StartTime)
            .ToListAsync();

        var existingSchedules = await _context
            .Set<CourtBookingTemporarySchedule>()
            .Include(s => s.CourtBookingTemporary)
            .Where(s =>
                s.CourtBookingTemporary.CourtId == courtId &&
                s.CourtBookingTemporary.StartDate <= end &&
                s.CourtBookingTemporary.StartDate
                    .AddDays(s.CourtBookingTemporary.NumberOfSlots * 7) >= start)
            .GroupBy(s => s.DayOfWeek)
            .ToListAsync();

        var result = new List<AvailabilityForCertainPeriodResponse>();

        foreach (var requestedDay in requestedDays)
        {
            // Get the first occurrence of the requested day.
            var firstDate = start.AddDays(
                ((int)requestedDay - (int)start.DayOfWeek + 7) % 7);

            var slotsForRequestedDay = courtSlots
                .Select(s => new DayOfWeekDetails
                {
                    Date = firstDate.AddDays(1),
                    AvailableSlotId = s.Id,
                    AvailableSlotName =
                        s.StartTime.ToString(@"hh\:mm") +
                        " - " +
                        s.EndTime.ToString(@"hh\:mm")
                })
                .ToList();

            // Get existing schedules for this requested day.
            var existingDay = existingSchedules
                .FirstOrDefault(x => x.Key == requestedDay);

            if (existingDay != null)
            {
                // Remove all slots that are already booked.
                var bookedSlotIds = existingDay
                    .Select(x => x.SlotId)
                    .ToList();

                slotsForRequestedDay = slotsForRequestedDay
                    .Where(x => !bookedSlotIds.Contains(x.AvailableSlotId))
                    .ToList();
            }

            result.Add(new AvailabilityForCertainPeriodResponse
            {
                DayOfWeekName = requestedDay.ToString(),
                DayOfWeekDetails = slotsForRequestedDay
            });
        }

        return result;
    }
}

public class AvailabilityForCertainPeriodResponse
{
    public required string DayOfWeekName { get; set; }

    public List<DayOfWeekDetails>? DayOfWeekDetails { get; set; }
}

public class DayOfWeekDetails
{
    public DateTime Date { get; set; }

    public Guid AvailableSlotId { get; set; }

    public string AvailableSlotName { get; set; }
}