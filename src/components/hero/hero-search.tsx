"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Search, Ticket } from "lucide-react";

import type { Destination } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

/** Subset of the booking document coming from GET /api/bookings. */
interface BookingLite {
  _id: string;
  name: string;
  ref: string;
  country?: string;
}

function parseBudget(budget: string): { min: number; max: number } | null {
  // Accepts "$100-$3000", "0-3000", "-1500", "2000+" style input.
  const cleaned = budget.replace(/[$,\s]/g, "").trim();
  if (!cleaned) return null;

  const plusMatch = cleaned.match(/^(\d+)\+$/);
  if (plusMatch) return { min: Number(plusMatch[1]), max: Infinity };

  const parts = cleaned
    .split("-")
    .map((part) => Number(part))
    .filter((value) => Number.isFinite(value));
  if (parts.length === 0) return null;
  if (parts.length === 1) {
    // A single number acts as the maximum budget.
    const [max] = parts;
    if (max === undefined || max <= 0) return null;
    return { min: 0, max };
  }
  const [min, max] = parts;
  return max === undefined
    ? { min: min ?? 0, max: Infinity }
    : { min: min ?? 0, max };
}

const FIELD_CLASS =
  "w-full bg-transparent text-xs font-medium text-white placeholder:font-normal placeholder:text-white/70 focus:outline-none";

