"use client";

import Link from "next/link";
import { ClipboardList, Package, Tags } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useOrders } from "@/hooks/use-orders";
import { OrderSummaryCard } from "@/components/orders/order-summary-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
}: {
  icon: typeof Package;
  label: string;
  value: number | undefined;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-6 w-10" />
          ) : (
            <p className="text-xl font-semibold">{value ?? 0}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const products = useProducts({ page: 0, size: 1 });
  const categories = useCategories();
  const orders = useOrders(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Package}
          label="Products"
          value={products.data?.totalElements}
          isLoading={products.isLoading}
        />
        <StatCard
          icon={Tags}
          label="Categories"
          value={categories.data?.length}
          isLoading={categories.isLoading}
        />
        <StatCard
          icon={ClipboardList}
          label="Orders"
          value={orders.data?.totalElements}
          isLoading={orders.isLoading}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/products" className={buttonVariants()}>
          Manage products
        </Link>
        <Link href="/admin/orders" className={buttonVariants({ variant: "outline" })}>
          Manage orders
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {orders.isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          {!orders.isLoading && orders.data?.content.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
          {orders.data?.content.map((order) => (
            <OrderSummaryCard key={order.id} order={order} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
