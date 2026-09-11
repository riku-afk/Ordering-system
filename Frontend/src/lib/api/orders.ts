import { apiClient } from "@/lib/api/client";
import type { OrderResponse, OrderStatus, PageResponse } from "@/lib/api/types";

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

export function updateOrderStatus(
  id: number,
  status: OrderStatus,
  token: string,
): Promise<OrderResponse> {
  return apiClient.patch<OrderResponse>(`/api/orders/${id}/status`, { status }, { token });
}
