"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useUpdateProductAvailability } from "@/hooks/use-admin-products";
import { ApiError } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching } = useProducts({ page, size: PAGE_SIZE });
  const { data: categories } = useCategories();
  const updateAvailability = useUpdateProductAvailability();

  const handleToggleAvailability = async (id: number, available: boolean) => {
    try {
      await updateAvailability.mutateAsync({ id, available });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't update availability.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data ? `${data.totalElements} product${data.totalElements === 1 ? "" : "s"}` : "Products"}
        </p>
        <ProductFormDialog
          categories={categories ?? []}
          trigger={
            <Button>
              <Plus className="size-4" />
              Add product
            </Button>
          }
        />
      </div>

      {isLoading && <Skeleton className="h-64 w-full" />}

      {!isLoading && data && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No products yet.
                  </TableCell>
                </TableRow>
              )}
              {data.content.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category.name}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={product.available}
                      disabled={updateAvailability.isPending}
                      onCheckedChange={(checked) => handleToggleAvailability(product.id, checked)}
                      aria-label={`Toggle availability for ${product.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <ProductFormDialog
                      categories={categories ?? []}
                      product={product}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`}>
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
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
