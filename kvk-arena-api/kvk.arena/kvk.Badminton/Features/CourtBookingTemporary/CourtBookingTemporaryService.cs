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
        CourtBookingTemporaryAvailabilityCheckRequest request, Guid memberId, string? couponCode = null)
    {
        var response = new CourtBookingTemporaryAvailabilityCheckResponse();

        int weeklySlotCount = request.DaysOfWeek.Count * request.SlotIds.Count;
        if (weeklySlotCount == 0 || request.NumberOfSlots % weeklySlotCount != 0)
        {
            response.IsAvailable = false;
            response.UnavailableSchedules.Add(new UnavailableScheduleResponse
            {
                Message = "NumberOfSlots must be a multiple of the selected days and slots."
            });
            return response;
        }

        int durationInWeeks = request.NumberOfSlots / weeklySlotCount;
        response.DurationInWeeks = durationInWeeks;

        // Check if court exists and get price
        var court = await _context.Courts.FirstOrDefaultAsync(c => c.Id == request.CourtId);
        if (court == null)
        {
            response.IsAvailable = false;
            response.UnavailableSchedules.Add(new UnavailableScheduleResponse { Message = "Court not found." });
            return response;
        }

        response.OriginalAmount = court.PricePerSlot * request.NumberOfSlots;

        // Check overlap
        var existingSchedules = await _context.CourtBookingTemporarySchedules
            .Include(s => s.CourtBookingTemporary)
            .Where(s => s.CourtBookingTemporary.CourtId == request.CourtId
                        && s.CourtBookingTemporary.StartDate <= request.StartDate.AddDays(durationInWeeks * 7)
                        && s.CourtBookingTemporary.StartDate.AddDays((s.CourtBookingTemporary.NumberOfSlots /
                                                                      (s.CourtBookingTemporary.Schedules.Count == 0
                                                                          ? 1
                                                                          : (s.CourtBookingTemporary.Schedules.Count /
                                                                             s.CourtBookingTemporary.Schedules
                                                                                 .Select(x => x.SlotId).Distinct()
                                                                                 .Count()))) * 7) >= request.StartDate)
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
                        SlotName = (await _context.CourtSlots.Where(s => s.Id == slotId).Select(s => s.StartTime.ToString(@"hh\:mm") + " - " + s.EndTime.ToString(@"hh\:mm")).FirstOrDefaultAsync())!,
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
                    response.OriginalAmount, "badminton");
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


        var booking = new Domain.CourtBookingTemporary
        {
            CourtId = request.CourtId,
            MemberId = request.MemberId,
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
}