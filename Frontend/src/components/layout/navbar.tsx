"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Menu, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [{ href: "/products", label: "Menu" }];

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base font-semibold tracking-tight">
            Ordering System
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
            {user && (
              <Link href="/orders" className="transition-colors hover:text-foreground">
                Orders
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="transition-colors hover:text-foreground">
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/cart"
            aria-label="Cart"
            className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}
          >
            <ShoppingCart className="size-4" />
            {itemCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] leading-none">
                {itemCount}
              </Badge>
            )}
          </Link>

          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" aria-label="Account menu" />}
              >
                <User className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/orders" />}>Order history</DropdownMenuItem>
                {user.role === "ADMIN" && (
                  <DropdownMenuItem render={<Link href="/admin" />}>
                    <LayoutDashboard className="size-4" />
                    Admin dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={logout}>
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                Sign in
              </Link>
              <Link href="/register" className={buttonVariants()}>
                Sign up
              </Link>
            </div>
          )}

          {!user && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" aria-label="Menu" className="sm:hidden" />}
              >
                <Menu className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem render={<Link href="/products" />}>Menu</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/login" />}>Sign in</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/register" />}>Sign up</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
