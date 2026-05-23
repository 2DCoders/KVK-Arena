using System.Security.Cryptography;
using kvk.BuildingBlocks.Auth;
using kvk.BuildingBlocks.Common;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;

namespace kvk.Identity.Features.Auth;

public class AuthService
{
    private readonly IdentityApplicationDbContext _db;
    private readonly IJwtService _jwtService;
    private readonly IPermissionAuthorizationService _permissionService;

    public AuthService(
        IdentityApplicationDbContext db,
        IJwtService jwtService,
        IPermissionAuthorizationService permissionService)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
        _permissionService = permissionService ?? throw new ArgumentNullException(nameof(permissionService));
    }

    /// <summary>
    /// Register a new staff member.
    /// </summary>
    public async Task<Result> RegisterAsync(AuthRegisterRequest? request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Email))
            return Result.Failure("Email is required");

        if (string.IsNullOrWhiteSpace(request.UserName))
            return Result.Failure("UserName is required");

        if (string.IsNullOrWhiteSpace(request.Password))
            return Result.Failure("Password is required");

        // Check uniqueness
        var exists = await _db.Set<Staff>()
            .AnyAsync(s => s.Email == request.Email || s.UserName == request.UserName, cancellationToken);
        if (exists)
            return Result.Failure("A user with the provided email or username already exists");

        try
        {
            var staff = new Staff
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                UserName = request.UserName,
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                Status = "Active"
            };

            _db.Set<Staff>().Add(staff);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new AuthResponse
            {
                UserId = staff.Id,
                Email = staff.Email,
                UserName = staff.UserName,
                FirstName = staff.FirstName,
                LastName = staff.LastName
            };

            return Result.Success($"Staff member '{staff.Email}' registered successfully")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to register staff: {ex.Message}");
        }
    }

    /// <summary>
    /// Authenticate a staff member and return token + permissions.
    /// </summary>
    public async Task<AuthResponse> LoginAsync(AuthLoginRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (string.IsNullOrWhiteSpace(request.Username))
            throw new ArgumentNullException(nameof(request.Username));

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new ArgumentNullException(nameof(request.Password));

        try
        {
            var staff = await _db.Set<Staff>()
                .SingleOrDefaultAsync(s => s.UserName == request.Username, cancellationToken);

            if (staff == null)
                throw new Exception("Invalid username or password");

            if (!VerifyPassword(request.Password, staff.PasswordHash))
                throw new Exception("Invalid username or password");

            // Get user permissions
            var permissions = (await _permissionService.GetUserPermissions(staff.Id, cancellationToken)).ToArray();

            // Get accessible modules for the staff member
            var modules = await _db.Set<Domain.StaffModule>()
                .AsNoTracking()
                .Where(sm => sm.StaffId == staff.Id && sm.IsActive)
                .OrderBy(sm => sm.ModuleName)
                .Select(sm => sm.ModuleName)
                .Distinct()
                .ToArrayAsync(cancellationToken);

            // Generate JWT token
            var token = _jwtService.GenerateToken(staff.Id, permissions);

            var response = new AuthResponse
            {
                UserId = staff.Id,
                Token = token,
                Permissions = permissions,
                Modules = modules,
                Email = staff.Email,
                UserName = staff.UserName,
                FirstName = staff.FirstName,
                LastName = staff.LastName
            };

            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to login: {ex.Message}");
        }
    }

    /// <summary>
    /// Get staff profile by ID.
    /// </summary>
    public async Task<Result> GetProfileAsync(Guid staffId, CancellationToken cancellationToken = default)
    {
        try
        {
            var staff = await _db.Set<Staff>()
                .AsNoTracking()
                .SingleOrDefaultAsync(s => s.Id == staffId, cancellationToken);

            if (staff == null)
                return Result.Failure("Staff member not found");

            var response = new AuthResponse
            {
                UserId = staff.Id,
                Email = staff.Email,
                UserName = staff.UserName,
                FirstName = staff.FirstName,
                LastName = staff.LastName
            };

            return Result.Success()
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to get profile: {ex.Message}");
        }
    }

    /// <summary>
    /// Change password for a staff member. Accepts either UserId or UserName (UserId takes precedence).
    /// </summary>
    public async Task<Result> ChangePasswordAsync(ChangePasswordRequest? request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            return Result.Failure("Current password is required");

        if (string.IsNullOrWhiteSpace(request.NewPassword))
            return Result.Failure("New password is required");

        try
        {
            Staff? staff = null;
            if (request.UserId != Guid.Empty)
            {
                staff = await _db.Set<Staff>()
                    .SingleOrDefaultAsync(s => s.Id == request.UserId, cancellationToken);
            }
            else if (!string.IsNullOrWhiteSpace(request.UserName))
            {
                staff = await _db.Set<Staff>()
                    .SingleOrDefaultAsync(s => s.UserName == request.UserName, cancellationToken);
            }

            if (staff == null)
                return Result.Failure("Staff member not found");

            if (!VerifyPassword(request.CurrentPassword, staff.PasswordHash))
                return Result.Failure("Current password is incorrect");

            staff.PasswordHash = HashPassword(request.NewPassword);
            _db.Set<Staff>().Update(staff);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Password changed successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to change password: {ex.Message}");
        }
    }

    // ---- Password hashing helpers (PBKDF2) ----
    private static string HashPassword(string password)
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

    private static bool VerifyPassword(string password, string stored)
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

