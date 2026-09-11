"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * Redirects to /login (preserving the current path to return to) once it's
 * clear the session finished loading and there's no user. Pages using this
 * should render a loading state while `isLoading` is true.
 */
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname]);

  return { user, isLoading };
}
