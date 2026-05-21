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

}