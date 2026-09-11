"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { CategoryResponse, ProductResponse } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const productFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required").max(150, "Must be at most 150 characters"),
  description: z.string().max(2000, "Must be at most 2000 characters").optional(),
  price: z.coerce.number().positive("Must be greater than 0"),
  imageUrl: z.string().max(500, "Must be at most 500 characters").optional(),
});

// price is entered as a string but coerced to a number by the schema, so
// the form's live values (input) and its validated result (output) differ.
type ProductFormInput = z.input<typeof productFormSchema>;
type ProductFormOutput = z.output<typeof productFormSchema>;

interface ProductFormDialogProps {
  trigger: ReactNode;
  categories: CategoryResponse[];
  /** Omit to create a new product; pass to edit an existing one. */
  product?: ProductResponse;
}

export function ProductFormDialog({ trigger, categories, product }: ProductFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(product);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        categoryId: product ? String(product.category.id) : "",
        name: product?.name ?? "",
        description: product?.description ?? "",
        price: product?.price ?? undefined,
        imageUrl: product?.imageUrl ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the dialog opens
  }, [open]);

  const onSubmit = async (values: ProductFormOutput) => {
    const payload = {
      categoryId: Number(values.categoryId),
      name: values.name,
      description: values.description || null,
      price: values.price,
      imageUrl: values.imageUrl || null,
    };

    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, payload });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync(payload);
        toast.success("Product created");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit product" : "New product"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update this item's details." : "Add a new item to the menu."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField label="Category" htmlFor="categoryId" error={errors.categoryId?.message}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="categoryId" className="w-full">
                    <SelectValue placeholder="Select a category">
                      {(value: string | null) =>
                        categories.find((category) => String(category.id) === value)?.name ??
                        "Select a category"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" {...register("name")} />
          </FormField>

          <FormField label="Description" htmlFor="description" error={errors.description?.message}>
            <Textarea id="description" rows={3} {...register("description")} />
          </FormField>

          <FormField label="Price (₱)" htmlFor="price" error={errors.price?.message}>
            <Input id="price" type="number" step="0.01" min="0" {...register("price")} />
          </FormField>

          <FormField label="Image URL" htmlFor="imageUrl" error={errors.imageUrl?.message}>
            <Input id="imageUrl" {...register("imageUrl")} />
          </FormField>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
