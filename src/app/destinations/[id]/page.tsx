import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CircleCheck,
  MapPin,
  Star,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EditDestinationDialog } from "@/components/edit-destination-dialog";
import { DeleteDestinationDialog } from "@/components/DeleteDestinationDialog";
import { API_BASE_URL, normalizeDestination, type Destination } from "@/lib/api";
import { cn } from "cn";
import BookingCard from "@/components/booking/BookingCard";
import { auth } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { headers } from "next/headers";

type RouteParams = { params: Promise<{ id: string }> };

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const maybeArray =
      (data as { destinations?: unknown }).destinations ??
      (data as { data?: unknown }).data;
    if (Array.isArray(maybeArray)) return maybeArray;
  }
  return [];
}

/** Try `GET /destinations/:id`, then fall back to matching the id/name in the list. */
async function loadDestination(id: string): Promise<Destination | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/destinations/${encodeURIComponent(id)}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data: unknown = await res.json();
      const doc =
        data && typeof data === "object" && "destination" in data
          ? (data as { destination: unknown }).destination
          : data;
      if (Array.isArray(doc)) return null;
      const normalized = normalizeDestination(doc);
      const hasName =
        getStringIn(doc, "name") || getStringIn(doc, "title") ? true : false;
      if (hasName) return normalized;
    }
  } catch {
    // fall through to list search
  }

  try {
    const res = await fetch(`${API_BASE_URL}/destinations`, {
        
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const match = unwrapList(data)
      .map(normalizeDestination)
      .find((d) => d.id === id || d.name === decodeURIComponent(id));
    return match ?? null;
  } catch {
    return null;
  }
}

function getStringIn(doc: unknown, key: string): boolean {
  return Boolean(
    doc &&
      typeof doc === "object" &&
      typeof (doc as Record<string, unknown>)[key] === "string" &&
      ((doc as Record<string, unknown>)[key] as string).trim() !== ""
  );
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { id } = await params;
  const destination = await loadDestination(decodeURIComponent(id));
  if (!destination) {
    return { title: "Destination not found — Wanderlast" };
  }
  return {
    title: `${destination.name}, ${destination.country} — Wanderlast`,
    description:
      destination.description ??
      `Discover ${destination.name} with Wanderlast's curated travel experiences.`,
  };
}

export default async function DestinationDetailsPage({ params }: RouteParams) {
  const { id } = await params;

  // Edit/Delete are owner-only tools: only render them for the admin session.
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = isAdminId(session?.user?.id);

  const destination = await loadDestination(decodeURIComponent(id));

  if (!destination) {
    return (
      <main className="flex-1 px-4 py-24">
        <div className="mx-auto max-w-xl rounded-xl border border-border/60 bg-white px-8 py-12 text-center shadow-sm">
          <h1 className="font-serif text-3xl text-foreground">
            Destination not found
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {`We couldn't find "${decodeURIComponent(id)}" — it may have been
            removed, or the backend is unreachable.`}
          </p>
          <Link
            href="/destinations"
            className={cn(
              buttonVariants({ className: "mt-6 h-10 rounded-md bg-brand px-6 hover:bg-brand/90" })
            )}
          >
            Back to Destinations
          </Link>
        </div>
      </main>
    );
  }

  // The backend schema has no separate highlights field: the opening sentence
  // becomes the Overview and the rest of the description makes the checklist.
  const sentences = (destination.description ?? "")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const overview = destination.description ?? "";
  const highlights = sentences.slice(1);

  return (
    <main className="flex-1 px-4 pb-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-between gap-4 py-6">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to Destinations
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <>
                <EditDestinationDialog destination={destination} />
                <DeleteDestinationDialog destination={destination} />
              </>
            ) : null}
          </div>
        </div>

        {/* Hero image */}
        <div className="relative overflow-hidden rounded-2xl bg-brand-soft/40">
          {/* Backend-provided remote URL — plain img, host list isn't in next.config */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={destination.imageUrl ?? "/imges/Wanderlast.png"}
            alt={destination.name}
            className="aspect-[16/7] w-full object-cover"
          />
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          {/* Details */}
          <div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden />
              {destination.country}
            </div>
            <h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">
              {destination.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/80">
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-brand text-brand" aria-hidden />
                <span className="font-semibold">{destination.rating.toFixed(1)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                {destination.duration}
              </span>
            </div>

            <h2 className="mt-10 font-serif text-2xl text-foreground">Overview</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {overview || "No description provided yet."}
            </p>

            {highlights.length > 0 ? (
              <>
                <h2 className="mt-10 font-serif text-2xl text-foreground">
                  Highlights
                </h2>
                <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2.5 text-sm text-foreground/80"
                    >
                      <CircleCheck
                        className="mt-0.5 size-4 shrink-0 text-emerald-600"
                        aria-hidden
                      />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

         {/* Booking Card */}
         <BookingCard destination={destination}/>
        </div>
      </div>
    </main>
  );
}
