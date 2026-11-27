using kvk.Gym.Enums;

namespace kvk.Gym.Features.Payments;

internal static class TrainerPaymentDiscount
{
    public static bool TryApply(MemberType memberType, decimal price, decimal discount, out decimal total)
    {
        total = price;
        if (memberType != MemberType.Trainer || discount < 0 || decimal.Round(discount, 2) != discount ||
            (discount > 0 && discount >= price))
            return false;

        total -= discount;
        return true;
    }
}
