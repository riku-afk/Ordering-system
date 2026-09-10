import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "cn";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Label + control + validation message, wired together by id. A thin,
 * explicit stand-in for shadcn's react-hook-form-bound <Form> primitives,
 * which aren't published for this registry's Base UI variant.
 */
export function FormField({ label, htmlFor, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
