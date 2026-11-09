"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, CalendarDays, MapPin, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Destination } from "@/lib/api";

const PRICE_RANGES = [
  { value: "any", label: "Any price", min: 0, max: Number.POSITIVE_INFINITY },
  { value: "under-1000", label: "Under $1,000", min: 0, max: 999.99 },
  { value: "1000-2500", label: "$1,000 – $2,500", min: 1000, max: 2500 },
  { value: "above-2500", label: "Above $2,500", min: 2501, max: Number.POSITIVE_INFINITY },
] as const;

type PriceRangeValue = (typeof PRICE_RANGES)[number]["value"];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A–Z" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const triggerClass =
  "h-12 w-full justify-between rounded-md text-xs font-medium uppercase tracking-wider text-foreground/80 data-placeholder:text-foreground/60 hover:bg-muted/40";

function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-soft/40">
        {/* Backend-provided remote URLs — plain img, host list isn't in next.config */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={destination.imageUrl ?? "/imges/Wanderlast.png"}
          alt={destination.name}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-foreground shadow-sm">
          {destination.rating.toFixed(1)}
          <Star className="size-3 fill-foreground text-foreground" aria-hidden />
        </span>
      </div>

      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {destination.country}
        </div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg leading-tight text-foreground">
            {destination.name}
          </h3>
          <p className="shrink-0 text-base font-bold text-foreground">
            ${destination.price.toLocaleString("en-US")}
            <span className="align-top text-[10px] font-medium text-foreground/60">
              /Person
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          {destination.duration}
        </div>
        <Link
          href={
            destination.id
              ? `/destinations/${destination.id}`
              : `/destinations/${encodeURIComponent(destination.name)}`
          }
          className="mt-2 inline-flex items-center gap-1 self-start text-xs font-bold uppercase tracking-wider text-brand hover:underline"
        >
          Book Now
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </article>
  );
}

export function DestinationsExplorer({
  destinations,
  error,
}: {
  destinations: Destination[];
  error?: string | null;
}) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState<PriceRangeValue>("any");
  const [sortBy, setSortBy] = useState<SortValue>("featured");

  const categories = [...new Set(destinations.map((d) => d.category))].sort();
  const range =
    PRICE_RANGES.find((option) => option.value === priceRange) ?? PRICE_RANGES[0];

  const filtered = destinations
    .filter(
      (d) =>
        (categoryFilter === "all" || d.category === categoryFilter) &&
        d.price >= range.min &&
        d.price <= range.max
    )
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <section className="px-4 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="font-serif text-4xl font-light tracking-wide text-foreground sm:text-5xl">
          Explore All Destinations
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Find your perfect travel experience from our curated collection
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(String(value ?? "all"))}
          >
            <SelectTrigger className={triggerClass} aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priceRange}
            onValueChange={(value) => setPriceRange(String(value ?? "any") as PriceRangeValue)}
          >
            <SelectTrigger className={triggerClass} aria-label="Filter by price range">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_RANGES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(String(value ?? "featured") as SortValue)}
          >
            <SelectTrigger className={triggerClass} aria-label="Sort destinations">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Showing {filtered.length} of {destinations.length} destinations
        </p>

        {error ? (
          <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {!error && filtered.length > 0 ? (
          <div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((destination) => (
              <DestinationCard
                key={destination.id ?? destination.name}
                destination={destination}
              />
            ))}
          </div>
        ) : null}

        {!error && destinations.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-input bg-brand-soft/40 px-4 py-10 text-center text-sm text-muted-foreground">
            No destinations yet — add your first travel package to publish it
            here.
          </div>
        ) : null}

        {!error &&
        destinations.length > 0 &&
        filtered.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-input bg-brand-soft/40 px-4 py-10 text-center text-sm text-muted-foreground">
            No destinations match your filters.
          </div>
        ) : null}
      </div>
    </section>
  );
}
