using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private const string CurrentUserId = "default-user";

    private readonly MarketplaceContext _context;

    public CartController(MarketplaceContext context)
    {
        _context = context;
    }

    [HttpGet]
    [ProducesResponseType(typeof(CartResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CartResponse>> GetCart()
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

        if (cart is null)
            return NotFound();

        var response = MapCartResponse(cart);
        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CartItemResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CartItemResponse>> AddToCart(AddToCartRequest request)
    {
        var product = await _context.Products.FindAsync(request.ProductId);
        if (product is null)
            return NotFound();

        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

        if (cart is null)
        {
            cart = new Cart
            {
                UserId = CurrentUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Carts.Add(cart);
        }

        var cartItem = cart.Items.FirstOrDefault(item => item.ProductId == request.ProductId);
        if (cartItem is null)
        {
            cartItem = new CartItem
            {
                ProductId = request.ProductId,
                Quantity = request.Quantity
            };

            cart.Items.Add(cartItem);
        }
        else
        {
            cartItem.Quantity += request.Quantity;
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var response = new CartItemResponse
        {
            Id = cartItem.Id,
            ProductId = product.Id,
            ProductName = product.Name,
            Price = product.Price,
            ImageUrl = product.ImageUrl,
            Quantity = cartItem.Quantity,
            LineTotal = product.Price * cartItem.Quantity
        };

        return CreatedAtAction(nameof(GetCart), response);
    }

    [HttpPut("{cartItemId}")]
    [ProducesResponseType(typeof(CartItemResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CartItemResponse>> UpdateCartItem(int cartItemId, UpdateCartItemRequest request)
    {
        var cartItem = await _context.CartItems
            .Include(item => item.Cart)
            .Include(item => item.Product)
            .FirstOrDefaultAsync(item => item.Id == cartItemId);

        if (cartItem is null)
            return NotFound();

        if (cartItem.Cart.UserId != CurrentUserId)
            return NotFound();

        cartItem.Quantity = request.Quantity;
        cartItem.Cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = new CartItemResponse
        {
            Id = cartItem.Id,
            ProductId = cartItem.ProductId,
            ProductName = cartItem.Product.Name,
            Price = cartItem.Product.Price,
            ImageUrl = cartItem.Product.ImageUrl,
            Quantity = cartItem.Quantity,
            LineTotal = cartItem.Product.Price * cartItem.Quantity
        };

        return Ok(response);
    }

    [HttpDelete("{cartItemId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCartItem(int cartItemId)
    {
        var cartItem = await _context.CartItems
            .Include(item => item.Cart)
            .FirstOrDefaultAsync(item => item.Id == cartItemId);

        if (cartItem is null)
            return NotFound();

        if (cartItem.Cart.UserId != CurrentUserId)
            return NotFound();

        _context.CartItems.Remove(cartItem);
        cartItem.Cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("clear")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ClearCart()
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

        if (cart is null)
            return NotFound();

        _context.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static CartResponse MapCartResponse(Cart cart)
    {
        return new CartResponse
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Items = cart.Items.Select(i => new CartItemResponse
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                Price = i.Product.Price,
                ImageUrl = i.Product.ImageUrl,
                Quantity = i.Quantity,
                LineTotal = i.Product.Price * i.Quantity
            }).ToList(),
            TotalItems = cart.Items.Sum(i => i.Quantity),
            Subtotal = cart.Items.Sum(i => i.Product.Price * i.Quantity),
            Total = cart.Items.Sum(i => i.Product.Price * i.Quantity),
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt,
        };
    }
}