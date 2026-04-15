using backend.DTOs;
using backend.Security;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly InMemoryAuthUserStore _userStore;
    private readonly JwtTokenOptions _jwtOptions;

    public AuthController(InMemoryAuthUserStore userStore, JwtTokenOptions jwtOptions)
    {
        _userStore = userStore;
        _jwtOptions = jwtOptions;
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult<AuthResponse> Register(RegisterRequest request)
    {
        if (_userStore.UsernameExists(request.Username))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Username unavailable",
                Detail = "A user with this username already exists."
            });
        }

        var user = _userStore.CreateUser(request.Username, request.Password);
        var response = CreateAuthResponse(user.Id, user.Username, user.Role);

        return Created(string.Empty, response);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult<AuthResponse> Login(LoginRequest request)
    {
        var user = _userStore.ValidateCredentials(request.Username, request.Password);

        if (user is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Invalid credentials",
                Detail = "Username or password is incorrect."
            });
        }

        var response = CreateAuthResponse(user.Id, user.Username, user.Role);
        return Ok(response);
    }

    private AuthResponse CreateAuthResponse(string userId, string username, string role)
    {
        var now = DateTime.UtcNow;
        var expiresAt = now.AddMinutes(_jwtOptions.ExpiresMinutes);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Name, username),
            new(ClaimTypes.Role, role)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SigningKey));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            notBefore: now,
            expires: expiresAt,
            signingCredentials: credentials
        );

        var token = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);

        return new AuthResponse(token, expiresAt, userId, username, role);
    }
}
