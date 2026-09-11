"use client";

import { ImageOff, Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/lib/cart/cart-context";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external, admin-supplied URLs; no image pipeline configured for this portfolio project
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="size-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1">
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
      </div>

      <div className="flex items-center rounded-lg border border-border">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Decrease quantity"
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-8 text-center text-sm font-medium" aria-live="polite">
          {item.quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Increase quantity"
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <p className="w-20 text-right font-medium">{formatCurrency(item.price * item.quantity)}</p>

      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="ghost" size="icon" aria-label="Remove item" />}>
          <Trash2 className="size-4" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove &quot;{item.name}&quot; from your cart.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => removeItem(item.productId)}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
