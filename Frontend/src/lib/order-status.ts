import type { OrderStatus } from "@/lib/api/types";

const LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const BADGE_VARIANTS: Record<OrderStatus, "outline" | "secondary" | "default" | "destructive"> = {
  PENDING: "outline",
  CONFIRMED: "outline",
  PREPARING: "secondary",
  READY: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

export function orderStatusLabel(status: OrderStatus): string {
  return LABELS[status];
}

export function orderStatusBadgeVariant(status: OrderStatus) {
  return BADGE_VARIANTS[status];
}

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];
