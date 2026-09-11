"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CartLineItem } from "@/components/cart/cart-line-item";

export default function CartPage() {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center sm:px-6">
        <ShoppingCart className="size-8 text-muted-foreground" />
        <p className="font-medium">Your cart is empty</p>
        <p className="text-sm text-muted-foreground">Add something from the menu to get started.</p>
        <Link href="/products" className={buttonVariants({ className: "mt-2" })}>
          Browse the menu
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Your cart</h1>

      <div className="divide-y divide-border">
        {items.map((item) => (
          <CartLineItem key={item.productId} item={item} />
        ))}
      </div>

      <Separator className="my-6" />

      <div className="flex items-center justify-between text-lg font-semibold">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      <Link href="/checkout" className={buttonVariants({ className: "mt-6 w-full", size: "lg" })}>
        Proceed to checkout
      </Link>
    </main>
  );
}
