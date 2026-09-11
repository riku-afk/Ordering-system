import { apiClient } from "@/lib/api/client";
import type { PageResponse, ProductResponse } from "@/lib/api/types";

export interface ProductQuery {
  search?: string;
  category?: number;
  available?: boolean;
  page?: number;
  size?: number;
}

export function fetchProducts(query: ProductQuery = {}): Promise<PageResponse<ProductResponse>> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category !== undefined) params.set("category", String(query.category));
  if (query.available !== undefined) params.set("available", String(query.available));
  params.set("page", String(query.page ?? 0));
  params.set("size", String(query.size ?? 12));

  return apiClient.get<PageResponse<ProductResponse>>(`/api/products?${params.toString()}`);
}

export function fetchProduct(id: number): Promise<ProductResponse> {
  return apiClient.get<ProductResponse>(`/api/products/${id}`);
}

export interface ProductPayload {
  categoryId: number;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
}

export function createProduct(
  payload: ProductPayload & { available?: boolean },
  token: string,
): Promise<ProductResponse> {
  return apiClient.post<ProductResponse>("/api/products", payload, { token });
}

export function updateProduct(
  id: number,
  payload: ProductPayload,
  token: string,
): Promise<ProductResponse> {
  return apiClient.put<ProductResponse>(`/api/products/${id}`, payload, { token });
}

export function updateProductAvailability(
  id: number,
  available: boolean,
  token: string,
): Promise<ProductResponse> {
  return apiClient.patch<ProductResponse>(`/api/products/${id}/availability`, { available }, { token });
}
