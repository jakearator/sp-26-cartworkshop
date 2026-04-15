using backend.Models;
using Microsoft.AspNetCore.Identity;
using System.Collections.Concurrent;

namespace backend.Services;

public class InMemoryAuthUserStore
{
    private readonly ConcurrentDictionary<string, AuthUser> _usersByUsername =
        new(StringComparer.OrdinalIgnoreCase);

    private readonly IPasswordHasher<AuthUser> _passwordHasher;

    public InMemoryAuthUserStore(IPasswordHasher<AuthUser> passwordHasher)
    {
        _passwordHasher = passwordHasher;
    }

    public bool UsernameExists(string username)
    {
        var normalized = NormalizeUsername(username);
        return _usersByUsername.ContainsKey(normalized);
    }

    public AuthUser CreateUser(string username, string password, string role = "Customer")
    {
        var normalized = NormalizeUsername(username);

        var user = new AuthUser
        {
            Id = Guid.NewGuid().ToString("N"),
            Username = normalized,
            Role = role,
            CreatedAt = DateTime.UtcNow,
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, password);

        if (!_usersByUsername.TryAdd(normalized, user))
            throw new InvalidOperationException("Username is already registered.");

        return user;
    }

    public AuthUser? ValidateCredentials(string username, string password)
    {
        var normalized = NormalizeUsername(username);

        if (!_usersByUsername.TryGetValue(normalized, out var user))
            return null;

        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);

        if (verificationResult == PasswordVerificationResult.Failed)
            return null;

        if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
            user.PasswordHash = _passwordHasher.HashPassword(user, password);

        return user;
    }

    private static string NormalizeUsername(string username)
    {
        return username.Trim();
    }
}
