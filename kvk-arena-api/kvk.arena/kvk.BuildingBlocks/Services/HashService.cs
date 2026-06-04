using System.Security.Cryptography;
using System.Text;

namespace kvk.BuildingBlocks.Services;

public interface IHashService
{
    string GeneratePayHereHash(string merchantId, string merchantSecret, string orderId, decimal amount, string currency);
}

public class HashService : IHashService
{
    public string GeneratePayHereHash(string merchantId, string merchantSecret, string orderId, decimal amount, string currency)
    {
        var hashedSecret = ComputeMd5(merchantSecret);
        var amountFormatted = amount.ToString("0.00");

        return ComputeMd5(
            merchantId +
            orderId +
            amountFormatted +
            currency +
            hashedSecret);
    }

    private static string ComputeMd5(string value)
    {
        using var md5 = MD5.Create();
        var inputBytes = Encoding.ASCII.GetBytes(value);
        var hashBytes = md5.ComputeHash(inputBytes);
        return Convert.ToHexString(hashBytes).ToUpperInvariant();
    }
}

