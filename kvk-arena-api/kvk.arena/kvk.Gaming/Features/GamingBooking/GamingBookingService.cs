using System.Data;
using kvk.Badminton.Features.Booking;
using kvk.BuildingBlocks;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Constants;
using kvk.BuildingBlocks.Interfaces;
using kvk.Gaming.Domain;
using kvk.Gaming.Enums;
using kvk.Gaming.Interfaces;
using Microsoft.EntityFrameworkCore;
using kvk.BuildingBlocks.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
namespace kvk.Gaming.Features.GamingBooking;

public class GamingBookingService : IGamingBookingService
{
    private readonly GamingDbContext _db;
    private readonly IHashService _hashService;
    private readonly PayHereOptions _payHereOptions;
    private readonly ILogger<GamingBookingService> _logger;
    private readonly ISmsService _smsService;
    private const int DefaultHoldMinutes = 7;

    public GamingBookingService(
        GamingDbContext db,
        IHashService hashService,
        IOptions<PayHereOptions> payHereOptions,
        ILogger<GamingBookingService> logger,
        ISmsService smsService)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _hashService = hashService ?? throw new ArgumentNullException(nameof(hashService));
        _payHereOptions = payHereOptions?.Value ?? throw new ArgumentNullException(nameof(payHereOptions));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _smsService = smsService ?? throw new ArgumentNullException(nameof(smsService));
    }

    private async Task SendBookingConfirmationSmsAsync(string? phone, string? customerName, DateOnly bookingDate,
        TimeSpan startTime, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return;

        try
        {
            var message = MessageList.GetGamingBookingConfirmedMessage(customerName ?? "Customer", bookingDate, startTime);
            await _smsService.SendSingleMessageAsync(phone, message, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send gaming booking confirmation SMS");
        }
    }

    public async Task<Result> CreateGamingBookingAsync(CreateGamingBookingRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.GamingSlotId == Guid.Empty)
            return Result.Failure("Gaming Slot ID is required.");

        if (string.IsNullOrWhiteSpace(request.CustomerName))
            return Result.Failure("Customer Name is required.");

        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
            return Result.Failure("Customer Phone is required.");

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var gamingSlot = await _db.GamingSlots
                .Include(gs => gs.GamingStation)
                .ThenInclude(station => station.GamingCategory)
                .SingleOrDefaultAsync(gs => gs.Id == request.GamingSlotId, cancellationToken);

            if (gamingSlot == null)
                return Result.Failure($"Gaming Slot with ID '{request.GamingSlotId}' not found.");

            if (!gamingSlot.IsActive)
                return Result.Failure($"Gaming Slot is inactive and cannot be booked.");

            var gamingStation = gamingSlot.GamingStation;
            if (gamingStation == null)
                return Result.Failure("Associated Gaming Station not found.");

            if (!gamingStation.IsActive)
                return Result.Failure($"Gaming Station '{gamingStation.Name}' is inactive and cannot be booked.");

            var gamingCategory = gamingStation.GamingCategory;
            if (gamingCategory == null)
                return Result.Failure("Associated Gaming Category not found.");

            if (request.Amount != gamingSlot.Price)
            {
                return Result.Failure($"Booking amount must match the Gaming Slot price of {gamingSlot.Price:C}.");
            }

            // Generate unique booking number
            var bookingNumber = GenerateUniqueBookingNumber();

            var booking = new Domain.GamingBooking
            {
                BookingNumber = bookingNumber,
                GamingCategoryId = gamingCategory.Id, // Use category from slot's station
                GamingStationId = gamingStation.Id, // Use station from slot
                GamingSlotId = gamingSlot.Id,
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                Amount = gamingSlot.Price,
                Status = GamingBookingStatus.Confirmed,
                BookingDate = request.BookingDate,
                PaymentType = request.PaymentType,
                AdditionalPurchases = new List<GamingBookingAdditionalPurchase>()
            };
            
            if (request.AdditionalPurchases != null && request.AdditionalPurchases.Any())
            {
                var additionalPurchaseIds = request.AdditionalPurchases.Select(ap => ap.AdditionalPurchaseId).ToList();
                var additionalPurchasesFromDb = await _db.AdditionalPurchases
                    .Where(ap => additionalPurchaseIds.Contains(ap.Id))
                    .ToDictionaryAsync(ap => ap.Id, cancellationToken);
                    
                foreach(var apReq in request.AdditionalPurchases)
                {
                    if (additionalPurchasesFromDb.TryGetValue(apReq.AdditionalPurchaseId, out var apDb))
                    {
                        booking.AdditionalPurchases.Add(new GamingBookingAdditionalPurchase
                        {
                            AdditionalPurchaseId = apReq.AdditionalPurchaseId,
                            Quantity = apReq.Quantity,
                            UnitPrice = apDb.Price
                        });
                        booking.Amount += apDb.Price * apReq.Quantity;
                    }
                }
            }

            _db.GamingBookings.Add(booking);
            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            await SendBookingConfirmationSmsAsync(booking.CustomerPhone, booking.CustomerName, booking.BookingDate,
                gamingSlot.StartTime.ToTimeSpan(), cancellationToken);

            var response = new GamingBookingResponse
            {
                Id = booking.Id,
                BookingNumber = booking.BookingNumber,
                GamingCategoryId = booking.GamingCategoryId,
                GamingCategoryName = gamingCategory.Name,
                GamingStationId = booking.GamingStationId,
                GamingStationName = gamingStation.Name,
                GamingSlotId = booking.GamingSlotId,
                SlotDate = request.BookingDate,
                SlotStartTime = gamingSlot.StartTime,
                SlotEndTime = gamingSlot.EndTime,
                CustomerName = booking.CustomerName,
                CustomerPhone = booking.CustomerPhone,
                Amount = booking.Amount,
                Status = booking.Status,
                CreatedAt = booking.CreatedAt,
                LastModifiedAt = booking.LastModifiedAt,
                PaymentType = booking.PaymentType
            };

            return Result.Success("Gaming booking created successfully.")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Failed to create gaming booking: {ex.Message}");
        }
    }

    public async Task<Result> CancelGamingBookingAsync(CancelGamingBookingRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.BookingId == Guid.Empty)
            return Result.Failure("Booking ID is required.");

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var booking = await _db.GamingBookings
                .Include(b => b.GamingSlot)
                .SingleOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

            if (booking == null)
                return Result.Failure($"Gaming Booking with ID '{request.BookingId}' not found.");

            if (booking.Status == GamingBookingStatus.Cancelled)
                return Result.Success("Gaming booking is already cancelled.");

            booking.Status = GamingBookingStatus.Cancelled;
            _db.GamingBookings.Update(booking);
            
            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Result.Success("Gaming booking cancelled successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Failed to cancel gaming booking: {ex.Message}");
        }
    }

    public async Task<Result> CreateMultiGamingHoldAsync(MultiGamingBookingRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!request.Bookings.Any())
            return Result.Failure("No gaming booking details provided.");

        var createdHolds = new List<GamingBookingHold>();
        var responses = new List<GamingBookingHoldResponse>();

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            foreach (var bookingDetail in request.Bookings)
            {
                if (bookingDetail.BookingDate < DateOnly.FromDateTime(DateTime.Now))
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return Result.Failure($"Booking date {bookingDetail.BookingDate} cannot be in the past.");
                }

                var gamingSlot = await _db.GamingSlots
                    .Include(gs => gs.GamingStation)
                    .ThenInclude(station => station.GamingCategory)
                    .FirstOrDefaultAsync(gs => gs.Id == bookingDetail.GamingSlotId &&
                                               gs.GamingStationId == bookingDetail.GamingStationId &&
                                               gs.GamingCategoryId == bookingDetail.GamingCategoryId,
                        cancellationToken);

                if (gamingSlot == null)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return Result.Failure("The selected time slot no longer exists. Please choose another time.");
                }

                if (!gamingSlot.GamingStation.IsActive)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return Result.Failure(
                        $"'{gamingSlot.GamingStation.Name}' is currently unavailable. Please choose another station.");
                }

                if (!gamingSlot.IsActive)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return Result.Failure("The selected time slot is no longer available. Please choose another time.");
                }

                bool isAvailable = await CheckAvailabilityInternalAsync(bookingDetail.GamingSlotId,
                    bookingDetail.BookingDate, cancellationToken);
                if (!isAvailable)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return Result.Failure(
                        $"The selected slot for {bookingDetail.GamingSlotId} on {bookingDetail.BookingDate} is already booked or held by another user.");
                }

                var hold = new GamingBookingHold
                {
                    GamingCategoryId = bookingDetail.GamingCategoryId,
                    GamingStationId = bookingDetail.GamingStationId,
                    GamingSlotId = bookingDetail.GamingSlotId,
                    BookingDate = bookingDetail.BookingDate,
                    Amount = request.TotalAmount / request.Bookings.Count, // Distribute total amount
                    CustomerName = request.CustomerName,
                    CustomerPhone = request.CustomerPhone,
                    Status = GamingBookingHoldStatus.Pending,
                    ExpiresAt = DateTime.Now.AddMinutes(DefaultHoldMinutes),
                    AdditionalPurchases = new List<GamingBookingHoldAdditionalPurchase>()
                };
                
                if (bookingDetail.AdditionalPurchases != null && bookingDetail.AdditionalPurchases.Any())
                {
                    var additionalPurchaseIds = bookingDetail.AdditionalPurchases.Select(ap => ap.AdditionalPurchaseId).ToList();
                    var additionalPurchasesFromDb = await _db.AdditionalPurchases
                        .Where(ap => additionalPurchaseIds.Contains(ap.Id))
                        .ToDictionaryAsync(ap => ap.Id, cancellationToken);
                        
                    foreach(var apReq in bookingDetail.AdditionalPurchases)
                    {
                        if (additionalPurchasesFromDb.TryGetValue(apReq.AdditionalPurchaseId, out var apDb))
                        {
                            hold.AdditionalPurchases.Add(new GamingBookingHoldAdditionalPurchase
                            {
                                AdditionalPurchaseId = apReq.AdditionalPurchaseId,
                                Quantity = apReq.Quantity,
                                UnitPrice = apDb.Price
                            });
                        }
                    }
                }

                _db.GamingBookingHolds.Add(hold);
                createdHolds.Add(hold);
            }

            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            foreach (var hold in createdHolds)
            {
                responses.Add(MapToResponse(hold));
            }

            return Result.Success("Multiple gaming slots held successfully. Awaiting payment confirmation.")
                .WithData("response", responses);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Multi-hold creation failed: {ex.Message}");
        }
    }

    public async Task<Result> CreateSingleGamingBookingWithPaymentAsync(SingleGamingBookingWithPaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.BookingDate < DateOnly.FromDateTime(DateTime.Now))
            return Result.Failure("Booking date cannot be in the past.");

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var gamingSlot = await _db.GamingSlots
                .Include(gs => gs.GamingStation)
                .ThenInclude(station => station.GamingCategory)
                .FirstOrDefaultAsync(gs => gs.Id == request.GamingSlotId &&
                                           gs.GamingStationId == request.GamingStationId &&
                                           gs.GamingCategoryId == request.GamingCategoryId, cancellationToken);

            if (gamingSlot == null)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Failure("The selected time slot no longer exists. Please choose another time.");
            }

            if (!gamingSlot.GamingStation.IsActive)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Failure(
                    $"'{gamingSlot.GamingStation.Name}' is currently unavailable. Please choose another station.");
            }

            if (!gamingSlot.IsActive)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Failure("The selected time slot is no longer available. Please choose another time.");
            }

            bool isAvailable =
                await CheckAvailabilityInternalAsync(request.GamingSlotId, request.BookingDate, cancellationToken);
            if (!isAvailable)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Failure("The selected slot is already booked or held by another user.");
            }

            var hold = new GamingBookingHold
            {
                GamingCategoryId = request.GamingCategoryId,
                GamingStationId = request.GamingStationId,
                GamingSlotId = request.GamingSlotId,
                BookingDate = request.BookingDate,
                Amount = request.Amount,
                CustomerName = request.CustomerName,
                CustomerPhone = request.PhoneNumber,
                Status = GamingBookingHoldStatus.Pending,
                ExpiresAt = DateTime.Now.AddMinutes(DefaultHoldMinutes),
                AdditionalPurchases = new List<GamingBookingHoldAdditionalPurchase>()
            };

            if (request.AdditionalPurchases != null && request.AdditionalPurchases.Any())
            {
                var additionalPurchaseIds = request.AdditionalPurchases.Select(ap => ap.AdditionalPurchaseId).ToList();
                var additionalPurchasesFromDb = await _db.AdditionalPurchases
                    .Where(ap => additionalPurchaseIds.Contains(ap.Id))
                    .ToDictionaryAsync(ap => ap.Id, cancellationToken);
                    
                foreach(var apReq in request.AdditionalPurchases)
                {
                    if (additionalPurchasesFromDb.TryGetValue(apReq.AdditionalPurchaseId, out var apDb))
                    {
                        hold.AdditionalPurchases.Add(new GamingBookingHoldAdditionalPurchase
                        {
                            AdditionalPurchaseId = apReq.AdditionalPurchaseId,
                            Quantity = apReq.Quantity,
                            UnitPrice = apDb.Price
                        });
                    }
                }
            }

            _db.GamingBookingHolds.Add(hold);
            await _db.SaveChangesAsync(cancellationToken);

            // Generate a PayHere order id + hash for this hold so the client can launch checkout.
            // The webhook (VerifyPaymentNotificationAsync) matches back to this hold via PaymentIntentId.
            var orderId = $"GAM-PAY-{DateTime.Now:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
            hold.PaymentIntentId = orderId;
            await _db.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            var hash = _hashService.GeneratePayHereHash(
                _payHereOptions.MerchantId, _payHereOptions.MerchantSecret, orderId, request.Amount,
                _payHereOptions.Currency);

            var response = MapToResponse(hold);
            response.MerchantId = _payHereOptions.MerchantId;
            response.OrderId = orderId;
            response.Currency = _payHereOptions.Currency;
            response.Amount = request.Amount.ToString("0.00");
            response.Hash = hash;

            return Result.Success("Single gaming slot held successfully. Awaiting payment confirmation.")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Single hold creation failed: {ex.Message}");
        }
    }

    public async Task<Result> ProcessPaymentSuccessAsync(Guid holdId, string paymentIntentId,
        CancellationToken cancellationToken = default)
    {
        await using var transaction =
            await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        try
        {
            var hold = await _db.GamingBookingHolds
                .Include(h => h.AdditionalPurchases)
                .FirstOrDefaultAsync(h => h.Id == holdId, cancellationToken);

            if (hold == null)
                return Result.Failure("Gaming booking hold not found.");

            if (hold.Status == GamingBookingHoldStatus.Confirmed)
                return Result.Success("Gaming booking already confirmed.");

            if (hold.Status == GamingBookingHoldStatus.Expired || hold.ExpiresAt < DateTime.Now)
            {
                hold.Status = GamingBookingHoldStatus.Expired;
                await _db.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return Result.Failure("Gaming booking hold has expired. Payment must be refunded.");
            }

            bool isStillAvailable = await _db.GamingBookings
                .AnyAsync(b => b.GamingSlotId == hold.GamingSlotId
                               && b.BookingDate == hold.BookingDate
                               && b.Status != GamingBookingStatus.Cancelled, cancellationToken);

            if (isStillAvailable)
            {
                return Result.Failure("Gaming slot was booked by another confirmed transaction.");
            }

            var gamingSlot =
                await _db.GamingSlots.FirstOrDefaultAsync(gs => gs.Id == hold.GamingSlotId, cancellationToken);
            if (gamingSlot == null)
            {
                return Result.Failure("Gaming slot associated with the hold not found.");
            }
            

            var bookingNumber = GenerateUniqueBookingNumber();
            var booking = new Domain.GamingBooking
            {
                BookingNumber = bookingNumber,
                GamingCategoryId = hold.GamingCategoryId,
                GamingStationId = hold.GamingStationId,
                GamingSlotId = hold.GamingSlotId,
                CustomerName = hold.CustomerName,
                CustomerPhone = hold.CustomerPhone,
                Amount = hold.Amount,
                BookingDate = hold.BookingDate,
                Status = GamingBookingStatus.Confirmed,
                PaymentIntentId = paymentIntentId,
                PaymentType = PaymentTypes.Card,
                AdditionalPurchases = hold.AdditionalPurchases.Select(ap => new GamingBookingAdditionalPurchase
                {
                    AdditionalPurchaseId = ap.AdditionalPurchaseId,
                    Quantity = ap.Quantity,
                    UnitPrice = ap.UnitPrice
                }).ToList()
            };

            hold.Status = GamingBookingHoldStatus.Confirmed;
            hold.PaymentIntentId = paymentIntentId;

            _db.GamingBookings.Add(booking);
            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            await SendBookingConfirmationSmsAsync(hold.CustomerPhone, hold.CustomerName, hold.BookingDate,
                gamingSlot.StartTime.ToTimeSpan(), cancellationToken);

            var response = MapToResponse(hold);
            response.BookingId = booking.Id;
            return Result.Success("Gaming booking confirmed.").WithData("response", response);
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure("Concurrency conflict: Gaming slot already booked.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Confirmation failed: {ex.Message}");
        }
    }

    public async Task<Result> ProcessMultiPaymentSuccessAsync(MultiGamingPaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!request.HoldIds.Any())
            return Result.Failure("No hold IDs provided for multi-payment processing.");

        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        try
        {
            var confirmedBookings = new List<GamingBookingHoldResponse>();
            var smsMessages = new List<string>();

            foreach (var holdId in request.HoldIds)
            {
                var hold = await _db.GamingBookingHolds
                    .Include(h => h.AdditionalPurchases)
                    .FirstOrDefaultAsync(h => h.Id == holdId, cancellationToken);

                if (hold == null)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return Result.Failure($"Gaming booking hold with ID {holdId} not found.");
                }

                if (hold.Status == GamingBookingHoldStatus.Confirmed)
                {
                    // Already confirmed, skip and continue
                    var existingBooking = await _db.GamingBookings.FirstOrDefaultAsync(
                        b => b.PaymentIntentId == hold.PaymentIntentId && b.GamingSlotId == hold.GamingSlotId && b.BookingDate == hold.BookingDate, cancellationToken);
                    
                    if (existingBooking != null)
                    {
                        var existingResponse = MapToResponse(hold);
                        existingResponse.BookingId = existingBooking.Id;
                        confirmedBookings.Add(existingResponse);
                        continue;
                    }
                }

                var now = DateTime.Now;
                if (hold.Status == GamingBookingHoldStatus.Expired || hold.ExpiresAt < now)
                {
                    hold.Status = GamingBookingHoldStatus.Expired;
                    await _db.SaveChangesAsync(cancellationToken);
                    await transaction.RollbackAsync(cancellationToken);
                    return Result.Failure($"Gaming booking hold with ID {holdId} has expired. Payment must be refunded.");
                }

                bool isStillAvailable = await _db.GamingBookings
                    .AnyAsync(b => b.GamingSlotId == hold.GamingSlotId
                                   && b.BookingDate == hold.BookingDate
                                   && b.Status != GamingBookingStatus.Cancelled, cancellationToken);

                if (isStillAvailable)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return Result.Failure($"Gaming slot for hold ID {holdId} was booked by another confirmed transaction.");
                }

                var gamingSlot = await _db.GamingSlots
                    .Include(gs => gs.GamingStation)
                    .FirstOrDefaultAsync(gs => gs.Id == hold.GamingSlotId, cancellationToken);
                if (gamingSlot == null)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return Result.Failure($"Gaming slot associated with the hold {holdId} not found.");
                }

                var bookingNumber = GenerateUniqueBookingNumber();
                var booking = new Domain.GamingBooking
                {
                    BookingNumber = bookingNumber,
                    GamingCategoryId = hold.GamingCategoryId,
                    GamingStationId = hold.GamingStationId,
                    GamingSlotId = hold.GamingSlotId,
                    CustomerName = request.CustomerDetails.CustomerName ?? hold.CustomerName,
                    CustomerPhone = request.CustomerDetails.PhoneNumber ?? hold.CustomerPhone,
                    Amount = hold.Amount,
                    BookingDate = hold.BookingDate,
                    Status = GamingBookingStatus.Confirmed,
                    PaymentIntentId = request.PaymentIntentId ?? string.Empty,
                    PaymentType = request.CustomerDetails.PaymentType,
                    AdditionalPurchases = hold.AdditionalPurchases.Select(ap => new GamingBookingAdditionalPurchase
                    {
                        AdditionalPurchaseId = ap.AdditionalPurchaseId,
                        Quantity = ap.Quantity,
                        UnitPrice = ap.UnitPrice
                    }).ToList()
                };

                hold.Status = GamingBookingHoldStatus.Confirmed;
                hold.PaymentIntentId = request.PaymentIntentId ?? string.Empty;

                _db.GamingBookings.Add(booking);

                var response = MapToResponse(hold);
                response.BookingId = booking.Id;
                confirmedBookings.Add(response);

                smsMessages.Add($"Station: {gamingSlot.GamingStation?.Name}, Date: {hold.BookingDate:dd/MM/yyyy}, Time: {gamingSlot.StartTime:hh\\:mm} - {gamingSlot.EndTime:hh\\:mm}");
            }

            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            var phone = request.CustomerDetails.PhoneNumber;
            if (!string.IsNullOrWhiteSpace(phone) && smsMessages.Count > 0)
            {
                try
                {
                    var fullMessage = "Your KVK Arena Gaming bookings are confirmed:\n" + string.Join("\n", smsMessages);
                    await _smsService.SendSingleMessageAsync(phone, fullMessage, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send multi gaming booking confirmation SMS");
                }
            }

            var confirmMessage = confirmedBookings.Count == 1
                ? "Gaming booking confirmed."
                : "Multiple gaming bookings confirmed.";

            return Result.Success(confirmMessage).WithData("response", confirmedBookings);
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure("Concurrency conflict: One or more gaming slots already booked.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Multi-booking confirmation failed: {ex.Message}");
        }
    }

    public async Task<Result> CreateMultiGamingPaymentAsync(MultiGamingBookingPaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.HoldIds == null || request.HoldIds.Count == 0)
            return Result.Failure("At least one hold id is required.");

        var holds = await _db.GamingBookingHolds
            .Where(h => request.HoldIds.Contains(h.Id))
            .ToListAsync(cancellationToken);

        if (holds.Count != request.HoldIds.Count)
            return Result.Failure("One or more holds were not found.");

        if (holds.Any(h => h.Status != GamingBookingHoldStatus.Pending || h.ExpiresAt < DateTime.Now))
            return Result.Failure("One or more holds have expired. Please select the slots again.");

        var orderId = $"GAM-MPAY-{DateTime.Now:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        var totalAmount = holds.Sum(h => h.Amount);

        foreach (var hold in holds)
        {
            hold.PaymentIntentId = orderId;
            hold.CustomerName = request.CustomerName;
            hold.CustomerPhone = request.PhoneNumber;
        }

        await _db.SaveChangesAsync(cancellationToken);

        var hash = _hashService.GeneratePayHereHash(
            _payHereOptions.MerchantId, _payHereOptions.MerchantSecret, orderId, totalAmount,
            _payHereOptions.Currency);

        return Result.Success("Payment initiated.").WithData("response", new GamingBookingPaymentResponse
        {
            MerchantId = _payHereOptions.MerchantId,
            OrderId = orderId,
            Currency = _payHereOptions.Currency,
            Amount = totalAmount.ToString("0.00"),
            Hash = hash
        });
    }

    public async Task VerifyPaymentNotificationAsync(PaymentNotificationRequest request,
        CancellationToken cancellationToken = default)
    {
        var holds = await _db.GamingBookingHolds
            .Include(h => h.AdditionalPurchases)
            .Where(h => h.PaymentIntentId == request.OrderId && h.Status == GamingBookingHoldStatus.Pending)
            .ToListAsync(cancellationToken);

        if (holds.Count == 0)
        {
            _logger.LogWarning("Pending booking hold(s) with order id {OrderId} were not found.", request.OrderId);
            return;
        }

        var expectedMd5Sig =
            _hashService.GenerateNotificationMd5Sig(
                request.MerchantId,
                _payHereOptions.MerchantSecret,
                request.OrderId,
                request.PayhereAmount,
                request.PayhereCurrency,
                request.StatusCode);

        _logger.LogInformation("Expected MD5 Signature: {ExpectedMd5Sig}, Received MD5 Signature: {ReceivedMd5Sig}",
            expectedMd5Sig, request.Md5Sig);

        if (!string.Equals(
                expectedMd5Sig,
                request.Md5Sig,
                StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        if (request.StatusCode != 2)
            return;

        var totalAmount = holds.Sum(h => h.Amount);
        if (totalAmount != request.PayhereAmount)
            return;

        var first = holds[0];

        // Reuses the existing, tested multi-hold confirmation logic (idempotent per hold, sends SMS).
        // Works uniformly whether this order id covers one hold or several.
        await ProcessMultiPaymentSuccessAsync(new MultiGamingPaymentRequest
        {
            HoldIds = holds.Select(h => h.Id).ToList(),
            CustomerDetails = new CustomerDetailsDto
            {
                CustomerName = first.CustomerName ?? string.Empty,
                PhoneNumber = first.CustomerPhone ?? string.Empty,
                PaymentType = PaymentTypes.Card
            },
            PaymentIntentId = request.PaymentId
        }, cancellationToken);
    }

    public async Task<Result> DeletePendingPayment(GamingPendingPaymentDeleteRequest request,
        CancellationToken cancellationToken = default)
    {
        var holds = await _db.GamingBookingHolds
            .Where(h => h.PaymentIntentId == request.OrderId && h.Status == GamingBookingHoldStatus.Pending)
            .ToListAsync(cancellationToken);

        if (holds.Count == 0)
            return Result.Failure($"Pending payment with order id {request.OrderId} was not found.");

        foreach (var hold in holds)
            hold.Status = GamingBookingHoldStatus.Expired;

        await _db.SaveChangesAsync(cancellationToken);

        return Result.Success("Pending payment reversed successfully");
    }

    public async Task<GamingBookingResponse?> GetGamingBookingByIdAsync(Guid id,
        CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return null;

        var booking = await _db.GamingBookings
            .Include(b => b.GamingSlot)
            .ThenInclude(gs => gs.GamingStation)
            .ThenInclude(station => station.GamingCategory)
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (booking == null)
            return null;

        return new GamingBookingResponse
        {
            Id = booking.Id,
            BookingNumber = booking.BookingNumber,
            GamingCategoryId = booking.GamingCategoryId,
            GamingCategoryName = booking.GamingSlot.GamingStation.GamingCategory.Name,
            GamingStationId = booking.GamingStationId,
            GamingStationName = booking.GamingSlot.GamingStation.Name,
            GamingSlotId = booking.GamingSlotId,
            SlotDate = booking.BookingDate,
            SlotStartTime = booking.GamingSlot.StartTime,
            SlotEndTime = booking.GamingSlot.EndTime,
            CustomerName = booking.CustomerName,
            CustomerPhone = booking.CustomerPhone,
            Amount = booking.Amount,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt,
            LastModifiedAt = booking.LastModifiedAt
        };
    }

    public async Task<Result> FixStalePendingBookingsAsync(CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);

        var stalePendingBookings = await _db.GamingBookings
            .Where(b => b.Status == GamingBookingStatus.Pending && b.BookingDate >= today)
            .ToListAsync(cancellationToken);

        foreach (var booking in stalePendingBookings)
        {
            booking.Status = GamingBookingStatus.Confirmed;
        }

        await _db.SaveChangesAsync(cancellationToken);

        return Result.Success($"Updated {stalePendingBookings.Count} booking(s) from Pending to Confirmed.");
    }

    public async Task<List<GamingBookingResponse>> GetGamingBookingsListAsync(GetGamingBookingsListRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = _db.GamingBookings
            .Include(b => b.GamingSlot)
            .ThenInclude(gs => gs.GamingStation)
            .ThenInclude(station => station.GamingCategory)
            .Include(b => b.AdditionalPurchases)
            .ThenInclude(ap => ap.AdditionalPurchase)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(b => b.BookingNumber.Contains(request.SearchTerm) ||
                                     b.CustomerName.Contains(request.SearchTerm) ||
                                     b.CustomerPhone.Contains(request.SearchTerm));
        }

        if (request.GamingStationId.HasValue && request.GamingStationId != Guid.Empty)
        {
            query = query.Where(b => b.GamingStationId == request.GamingStationId.Value);
        }

        if (request.GamingCategoryId.HasValue && request.GamingCategoryId != Guid.Empty)
        {
            query = query.Where(b => b.GamingCategoryId == request.GamingCategoryId.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(b => b.Status == request.Status.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(b => b.BookingDate >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(b => b.BookingDate <= request.ToDate.Value);
        }

        var bookings = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var responses = bookings.Select(booking => new GamingBookingResponse
        {
            Id = booking.Id,
            BookingNumber = booking.BookingNumber,
            GamingCategoryId = booking.GamingCategoryId,
            GamingCategoryName = booking.GamingSlot.GamingStation.GamingCategory.Name,
            GamingStationId = booking.GamingStationId,
            GamingStationName = booking.GamingSlot.GamingStation.Name,
            GamingSlotId = booking.GamingSlotId,
            SlotDate = booking.BookingDate,
            SlotStartTime = booking.GamingSlot.StartTime,
            SlotEndTime = booking.GamingSlot.EndTime,
            CustomerName = booking.CustomerName,
            CustomerPhone = booking.CustomerPhone,
            Amount = booking.Amount,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt,
            LastModifiedAt = booking.LastModifiedAt,
            PaymentType = booking.PaymentType,
            AdditionalPurchases = booking.AdditionalPurchases.Select(ap => new GamingBookingAdditionalPurchaseResponse
            {
                Id = ap.Id,
                AdditionalPurchaseId = ap.AdditionalPurchaseId,
                Name = ap.AdditionalPurchase.Name,
                Quantity = ap.Quantity,
                UnitPrice = ap.UnitPrice
            }).ToList()
        }).ToList();

        return responses;
    }

    public async Task<List<GamingBookingResponse>> GetBookingsByGamingStationAsync(
        GetBookingsByGamingStationRequest request, CancellationToken cancellationToken = default)
    {
        if (request.GamingStationId == Guid.Empty)
            return new List<GamingBookingResponse>();

        var query = _db.GamingBookings
            .Where(b => b.GamingStationId == request.GamingStationId)
            .Include(b => b.GamingSlot)
            .ThenInclude(gs => gs.GamingStation)
            .ThenInclude(station => station.GamingCategory)
            .AsNoTracking();

        if (request.Date.HasValue)
        {
            query = query.Where(b => b.BookingDate == request.Date.Value);
        }

        var bookings = await query
            .OrderByDescending(b => b.GamingSlot.StartTime)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var responses = bookings.Select(booking => new GamingBookingResponse
        {
            Id = booking.Id,
            BookingNumber = booking.BookingNumber,
            GamingCategoryId = booking.GamingCategoryId,
            GamingCategoryName = booking.GamingSlot.GamingStation.GamingCategory.Name,
            GamingStationId = booking.GamingStationId,
            GamingStationName = booking.GamingSlot.GamingStation.Name,
            GamingSlotId = booking.GamingSlotId,
            SlotDate = booking.BookingDate,
            SlotStartTime = booking.GamingSlot.StartTime,
            SlotEndTime = booking.GamingSlot.EndTime,
            CustomerName = booking.CustomerName,
            CustomerPhone = booking.CustomerPhone,
            Amount = booking.Amount,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt,
            LastModifiedAt = booking.LastModifiedAt,
            PaymentType = booking.PaymentType
        }).ToList();

        return responses;
    }

    public async Task<List<GamingBookingResponse>> GetBookingsByCustomerAsync(GetBookingsByCustomerRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
            return new List<GamingBookingResponse>();

        var query = _db.GamingBookings
            .Where(b => b.CustomerPhone == request.CustomerPhone)
            .Include(b => b.GamingSlot)
            .ThenInclude(gs => gs.GamingStation)
            .ThenInclude(station => station.GamingCategory)
            .AsNoTracking();

        if (request.Date.HasValue)
        {
            query = query.Where(b => b.BookingDate == request.Date.Value);
        }

        var bookings = await query
            .OrderByDescending(b => b.GamingSlot.StartTime)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var responses = bookings.Select(booking => new GamingBookingResponse
        {
            Id = booking.Id,
            BookingNumber = booking.BookingNumber,
            GamingCategoryId = booking.GamingCategoryId,
            GamingCategoryName = booking.GamingSlot.GamingStation.GamingCategory.Name,
            GamingStationId = booking.GamingStationId,
            GamingStationName = booking.GamingSlot.GamingStation.Name,
            GamingSlotId = booking.GamingSlotId,
            SlotDate = booking.BookingDate,
            SlotStartTime = booking.GamingSlot.StartTime,
            SlotEndTime = booking.GamingSlot.EndTime,
            CustomerName = booking.CustomerName,
            CustomerPhone = booking.CustomerPhone,
            Amount = booking.Amount,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt,
            LastModifiedAt = booking.LastModifiedAt,
            PaymentType = booking.PaymentType
        }).ToList();

        return responses;
    }

    private async Task<bool> CheckAvailabilityInternalAsync(Guid gamingSlotId, DateOnly date, CancellationToken ct)
    {
        // ExpiresAt is "timestamp without time zone"; DateTime.Now (Kind=Local) used as
        // a query parameter against it can get silently shifted by the server's UTC
        // offset. Normalize to Unspecified so it compares as the plain naive value.
        var now = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

        // Check Confirmed Bookings
        var isBooked = await _db.GamingBookings
            .FirstOrDefaultAsync(b => b.GamingSlotId == gamingSlotId
                                      && b.BookingDate == date
                                      && b.Status != GamingBookingStatus.Cancelled, ct);

        var isHeld = await _db.GamingBookingHolds
            .FirstOrDefaultAsync(h => h.GamingSlotId == gamingSlotId
                                      && h.BookingDate == date
                                      && h.Status == GamingBookingHoldStatus.Pending
                                      && h.ExpiresAt > now, ct);
        if (isHeld != null)
        {
            Console.WriteLine($"Returned isHeld.ExpiresAt: {isHeld.ExpiresAt.TimeOfDay}");
            Console.WriteLine($"DateTime.Now at query time: {DateTime.Now}");
        }

        if (isBooked != null || isHeld != null)
        {
            return false;
        }

        return true;
    }

    private GamingBookingHoldResponse MapToResponse(GamingBookingHold hold)
    {
        return new GamingBookingHoldResponse
        {
            HoldId = hold.Id,
            GamingCategoryId = hold.GamingCategoryId,
            GamingStationId = hold.GamingStationId,
            GamingSlotId = hold.GamingSlotId,
            BookingDate = hold.BookingDate,
            Status = hold.Status,
            ExpiresAt = hold.ExpiresAt,
            PaymentIntentId = hold.PaymentIntentId
        };
    }

    private string GenerateUniqueBookingNumber()
    {
        return $"GBKG-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpperInvariant()}";
    }
}