import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

import { auth } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { AddDestinationForm } from "@/components/add-destination-form";

export const metadata: Metadata = {
  title: "Add New Travel Package — Wanderlast",
  description: "Create a new travel package for Wanderlast destinations.",
};

/** Reads the session at request time — sits inside the Suspense boundary. */
async function AdminGate() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-border/60 bg-white px-8 py-14 text-center shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
          <ShieldAlert className="size-5" aria-hidden />
        </span>
        <h2 className="mt-4 font-serif text-2xl text-foreground">
          Log in as the site admin
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Only the Wanderlast admin can publish new travel packages. Please
          log in with the admin account to continue.
        </p>
        <Link
          href="/login"
          className={cn(buttonVariants({ className: "mt-6 h-10 bg-brand px-6 hover:bg-brand/85" }))}
        >
          Log In
        </Link>
      </div>
    );
  }

  if (!isAdminId(user.id)) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-border/60 bg-white px-8 py-14 text-center shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ShieldAlert className="size-5" aria-hidden />
        </span>
        <h2 className="mt-4 font-serif text-2xl text-foreground">
          Admins only
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          You&apos;re signed in as {user.name}, but publishing new travel
          packages is reserved for the site admin. Browse destinations or
          manage your bookings instead.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/destinations"
            className={cn(buttonVariants({ className: "h-10 bg-brand px-6 hover:bg-brand/85" }))}
          >
            Explore Destinations
          </Link>
          <Link
            href="/bookings"
            className={cn(buttonVariants({ variant: "outline", className: "h-10 px-6" }))}
          >
            My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return <AddDestinationForm />;
}

export default function AddDestinationPage() {


  return (
    <main className="flex-1 px-4 py-12 sm:py-16">
      <div className="mx-auto mb-10 w-full max-w-3xl">
        <h1 className="font-serif text-4xl font-light tracking-wide text-foreground sm:text-5xl">
          Add New Travel Package
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Fill in the details below to publish a new destination to your
          travelers.
        </p>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-xl border border-border/60 bg-muted/40" />
          }
        >
          <AdminGate />
        </Suspense>
      </div>
    </main>
  );
}
