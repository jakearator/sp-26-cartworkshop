namespace backend.Security;

public class JwtTokenOptions
{
    public string SigningKey { get; init; } = string.Empty;

    public string Issuer { get; init; } = string.Empty;

    public string Audience { get; init; } = string.Empty;

    public int ExpiresMinutes { get; init; } = 60;
}