export function HeroSearch({ destinations }: { destinations: Destination[] }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingLite[] | null>(null);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const query = location.trim().toLowerCase();

  // Load the current user's bookings once (used for search matching).
  useEffect(() => {
    if (!session?.user || bookings !== null) return;
    let cancelled = false;
    fetch("/api/bookings")
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { bookings?: BookingLite[] } | null) => {
        if (!cancelled) setBookings(body?.bookings ?? []);
      })
      .catch(() => {
        if (!cancelled) setBookings([]);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user, bookings]);

  const destinationMatches = useMemo(() => {
    if (!query && !budget && !fromDate) return [];
    const budgetRange = parseBudget(budget);
    const fromTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;

    return destinations.filter((destination) => {
      const matchesLocation =
        !query ||
        destination.name.toLowerCase().includes(query) ||
        destination.country.toLowerCase().includes(query) ||
        destination.category.toLowerCase().includes(query);

      const matchesBudget =
        !budgetRange ||
        (destination.price >= budgetRange.min &&
          destination.price <= budgetRange.max);

      const matchesDate =
        !fromTime ||
        !destination.departure ||
        new Date(destination.departure).getTime() >= fromTime;

      return matchesLocation && matchesBudget && matchesDate;
    });
  }, [destinations, query, budget, fromDate]);

  const bookingMatches = useMemo(() => {
    if (!query || !bookings) return [];
    return bookings
      .filter(
        (booking) =>
          booking.name.toLowerCase().includes(query) ||
          (booking.country ?? "").toLowerCase().includes(query) ||
          booking.ref.toLowerCase().includes(query)
      )
      .slice(0, 3);
  }, [bookings, query]);

  const topDestinations = destinationMatches.slice(0, 4);
  const hasResults = topDestinations.length > 0 || bookingMatches.length > 0;
  const isSearching = Boolean(query || budget || fromDate);

  // Close the results panel on outside clicks / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const goToDestination = (destination: Destination) => {
    setOpen(false);
    router.push(
      destination.id
        ? `/destinations/${destination.id}`
        : `/destinations/${encodeURIComponent(destination.name)}`
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);
    if (isSearching && destinationMatches.length > 0) {
      goToDestination(destinationMatches[0]!);
      return;
    }
    // Nothing matched (or empty search) → full catalog with the query in mind.
    if (isSearching) {
      setOpen(true);
      return;
    }
    router.push("/destinations");
  };

  return (
    <div ref={containerRef} className="absolute inset-x-0 bottom-0 z-20">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-white/10 backdrop-blur-[2px] sm:flex-row"
      >
        {/* Location — live search */}
        <label className="flex cursor-text flex-col gap-0.5 px-5 py-2.5 border-white/20 sm:flex-[2]">
          <span className="text-sm font-semibold text-white">Location</span>
          <input
            type="text"
            value={location}
            onChange={(event) => {
              setLocation(event.target.value);
              setOpen(true);
              setHighlighted(0);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search destination, city or country"
            className={FIELD_CLASS}
            aria-label="Search destinations"
            autoComplete="off"
          />
        </label>

        {/* Budget — filters by price range */}
        <label className="flex cursor-text flex-col gap-0.5 px-5 py-2.5 border-white/20 max-sm:border-t sm:flex-1 sm:not-first:border-l">
          <span className="text-sm font-semibold text-white">Budget</span>
          <input
            type="text"
            value={budget}
            onChange={(event) => {
              setBudget(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="$0-$3000"
            className={FIELD_CLASS}
            aria-label="Budget, e.g. 100-3000"
            autoComplete="off"
          />
        </label>

        {/* Departure — from date filter */}
        <label className="flex cursor-text flex-col gap-0.5 px-5 py-2.5 border-white/20 max-sm:border-t sm:flex-1 sm:not-first:border-l">
          <span className="text-sm font-semibold text-white">Departure</span>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => {
              setFromDate(event.target.value);
              setOpen(true);
            }}
            className={`${FIELD_CLASS} [color-scheme:light]`}
            aria-label="Departing from"
          />
        </label>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-brand px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90 sm:px-10"
        >
          <Search className="size-4" aria-hidden />
          Search
        </button>
      </form>

      {/* Results panel */}
      {open && isSearching ? (
        <div className="absolute inset-x-4 bottom-[calc(100%+8px)] sm:inset-x-0">
          <div className="mx-auto max-h-96 max-w-3xl overflow-y-auto rounded-xl border border-border/60 bg-white p-2 text-foreground shadow-2xl">
            {hasResults ? (
              <>
                {topDestinations.length > 0 ? (
                  <p className="px-2 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Destinations
                  </p>
                ) : null}
                <ul>
                  {topDestinations.map((destination, index) => (
                    <li key={destination.id ?? destination.name}>
                      <button
                        type="button"
                        onClick={() => goToDestination(destination)}
                        onMouseEnter={() => setHighlighted(index)}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left outline-none ${
                          index === highlighted ? "bg-brand-soft/70" : "hover:bg-muted/50"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={destination.imageUrl ?? "/imges/Wanderlast.png"}
                          alt=""
                          className="size-12 shrink-0 rounded-md object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {destination.name}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" aria-hidden />
                            {destination.country} · {destination.category}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-bold text-brand">
                          ${destination.price.toLocaleString("en-US")}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {bookingMatches.length > 0 ? (
                  <>
                    <p className="px-2 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Your bookings
                    </p>
                    <ul>
                      {bookingMatches.map((booking) => (
                        <li key={booking._id}>
                          <a
                            href="/bookings"
                            className="flex items-center gap-3 rounded-lg p-2 outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
                          >
                            <Ticket className="size-4 shrink-0 text-brand" aria-hidden />
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                              {booking.name}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              Ref {booking.ref}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {destinationMatches.length > topDestinations.length ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      router.push("/destinations");
                    }}
                    className="w-full cursor-pointer rounded-lg px-2 py-2 text-center text-xs font-medium text-brand outline-none hover:bg-brand-soft/50"
                  >
                    See all {destinationMatches.length} matching destinations →
                  </button>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5 px-4 py-6 text-center">
                <CalendarDays className="size-5 text-muted-foreground" aria-hidden />
                <p className="text-sm text-foreground">No matches found</p>
                <p className="text-xs text-muted-foreground">
                  Try another destination, or{" "}
                  <Link href="/destinations" className="text-brand hover:underline">
                    browse the full catalog
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
