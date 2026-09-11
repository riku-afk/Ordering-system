"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { ApiError } from "@/lib/api/client";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ORDER_STATUSES, orderStatusLabel } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 20;
const TERMINAL_STATUSES: OrderStatus[] = ["COMPLETED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching } = useOrders(page, PAGE_SIZE);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Order #${id} updated`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't update the order status.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {data ? `${data.totalElements} order${data.totalElements === 1 ? "" : "s"}` : "Orders"}
      </p>

      {isLoading && <Skeleton className="h-64 w-full" />}

      {!isLoading && data && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-44">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              )}
              {data.content.map((order) => {
                const isLocked = TERMINAL_STATUSES.includes(order.status);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {order.items.map((item) => `${item.quantity}× ${item.productName}`).join(", ")}
                    </TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        disabled={isLocked || updateStatus.isPending}
                        onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {orderStatusLabel(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={data.first || isFetching}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.number + 1} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data.last || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
