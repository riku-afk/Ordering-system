"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageOff, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = Number(params.id);

  const { data: product, isLoading, isError } = useProduct(productId);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      quantity,
    );
    toast.success(`Added ${quantity} × ${product.name} to cart`);
    setQuantity(1);
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-4 h-10 w-32" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center sm:px-6">
        <p className="font-medium">We couldn&apos;t find that item.</p>
        <Button variant="outline" onClick={() => router.push("/products")}>
          Back to the menu
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to the menu
      </Link>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external, admin-supplied URLs; no image pipeline configured for this portfolio project
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-10" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Badge variant="outline" className="mb-2 text-xs font-normal text-muted-foreground">
              {product.category.name}
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          </div>

          {product.description && <p className="text-muted-foreground">{product.description}</p>}

          <p className="text-2xl font-semibold">{formatCurrency(product.price)}</p>

          {!product.available ? (
            <Badge variant="secondary" className="w-fit">
              Currently sold out
            </Badge>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <Button onClick={handleAddToCart} className="flex-1 sm:flex-none">
                Add to cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
