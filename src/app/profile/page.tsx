import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import {
  BadgeCheck,
  CircleCheck,
  CircleDollarSign,
  Clock3,
  Globe,
  LogIn,
  Plane,
  TrendingUp,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

import { auth } from "@/lib/auth";
import { computeBookingStats, listBookings, type BookingDoc } from "@/lib/bookings";
import { UserAvatar } from "@/components/user-info";
import { EditProfileButton } from "@/components/profile/edit-profile-dialog";

/** "2026-03-08…" → "March 2026" */
function formatMemberSince(createdAt?: string | Date): string {
  if (!createdAt) return "Recently";
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? "Recently"
    : date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Same departure formatting as My Bookings */
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

interface StatCardProps {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tint: string;
  title: string;
  value: string;
}

/** Whole card is a link → connects each stat to its section of the site. */
function StatCard({ href, icon: Icon, tint, title, value }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-border/60 bg-white p-5 shadow-sm transition-all outline-none hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      </div>
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full transition-transform group-hover:scale-110",
          tint
        )}
        aria-hidden
      >
        <Icon className="size-5" />
      </span>
    </Link>
  );
}

function StatSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="h-80 animate-pulse rounded-xl border border-border/60 bg-muted/40" />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-border/60 bg-muted/40"
            />
          ))}
        </div>
        <div className="h-40 animate-pulse rounded-xl border border-border/60 bg-muted/40" />
      </div>
    </div>
  );
}

function CompactBookingRow({ booking }: { booking: BookingDoc }) {
  return (
    <Link
      href={`/destinations/${booking.destinationId ?? booking.name}`}
      className="flex items-center gap-4 rounded-xl border border-border/60 bg-white p-3 shadow-sm transition-all outline-none hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={booking.imageUrl ?? "/imges/destinations/image1.png"}
        alt={booking.name}
        className="size-16 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-lg text-foreground">
          {booking.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" aria-hidden />
          {formatDeparture(booking.departure)}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <BadgeCheck
            className={cn(
              "size-3.5",
              booking.status === "confirmed"
                ? "text-emerald-600"
                : "text-amber-600"
            )}
            aria-hidden
          />
          {booking.status === "confirmed" ? "Confirmed" : "Pending"} · Ref{" "}
          {booking.ref}
        </p>
      </div>
      <p className="text-lg font-semibold text-brand">
        ${booking.price.toLocaleString("en-US")}
      </p>
    </Link>
  );
}

function LoginPrompt() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border/60 bg-white px-8 py-16 text-center shadow-sm">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <LogIn className="size-5" aria-hidden />
      </span>
      <h2 className="mt-4 font-serif text-2xl text-foreground">
        Log in to view your profile
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Your travel stats, recent trips and account settings live here once
        you&apos;re signed in.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/login"
          className={cn(
            buttonVariants({ className: "h-10 bg-brand px-6 hover:bg-brand/85" })
          )}
        >
          Log In
        </Link>
        <Link
          href="/sign-up"
          className={cn(
            buttonVariants({ variant: "outline", className: "h-10 px-6" })
          )}
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

async function ProfileContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) {
    return <LoginPrompt />;
  }

  const bookings = await listBookings(user.email);
  const stats = computeBookingStats(bookings);
  const recent = bookings.slice(0, 3);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Profile card */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="flex flex-col items-center rounded-xl border border-border/60 bg-white p-6 text-center shadow-sm">
          <div className="relative">
            <UserAvatar
              src={user.image}
              name={user.name}
              size="lg"
              className="size-24"
            />
            
          </div>

          <h2 className="mt-4 font-serif text-2xl text-foreground">
            {user.name}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>

          <dl className="mt-5 w-full space-y-2.5 border-t border-border/60 pt-4 text-left text-xs">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Member since</dt>
              <dd className="font-semibold text-foreground">
                {formatMemberSince(user.createdAt)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
                
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Books with</dt>
              <dd className="flex items-center gap-1 font-semibold text-foreground">
                <Plane className="size-3.5 text-brand" aria-hidden />
                Wanderlast
              </dd>
            </div>
          </dl>

          <div className="mt-5 w-full">
            <EditProfileButton
              name={user.name}
              image={user.image}
              email={user.email}
            />
          </div>
        </div>
      </aside>

      {/* Stats + recent trips */}
      <div>
        <section>
          <h2 className="font-serif text-xl text-foreground">
            Travel Statistics
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <StatCard
              href="/bookings"
              icon={Plane}
              tint="bg-brand-soft text-brand"
              title="Total Bookings"
              value={String(stats.total)}
            />
            <StatCard
              href="/destinations"
              icon={Globe}
              tint="bg-emerald-50 text-emerald-600"
              title="Countries on your list"
              value={String(stats.countries)}
            />
            <StatCard
              href="/bookings"
              icon={TrendingUp}
              tint="bg-orange-50 text-orange-500"
              title="Upcoming Trips"
              value={String(stats.upcoming)}
            />
            <StatCard
              href="/bookings"
              icon={CircleDollarSign}
              tint="bg-pink-50 text-pink-500"
              title="Total Spent"
              value={`$${stats.spent.toLocaleString("en-US")}`}
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-xl text-foreground">Recent Trips</h2>
            {recent.length > 0 ? (
              <Link
                href="/bookings"
                className="text-xs font-medium text-brand underline-offset-4 hover:underline"
              >
                View all bookings →
              </Link>
            ) : null}
          </div>
          {recent.length > 0 ? (
            <div className="mt-3 space-y-3">
              {recent.map((booking) => (
                <CompactBookingRow
                  key={booking._id.toString()}
                  booking={booking}
                />
              ))}
            </div>
          ) : (
            <div className="mt-3 flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-white px-8 py-10 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                <CircleCheck className="size-5" aria-hidden />
              </span>
              <p className="mt-3 text-sm text-muted-foreground">
                No trips booked yet — your first adventure is out there.
              </p>
              <Link
                href="/destinations"
                className={cn(
                  buttonVariants({
                    className: "mt-4 h-9 bg-brand px-5 hover:bg-brand/85",
                  })
                )}
              >
                Explore Destinations
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <main className="flex-1 bg-muted/20 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* Static shell — body streams in behind <Suspense> */}
        <h1 className="font-serif text-4xl text-foreground">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and see how far Wanderlast has taken you
        </p>

        <div className="mt-8">
          <Suspense fallback={<StatSkeleton />}>
            <ProfileContent />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
