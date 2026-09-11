"use client";

import Link from "next/link";
import { ImageOff, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ProductResponse } from "@/lib/api/types";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function ProductCard({ product }: { product: ProductResponse }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <Card className="flex flex-col overflow-hidden py-0">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] w-full bg-muted">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external, admin-supplied URLs; no image pipeline configured for this portfolio project
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-8" />
            </div>
          )}
          {!product.available && (
            <Badge variant="secondary" className="absolute left-2 top-2">
              Sold out
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col gap-1 pt-4">
        <Badge variant="outline" className="w-fit text-xs font-normal text-muted-foreground">
          {product.category.name}
        </Badge>
        <Link href={`/products/${product.id}`} className="font-medium hover:underline underline-offset-4">
          {product.name}
        </Link>
        {product.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pb-4">
        <span className="font-semibold">{formatCurrency(product.price)}</span>
        <Button size="sm" disabled={!product.available} onClick={handleAddToCart}>
          <Plus className="size-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
