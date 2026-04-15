namespace backend.DTOs;

public record AuthResponse(
    string Token,
    DateTime ExpiresAtUtc,
    string UserId,
    string Username,
    string Role
);
