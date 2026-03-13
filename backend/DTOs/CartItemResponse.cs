namespace backend.DTOs;

public record CartItemResponse
{
    public int Id { get; init; }

    public int ProductId { get; init; }

    public string ProductName { get; init; } = string.Empty;

    public decimal Price { get; init; }

    public string? ImageUrl { get; init; }

    public int Quantity { get; init; }

    public decimal LineTotal { get; init; }
}
