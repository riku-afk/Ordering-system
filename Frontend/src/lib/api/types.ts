/**
 * Types mirroring the backend's DTOs (see each domain's dto/ package under
 * Backend/src/main/java/com/example/ordering). Keep these in sync with the
 * Java records they represent.
 */

export type Role = "CUSTOMER" | "ADMIN";

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserResponse;
}

export interface CategoryResponse {
  id: number;
  name: string;
}

export interface ProductResponse {
  id: number;
  category: CategoryResponse;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}
