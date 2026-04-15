import type { ProductFilters, ProductResponse } from "../types/product";
import { ApiError, apiFetchJson } from "./client";

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

    return apiFetchJson<ProductResponse[]>(url);
}

export async function fetchProduct(id: number): Promise<ProductResponse> {
    try {
        return await apiFetchJson<ProductResponse>(`/api/Products/${encodeURIComponent(id)}`);
    } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 404) {
            throw new NotFoundError("Product not found");
        }

        throw error;
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}
