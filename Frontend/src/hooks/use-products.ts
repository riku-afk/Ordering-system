import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchProduct, fetchProducts, type ProductQuery } from "@/lib/api/products";

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: ["products", query],
    queryFn: () => fetchProducts(query),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProduct(id),
    enabled: Number.isFinite(id),
  });
}
