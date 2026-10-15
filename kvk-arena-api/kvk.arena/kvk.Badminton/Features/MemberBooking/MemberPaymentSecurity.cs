using System.Security.Cryptography;
using System.Text;
using kvk.BuildingBlocks;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Services;

namespace kvk.Badminton.Features.MemberBooking;

public static class MemberPaymentSecurity
{
    public static bool Verify(PaymentNotificationRequest request, PayHereOptions options, IHashService hashes,
        string orderId, decimal amount, string currency)
    {
        if (string.IsNullOrWhiteSpace(options.MerchantSecret) || request.MerchantId != options.MerchantId ||
            request.OrderId != orderId || request.PayhereAmount != amount || request.PayhereCurrency != currency || string.IsNullOrWhiteSpace(request.Md5Sig)) return false;
        var expected = hashes.GenerateNotificationMd5Sig(request.MerchantId, options.MerchantSecret, request.OrderId,
            request.PayhereAmount, request.PayhereCurrency, request.StatusCode);
        return CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(expected.ToUpperInvariant()), Encoding.ASCII.GetBytes(request.Md5Sig.ToUpperInvariant()));
    }
}
