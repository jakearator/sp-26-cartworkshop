import type { ProductFilters, ProductResponse } from "../types/product";

export async function fetchProducts(
    filters?: ProductFilters,
): Promise<ProductResponse[]> {
    const params = new URLSearchParams();

    if (filters?.category) params.set("category", filters.category);
    if (filters?.minPrice != null)
        params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice != null)
        params.set("maxPrice", String(filters.maxPrice));

    const query = params.toString();
    const url = `/api/Products${query ? `?${query}` : ""}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
    return res.json();
}

export async function fetchProduct(id: number): Promise<ProductResponse> {
    const res = await fetch(`/api/Products/${encodeURIComponent(id)}`);
    if (res.status === 404) throw new NotFoundError("Product not found");
    if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);
    return res.json();
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}
