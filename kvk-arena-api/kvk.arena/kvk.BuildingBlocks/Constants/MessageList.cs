namespace kvk.BuildingBlocks.Constants;

public static class MessageList
{
   public static string GetWelcomeMessage(string firstName, string membershipNumber)
   {
      return $"Welcome to KVK Arena. {firstName}, your member ID {membershipNumber} has been registered.";
   }

   public static string PaymentReceivedMessage(string firstName,decimal amount)
   {
      return $"Dear {firstName}, your payment of {amount} has been received. Thank you for being a valued member of our gym!";
   }

   public static string GetPlanUpgradedMessage(string firstName, string planTitle, DateTime? startDate, DateTime? endDate)
   {
      var start = startDate.HasValue ? startDate.Value.ToString("dd/MM/yyyy") : "N/A";
      var end = endDate.HasValue ? endDate.Value.ToString("dd/MM/yyyy") : "N/A";
      return $"Dear {firstName}, your membership has been upgraded to {planTitle}. Valid from {start} to {end}. Thank you for being with KVK Arena.";
   }

   public static string GetKvkMemberRegistrationMessage(string firstName, string membershipNumber)
   {
      return
         $"Congratulations, {firstName}! Your KVK Arena membership has been successfully registered. " +
         $"Your Member ID is {membershipNumber}. Welcome to the KVK Arena family! " +
         $"Once the pre-registration period ends on 20th August 2026, you'll be able to access and enjoy all the exciting features of KVK Arena.";
   }

}