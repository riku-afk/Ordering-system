"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useOrder } from "@/hooks/use-orders";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { orderStatusBadgeVariant, orderStatusLabel } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = Number(params.id);

  const { user, isLoading: isAuthLoading } = useRequireAuth();
  const { data: order, isLoading, isError } = useOrder(orderId);

  if (isAuthLoading || !user || isLoading) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-48 w-full" />
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center sm:px-6">
        <p className="font-medium">We couldn&apos;t find that order.</p>
        <Button variant="outline" onClick={() => router.push("/orders")}>
          Back to order history
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <button
        type="button"
        onClick={() => router.push("/orders")}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to order history
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Order #{order.id}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
        </div>
        <Badge variant={orderStatusBadgeVariant(order.status)} className="text-sm">
          {orderStatusLabel(order.status)}
        </Badge>
      </div>

      <div className="rounded-lg border border-border">
        <div className="divide-y divide-border px-4">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between py-3 text-sm">
              <span>
                {item.quantity} × {item.productName}
                <span className="ml-2 text-muted-foreground">{formatCurrency(item.unitPrice)} each</span>
              </span>
              <span className="font-medium">{formatCurrency(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex items-center justify-between px-4 py-4 text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </main>
  );
}
