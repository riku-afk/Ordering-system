import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center sm:px-6">
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          Order ahead, skip the line
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Good food, ordered simply.
        </h1>
        <p className="max-w-md text-balance text-muted-foreground">
          Browse the menu, build your order, and check out in a couple of taps.
        </p>
        <Link href="/products" className={buttonVariants({ size: "lg" })}>
          View the menu
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}
