export interface ProductResponse {
    id: number;
    name: string | null;
    description: string | null;
    price: number;
    categoryName: string | null;
    imageUrl: string | null;
    createdAt: string;
}

export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}
