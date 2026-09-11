import Link from "next/link";
import type { OrderResponse } from "@/lib/api/types";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { orderStatusBadgeVariant, orderStatusLabel } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function OrderSummaryCard({ order }: { order: OrderResponse }) {
  const itemsPreview = order.items.map((item) => `${item.quantity}× ${item.productName}`).join(", ");

  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium">Order #{order.id}</p>
              <Badge variant={orderStatusBadgeVariant(order.status)}>
                {orderStatusLabel(order.status)}
              </Badge>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">{itemsPreview}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
          </div>
          <p className="shrink-0 font-semibold">{formatCurrency(order.totalAmount)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
