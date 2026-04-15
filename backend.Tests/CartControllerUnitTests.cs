using System.Security.Claims;
using backend.Controllers;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class CartControllerUnitTests
{
    [Fact]
    public async Task GetCart_ReturnsUnauthorized_WhenNameIdentifierClaimMissing()
    {
        await using var context = BuildContext(nameof(GetCart_ReturnsUnauthorized_WhenNameIdentifierClaimMissing));
        var controller = new CartController(context)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity())
                }
            }
        };

        var result = await controller.GetCart();

        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task GetCart_ReturnsExpectedTotals_ForCurrentUser()
    {
        const string userId = "user-a";
        await using var context = BuildContext(nameof(GetCart_ReturnsExpectedTotals_ForCurrentUser));

        var productOne = new Product
        {
            Id = 101,
            Name = "Laptop Stand",
            Price = 10.00m,
            CategoryId = 1
        };

        var productTwo = new Product
        {
            Id = 102,
            Name = "USB-C Cable",
            Price = 5.50m,
            CategoryId = 1
        };

        var cart = new Cart
        {
            Id = 900,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Items =
            [
                new CartItem { Id = 1, ProductId = productOne.Id, Product = productOne, Quantity = 2 },
                new CartItem { Id = 2, ProductId = productTwo.Id, Product = productTwo, Quantity = 3 }
            ]
        };

        context.Products.AddRange(productOne, productTwo);
        context.Carts.Add(cart);
        await context.SaveChangesAsync();

        var identity = new ClaimsIdentity(
            [new Claim(ClaimTypes.NameIdentifier, userId)],
            authenticationType: "test"
        );

        var controller = new CartController(context)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(identity)
                }
            }
        };

        var result = await controller.GetCart();
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<CartResponse>(ok.Value);

        Assert.Equal(5, response.TotalItems);
        Assert.Equal(36.50m, response.Subtotal);
        Assert.Equal(36.50m, response.Total);
    }

    private static MarketplaceContext BuildContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<MarketplaceContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        return new MarketplaceContext(options);
    }
}
