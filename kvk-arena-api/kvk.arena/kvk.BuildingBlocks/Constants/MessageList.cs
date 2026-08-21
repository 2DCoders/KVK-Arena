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
}