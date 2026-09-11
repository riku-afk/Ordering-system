"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useOrders } from "@/hooks/use-orders";
import { OrderSummaryCard } from "@/components/orders/order-summary-card";
import { buttonVariants, Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const { user, isLoading: isAuthLoading } = useRequireAuth();
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching, isError } = useOrders(page, PAGE_SIZE);

  if (isAuthLoading || !user) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-24 w-full" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Order history</h1>

      {isError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Couldn&apos;t load your orders right now. Please try again shortly.
        </p>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      )}

      {!isLoading && data && data.content.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-24 text-center">
          <Receipt className="size-8 text-muted-foreground" />
          <p className="font-medium">No orders yet</p>
          <p className="text-sm text-muted-foreground">Your past orders will show up here.</p>
          <Link href="/products" className={buttonVariants({ className: "mt-2" })}>
            Browse the menu
          </Link>
        </div>
      )}

      {!isLoading && data && data.content.length > 0 && (
        <>
          <div className="space-y-3" aria-busy={isFetching}>
            {data.content.map((order) => (
              <OrderSummaryCard key={order.id} order={order} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
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
        </>
      )}
    </main>
  );
}
