namespace kvk.BuildingBlocks.Common;

public static class MessageList
{
   public static string GetWelcomeMessage(string firstName, string membershipNumber)
   {
      return $"Welcome to KVK Arena. {firstName}, your member ID {membershipNumber} has been registered.";
   }
}