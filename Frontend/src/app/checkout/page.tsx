"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import { useCreateOrder } from "@/hooks/use-orders";
import { ApiError } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { items, subtotal, clear } = useCart();
  const createOrder = useCreateOrder();
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login?redirect=/checkout");
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-32 w-full" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center sm:px-6">
        <p className="font-medium">Your cart is empty</p>
        <p className="text-sm text-muted-foreground">Add something from the menu before checking out.</p>
        <Link href="/products" className={buttonVariants({ className: "mt-2" })}>
          Browse the menu
        </Link>
      </main>
    );
  }

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    try {
      const order = await createOrder.mutateAsync(
        items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      );
      clear();
      toast.success("Order placed!");
      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Couldn't place your order. Please try again.",
      );
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Checkout</h1>

      <div className="rounded-lg border border-border">
        <div className="divide-y divide-border px-4">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between py-3 text-sm">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex items-center justify-between px-4 py-4 text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Prices are confirmed by the kitchen at checkout - what you see here may differ slightly if
        an item&apos;s price changed since you added it.
      </p>

      <Button size="lg" className="mt-6 w-full" disabled={isPlacing} onClick={handlePlaceOrder}>
        {isPlacing ? "Placing order..." : `Place order - ${formatCurrency(subtotal)}`}
      </Button>
    </main>
  );
}
