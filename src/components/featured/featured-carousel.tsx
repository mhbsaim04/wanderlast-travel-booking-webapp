"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Star,
} from "lucide-react";

import type { Destination } from "@/lib/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function FeaturedCard({ destination }: { destination: Destination }) {
  return (
    <article className="group h-full overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/5">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-soft/40">
        {/* Backend-provided remote URLs — plain img, host list isn't in next.config */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={destination.imageUrl ?? "/imges/Wanderlast.png"}
          alt={destination.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold shadow-sm">
          {destination.rating.toFixed(1)}
          <Star className="size-3 fill-foreground" aria-hidden />
        </span>
        <span className="absolute top-3 left-3 rounded-md bg-brand px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          Featured
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
          <p className="shrink-0 text-base font-bold">
            ${destination.price.toLocaleString("en-US")}
            <span className="align-top text-[10px] font-medium text-muted-foreground">
              /person
            </span>
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            {destination.duration}
          </span>
          <Link
            href={
              destination.id
                ? `/destinations/${destination.id}`
                : `/destinations/${encodeURIComponent(destination.name)}`
            }
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand hover:underline"
          >
            Book Now
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function FeaturedCarousel({
  destinations,
}: {
  destinations: Destination[];
}) {
  return (
    <Carousel
      opts={{ align: "start", loop: destinations.length > 3 }}
      className="w-full"
    >
      <CarouselContent className="pb-2">
        {destinations.map((destination) => (
          <CarouselItem
            key={destination.id ?? destination.name}
            className="basis-full sm:basis-1/2 lg:basis-1/3"
          >
            <FeaturedCard destination={destination} />
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Arrows hovered nicely inside the section */}
      <CarouselPrevious className="border-border/60 bg-white size-9 shadow-md hover:bg-brand-soft/60 max-sm:-left-2 sm:-left-11" />
      <CarouselNext className="border-border/60 bg-white size-9 shadow-md hover:bg-brand-soft/60 max-sm:-right-2 sm:-right-11" />
    </Carousel>
  );
}
