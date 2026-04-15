using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public record LoginRequest(
    [Required, MinLength(3), MaxLength(50)] string Username,
    [Required, MinLength(8), MaxLength(128)] string Password
);
