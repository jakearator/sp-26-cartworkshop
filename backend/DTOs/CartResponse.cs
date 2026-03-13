namespace backend.DTOs;

public record CartResponse
{
    public int Id { get; init; }

    public string UserId { get; init; } = string.Empty;

    public List<CartItemResponse> Items { get; init; } = [];

    public int TotalItems { get; init; }

    public decimal Subtotal { get; init; }

    public decimal Total { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime UpdatedAt { get; init; }
}
