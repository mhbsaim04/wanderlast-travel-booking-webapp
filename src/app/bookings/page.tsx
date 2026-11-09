import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import {
  CalendarDays,
  Clock3,
  CircleCheck,
  Eye,
  LogIn,
  Ticket,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

import { auth } from "@/lib/auth";
import { listBookings, type BookingDoc } from "@/lib/bookings";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";

/** Departure like the mockup: "May 15, 2026" */
function formatDeparture(departure?: string): string {
  if (!departure) return "Flexible";
  const date = new Date(departure);
  return Number.isNaN(date.getTime())
    ? departure
    : date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
}

function StatusBadge({ status }: { status: string }) {
  const confirmed = status === "confirmed";
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        confirmed
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      )}
    >
      {confirmed ? (
        <CircleCheck className="size-3.5" aria-hidden />
      ) : (
        <Clock3 className="size-3.5" aria-hidden />
      )}
      {confirmed ? "Confirmed" : "Pending"}
    </span>
  );
}

function BookingRow({ booking }: { booking: BookingDoc }) {
  return (
    <div className="grid gap-4 rounded-xl border border-border/60 bg-white p-4 shadow-sm sm:grid-cols-[200px_1fr]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={booking.imageUrl ?? "/imges/destinations/image1.png"}
        alt={booking.name}
        className="h-36 w-full rounded-lg object-cover"
      />

      <div className="flex flex-col">
        <StatusBadge status={booking.status} />

        <h3 className="mt-2 font-serif text-2xl text-foreground">
          {booking.name}
          {booking.country ? (
            <span className="text-base text-muted-foreground">
              , {booking.country}
            </span>
          ) : null}
        </h3>

        <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden />
            Departure: {formatDeparture(booking.departure)}
          </p>
          <p className="flex items-center gap-1.5">
            <Ticket className="size-3.5" aria-hidden />
            Booking ID: {booking.ref}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
          <p className="text-xl font-semibold text-brand">
            ${booking.price.toLocaleString("en-US")}
          </p>
          <div className="flex items-center gap-3">
            <CancelBookingButton bookingId={booking._id.toString()} />
            <Link
              href={`/destinations/${booking.destinationId ?? booking.name}`}
              className={cn(
                buttonVariants({
                  className: "h-8 gap-1.5 bg-brand px-3 text-xs hover:bg-brand/85",
                })
              )}
            >
              <Eye className="size-3.5" aria-hidden />
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-44 animate-pulse rounded-xl border border-border/60 bg-muted/40"
        />
      ))}
    </div>
  );
}

function LoginPrompt() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border/60 bg-white px-8 py-14 text-center shadow-sm">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <LogIn className="size-5" aria-hidden />
      </span>
      <h2 className="mt-4 font-serif text-2xl text-foreground">
        Log in to see your bookings
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Your booked trips live here — once you log in, every reservation you
        make shows up in this list.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/login"
          className={cn(buttonVariants({ className: "h-10 bg-brand px-6 hover:bg-brand/85" }))}
        >
          Log In
        </Link>
        <Link
          href="/sign-up"
          className={cn(buttonVariants({ variant: "outline", className: "h-10 px-6" }))}
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-border/60 bg-white px-8 py-14 text-center shadow-sm">
      <h2 className="font-serif text-2xl text-foreground">No bookings yet</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Browse destinations and hit{" "}
        <span className="font-medium text-brand">Book Now</span> — your trips
        will appear here instantly.
      </p>
      <Link
        href="/destinations"
        className={cn(buttonVariants({ className: "mt-6 h-10 bg-brand px-6 hover:bg-brand/85" }))}
      >
        Explore Destinations
      </Link>
    </div>
  );
}

/** Reads the session + DB at request time — streams in behind <Suspense>. */
async function BookingList() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return <LoginPrompt />;
  }

  const bookings = await listBookings(session.user.email);
  if (bookings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingRow key={booking._id.toString()} booking={booking} />
      ))}
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <main className="flex-1 bg-muted/20 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        {/* Static shell — renders instantly, list streams in below */}
        <h1 className="font-serif text-4xl text-foreground">My Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and view your upcoming travel plans
        </p>

        <div className="mt-8">
          <Suspense fallback={<ListSkeleton />}>
            <BookingList />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
