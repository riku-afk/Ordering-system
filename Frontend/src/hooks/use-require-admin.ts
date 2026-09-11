"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * Redirects non-admins away from admin pages: to /login (preserving
 * /admin as the return path) if signed out, or to / if signed in as a
 * non-admin. The backend enforces this too - this is purely for UX.
 */
export function useRequireAdmin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login?redirect=/admin");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  return { user, isLoading, isAdmin: user?.role === "ADMIN" };
}
