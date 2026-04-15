using backend.Data;
using backend.Middleware;
using backend.Models;
using backend.Security;
using backend.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration.Json;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var jwtSigningKey =
    Environment.GetEnvironmentVariable("JWT_SIGNING_KEY")
    ?? GetNonJsonConfigurationValue(builder.Configuration, "Jwt:SigningKey");

if (string.IsNullOrWhiteSpace(jwtSigningKey))
{
    throw new InvalidOperationException(
        "JWT signing key must be provided through JWT_SIGNING_KEY environment variable or user secrets key Jwt:SigningKey."
    );
}

var jwtOptions = new JwtTokenOptions
{
    SigningKey = jwtSigningKey,
    Issuer = builder.Configuration["Jwt:Issuer"] ?? "buckeye-marketplace",
    Audience = builder.Configuration["Jwt:Audience"] ?? "buckeye-marketplace-client",
    ExpiresMinutes = 60
};

// --- Services ---

builder.Services.AddControllers();
builder.Services.AddSingleton(jwtOptions);
builder.Services.AddSingleton<IPasswordHasher<AuthUser>, PasswordHasher<AuthUser>>();
builder.Services.AddSingleton<InMemoryAuthUserStore>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2),
            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<MarketplaceContext>(options =>
    options.UseSqlite("Data Source=shoppingcart.db"));

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://localhost:5173",
                "http://127.0.0.1:5173",
                "https://127.0.0.1:5173"
            )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// --- Middleware Pipeline ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// --- Seed Data ---

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MarketplaceContext>();
    context.Database.EnsureCreated();
}

app.Run();

static string? GetNonJsonConfigurationValue(IConfiguration configuration, string key)
{
    if (configuration is not IConfigurationRoot configurationRoot)
        return null;

    foreach (var provider in configurationRoot.Providers.Reverse())
    {
        if (provider is JsonConfigurationProvider jsonProvider)
        {
            var sourcePath = jsonProvider.Source?.Path;
            if (!string.IsNullOrWhiteSpace(sourcePath)
                && sourcePath.StartsWith("appsettings", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }
        }

        if (provider.TryGet(key, out var value) && !string.IsNullOrWhiteSpace(value))
            return value;
    }

    return null;
}

public partial class Program;
