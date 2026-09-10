"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiClient } from "@/lib/api/client";
import type { AuthResponse, UserResponse } from "@/lib/api/types";

const STORAGE_KEY = "ordering-system.auth";

interface StoredAuth {
  token: string;
  user: UserResponse;
}

interface AuthContextValue {
  user: UserResponse | null;
  token: string | null;
  /** True until the persisted session has been read from storage. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // One-time hydration from localStorage - can only happen client-side
    // after mount, so an effect (not a lazy initializer) is required here.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSession(JSON.parse(raw) as StoredAuth);
      }
    } catch {
      // Corrupt or inaccessible storage - treat as logged out.
    } finally {
      setIsLoading(false);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, []);

  const persist = useCallback((auth: AuthResponse) => {
    const next: StoredAuth = { token: auth.token, user: auth.user };
    setSession(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiClient.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      });
      persist(response);
    },
    [persist],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await apiClient.post<AuthResponse>("/api/auth/register", {
        name,
        email,
        password,
      });
      persist(response);
    },
    [persist],
  );

  const logout = useCallback(() => {
    setSession(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isLoading,
      login,
      register,
      logout,
    }),
    [session, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
