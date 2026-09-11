import { apiClient } from "@/lib/api/client";
import type { OrderResponse, PageResponse } from "@/lib/api/types";

export interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export function createOrder(items: CreateOrderItem[], token: string): Promise<OrderResponse> {
  return apiClient.post<OrderResponse>("/api/orders", { items }, { token });
}

export function fetchOrders(
  page: number,
  size: number,
  token: string,
): Promise<PageResponse<OrderResponse>> {
  return apiClient.get<PageResponse<OrderResponse>>(
    `/api/orders?page=${page}&size=${size}`,
    { token },
  );
}

export function fetchOrder(id: number, token: string): Promise<OrderResponse> {
  return apiClient.get<OrderResponse>(`/api/orders/${id}`, { token });
}
