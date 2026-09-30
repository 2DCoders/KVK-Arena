namespace kvk.BuildingBlocks.Constants;

public static class MessageList
{
    public static string GetWelcomeMessage(string firstName, string membershipNumber)
    {
        return $"Welcome to KVK Arena. {firstName}, your member ID {membershipNumber} has been registered.";
    }

    public static string PaymentReceivedMessage(string firstName, decimal amount)
    {
        return
            $"Dear {firstName}, your payment of {amount} has been received. Thank you for being a valued member of our gym!";
    }

    public static string GetPlanUpgradedMessage(string firstName, string planTitle, DateTime? startDate,
        DateTime? endDate)
    {
        var start = startDate.HasValue ? startDate.Value.ToString("dd/MM/yyyy") : "N/A";
        var end = endDate.HasValue ? endDate.Value.ToString("dd/MM/yyyy") : "N/A";
        return
            $"Dear {firstName}, your membership has been upgraded to {planTitle}. Valid from {start} to {end}. Thank you for being with KVK Arena.";
    }

    public static string GetKvkMemberRegistrationMessage(string firstName, string membershipNumber)
    {
        return
            $"Congratulations, {firstName}! Your KVK Arena registration has been completed successfully. " +
            $"Thank you for registering. Once the pre-registration period ends on 20th August 2026, the KVK Arena team will contact you with the next steps. Stay tuned!";
    }

    public static string GetKvkMemberCouponCodeMessage(string firstName, string couponCode)
    {
        return
            $"Hi {firstName}! 🎉 Your KVK Arena coupon code is {couponCode}. " +
            $"Use this code when booking badminton courts and enjoy a special discount on your booking. " +
            $"We look forward to seeing you at KVK Arena!";
    }

    public static string GetSalonBookingConfirmedMessage(string customerName, DateOnly bookingDate, TimeSpan startTime)
    {
        return
            $"Dear {customerName}, your KVK Arena Salon appointment on {bookingDate:dd/MM/yyyy} at {FormatTime(startTime)} is confirmed. We look forward to seeing you!";
    }

    public static string GetGamingBookingConfirmedMessage(string customerName, DateOnly bookingDate, TimeSpan startTime)
    {
        return
            $"Dear {customerName}, your KVK Arena Gaming booking on {bookingDate:dd/MM/yyyy} at {FormatTime(startTime)} is confirmed. See you soon!";
    }

    public static string GetCarWashPaymentReceivedMessage(string customerName, decimal amount)
    {
        return
            $"Dear {customerName}, your payment of LKR {amount:N2} for your car wash service has been received. Thank you for choosing KVK Arena!";
    }

    public static string GetCafePaymentReceivedMessage(string customerName, decimal amount)
    {
        return
            $"Dear {customerName}, your payment of LKR {amount:N2} at KVK Arena Cafe has been received. Thank you!";
    }

    public static string GetBookingPaymentConfirmedMessage(string customerName, string bookingNumber, decimal amount)
    {
        return
            $"Dear {customerName}, your KVK Arena booking (No: {bookingNumber}) has been confirmed. Amount paid: LKR {amount:N2}. Thank you!";
    }

    private static string FormatTime(TimeSpan time)
    {
        return DateTime.Today.Add(time).ToString("h:mm tt");
    }
}