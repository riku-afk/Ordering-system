import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import { createOrder, fetchOrder, fetchOrders, type CreateOrderItem } from "@/lib/api/orders";

export function useOrders(page: number, size = 10) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["orders", page, size],
    queryFn: () => fetchOrders(page, size, token!),
    enabled: Boolean(token),
  });
}

export function useOrder(id: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => fetchOrder(id, token!),
    enabled: Boolean(token) && Number.isFinite(id),
  });
}

export function useCreateOrder() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: CreateOrderItem[]) => {
      if (!token) {
        throw new Error("You must be signed in to place an order.");
      }
      return createOrder(items, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
