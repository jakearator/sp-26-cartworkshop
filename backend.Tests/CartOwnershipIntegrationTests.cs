using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Data;
using backend.DTOs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace backend.Tests;

public class CartOwnershipIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CartOwnershipIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task UpdateCartItem_ReturnsNotFound_WhenItemBelongsToDifferentUser()
    {
        var userA = await RegisterAsync("owner_user", "StrongPass123!");
        var userB = await RegisterAsync("other_user", "StrongPass123!");

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userA.Token);
        var addResponse = await _client.PostAsJsonAsync("/api/cart", new AddToCartRequest(ProductId: 1, Quantity: 1));
        Assert.Equal(HttpStatusCode.Created, addResponse.StatusCode);

        var addedItem = await addResponse.Content.ReadFromJsonAsync<CartItemResponse>();
        Assert.NotNull(addedItem);

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userB.Token);
        var updateResponse = await _client.PutAsJsonAsync(
            $"/api/cart/{addedItem!.Id}",
            new UpdateCartItemRequest(Quantity: 5)
        );

        Assert.Equal(HttpStatusCode.NotFound, updateResponse.StatusCode);
    }

    private async Task<AuthResponse> RegisterAsync(string username, string password)
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(username, password));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(authResponse);
        return authResponse!;
    }
}

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, configurationBuilder) =>
        {
            configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:SigningKey"] = "integration-test-signing-key-1234567890",
                ["Jwt:Issuer"] = "buckeye-marketplace-tests",
                ["Jwt:Audience"] = "buckeye-marketplace-tests-client"
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<MarketplaceContext>));
            services.RemoveAll(typeof(MarketplaceContext));

            var dbName = $"backend-integration-tests-{Guid.NewGuid():N}";
            services.AddDbContext<MarketplaceContext>(options => options.UseInMemoryDatabase(dbName));

            using var scope = services.BuildServiceProvider().CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<MarketplaceContext>();
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();
        });
    }
}
