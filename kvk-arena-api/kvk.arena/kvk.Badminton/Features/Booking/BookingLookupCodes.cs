using System.Security.Cryptography;

namespace kvk.Badminton.Features.Booking;

public sealed class BookingLookupCodes
{
    private sealed record Challenge(Guid Id, string Code, DateTimeOffset IssuedAt, int Attempts);
    private readonly Dictionary<string, Challenge> challenges = new();
    private readonly Queue<DateTimeOffset> sends = new();
    private readonly object gate = new();
    private static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(5);

    public (Guid Id, string Code)? Issue(string phone)
    {
        lock (gate)
        {
            var now = DateTimeOffset.UtcNow;
            while (sends.TryPeek(out var sent) && now - sent >= Lifetime) sends.Dequeue();
            if (sends.Count >= 30) return null;

            foreach (var expired in challenges.Where(entry => now - entry.Value.IssuedAt >= Lifetime).Select(entry => entry.Key).ToArray())
                challenges.Remove(expired);

            if (challenges.TryGetValue(phone, out var previous) && now - previous.IssuedAt < TimeSpan.FromMinutes(1))
                return null;

            var challenge = new Challenge(Guid.NewGuid(), RandomNumberGenerator.GetInt32(1_000_000).ToString("D6"), now, 0);
            challenges[phone] = challenge;
            sends.Enqueue(now);
            return (challenge.Id, challenge.Code);
        }
    }

    public bool Verify(string phone, Guid id, string code)
    {
        lock (gate)
        {
            if (!challenges.TryGetValue(phone, out var challenge) || challenge.Id != id ||
                DateTimeOffset.UtcNow - challenge.IssuedAt >= Lifetime || challenge.Attempts >= 5)
                return false;

            if (!CryptographicOperations.FixedTimeEquals(
                System.Text.Encoding.ASCII.GetBytes(code), System.Text.Encoding.ASCII.GetBytes(challenge.Code)))
            {
                challenges[phone] = challenge with { Attempts = challenge.Attempts + 1 };
                return false;
            }

            challenges[phone] = challenge with { Attempts = 5 };
            return true;
        }
    }
}
