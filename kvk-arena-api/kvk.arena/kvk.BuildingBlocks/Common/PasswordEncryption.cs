using System.Security.Cryptography;

namespace kvk.BuildingBlocks.Common;

public static class PasswordEncryption
{
    // ---- Password hashing helpers (PBKDF2) ----
    public static string HashPassword(string password)
    {
        using var rng = RandomNumberGenerator.Create();
        var salt = new byte[16];
        rng.GetBytes(salt);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        // store: 0x01 | salt(16) | hash(32)
        var result = new byte[1 + salt.Length + hash.Length];
        result[0] = 1;
        Buffer.BlockCopy(salt, 0, result, 1, salt.Length);
        Buffer.BlockCopy(hash, 0, result, 1 + salt.Length, hash.Length);
        return Convert.ToBase64String(result);
    }

    public static bool VerifyPassword(string password, string stored)
    {
        try
        {
            var bytes = Convert.FromBase64String(stored);
            if (bytes.Length != 1 + 16 + 32) return false;
            if (bytes[0] != 1) return false;
            var salt = new byte[16];
            Buffer.BlockCopy(bytes, 1, salt, 0, 16);
            var storedHash = new byte[32];
            Buffer.BlockCopy(bytes, 1 + 16, storedHash, 0, 32);
            var computed = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
            return CryptographicOperations.FixedTimeEquals(computed, storedHash);
        }
        catch
        {
            return false;
        }
    }
}