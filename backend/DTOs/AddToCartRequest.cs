namespace backend.DTOs;

public record AddToCartRequest(
    int ProductId,
    int Quantity = 1
);