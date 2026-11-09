"use client"
import { useState } from "react";
import { CalendarDays, CircleCheck } from "lucide-react";

import type { Destination } from "@/lib/api";
import { BookNowButton } from "@/components/booking/book-now-button";
import { Input } from "@/components/ui/input";

const PERKS = [
  "Free cancellation up to 7 days",
  "Travel insurance included",
  "24/7 customer support",
];

/** Stored departure → yyyy-mm-dd for <input type="date"> (empty when invalid). */
function toISODate(departure?: string): string {
  if (!departure) return "";
  const date = new Date(departure);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

const BookingCard = ({ destination }: { destination: Destination }) => {
  // The suggested date prefills the picker; the user can change it per booking.
  const [departure, setDeparture] = useState(toISODate(destination.departure));

  return (
    <>
      {/* Booking card */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-border/60 bg-white p-6 shadow-xl shadow-foreground/5">
          <p className="text-xs text-muted-foreground">Starting from</p>
          <p className="mt-1 text-4xl font-bold text-brand">
            ${destination.price.toLocaleString("en-US")}
            <span className="align-top text-xs font-medium text-muted-foreground">
              /per person
            </span>
          </p>

          <div className="mt-6">
            <p className="text-xs font-medium text-muted-foreground">
              Departure
            </p>
            <div className="relative mt-2">
              <CalendarDays
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="departure"
                type="date"
                value={departure}
                onChange={(event) => setDeparture(event.target.value)}
                aria-label="Departure date"
                className="pl-9"
              />
            </div>
          </div>

          <BookNowButton
            destination={destination}
            departure={departure || undefined}
            className="mt-5 h-9 w-full rounded-md bg-brand text-sm font-medium hover:bg-brand/90 disabled:opacity-60"
          />

          <ul className="mt-6 space-y-3">
            {PERKS.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2.5 text-xs text-foreground/80"
              >
                <CircleCheck
                  className="mt-0.5 size-3.5 shrink-0 text-emerald-600"
                  aria-hidden
                />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default BookingCard;
