import { apiClient } from "@/lib/api/client";
import type { CategoryResponse } from "@/lib/api/types";

export function fetchCategories(): Promise<CategoryResponse[]> {
  return apiClient.get<CategoryResponse[]>("/api/categories");
}
