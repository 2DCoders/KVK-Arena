namespace kvk.BuildingBlocks.Common;

public static class CouponCodeGenerator
{
    private static readonly Random random = new Random();

    public static string GenerateCouponCode(int length = 8)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        if (length < 2)
            throw new ArgumentException("Length must be at least 2.", nameof(length));

        return "#" + new string(
            Enumerable.Repeat(chars, length - 1)
                .Select(s => s[random.Next(s.Length)])
                .ToArray());
    }
}