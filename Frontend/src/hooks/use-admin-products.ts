import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import {
  createProduct,
  updateProduct,
  updateProductAvailability,
  type ProductPayload,
} from "@/lib/api/products";

export function useCreateProduct() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload & { available?: boolean }) => {
      if (!token) throw new Error("You must be signed in to do that.");
      return createProduct(payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) => {
      if (!token) throw new Error("You must be signed in to do that.");
      return updateProduct(id, payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductAvailability() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) => {
      if (!token) throw new Error("You must be signed in to do that.");
      return updateProductAvailability(id, available, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
