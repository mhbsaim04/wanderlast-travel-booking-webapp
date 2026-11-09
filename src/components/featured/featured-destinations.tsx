import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Suspense } from "react";

import { type Destination } from "@/lib/api";
import { loadAllDestinations } from "@/lib/destinations-server";
import { FeaturedCarousel } from "@/components/featured/featured-carousel";

/** Highest-rated packages first — only a curated few get featured. */
function pickFeatured(destinations: Destination[], count: number) {
  const inStock = destinations.filter((d) => d.price > 0 || d.imageUrl);
  return [...inStock]
    .sort((a, b) => b.rating - a.rating || b.price - a.price)
    .slice(0, count);
}

export const FEATURED_COUNT = 6;

async function FeaturedContent() {
  const { destinations, error } = await loadAllDestinations();
  const featured = pickFeatured(destinations, FEATURED_COUNT);

  // Nothing to feature (backend down or empty catalog) → hide the section.
  if (error || featured.length === 0) {
    return null;
  }

  return (
    <section id="featured" className="scroll-mt-16 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand">
              <Sparkles className="size-3.5" aria-hidden />
              Handpicked for you
            </p>
            <h2 className="mt-2 font-serif text-4xl font-light tracking-wide text-foreground sm:text-5xl">
              Featured Destinations
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              The trips our travelers love most — swipe through and book the
              one that calls you.
            </p>
          </div>
          <Link
            href="/destinations"
            className="text-sm font-medium text-brand underline-offset-4 hover:underline"
          >
            View all destinations →
          </Link>
        </div>

        <div className="mt-8 max-sm:mx-2">
          <FeaturedCarousel destinations={featured} />
        </div>
      </div>
    </section>
  );
}

export function FeaturedDestinations() {
  return (
    <Suspense
      fallback={
        <div className="py-16">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="h-10 w-72 animate-pulse rounded bg-muted/60" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-xl bg-muted/40"
                />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <FeaturedContent />
    </Suspense>
  );
}
