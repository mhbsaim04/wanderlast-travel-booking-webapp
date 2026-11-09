import { API_BASE_URL } from "@/lib/api";
import { getBearerToken } from "@/lib/auth-server";
// Talks to the Express backend — no direct MongoDB access anymore.

export interface BookingDoc {
  /** Mongo document id as a plain string. */
  _id: string;
  ref: string;
  destinationId?: string;
  name: string;
  country?: string;
  imageUrl?: string;
  price: number;
  duration?: string;
  departure?: string;
  /** "confirmed" | "pending" */
  status: string;
  createdAt?: string | Date;
}

export interface BookingStats {
  total: number;
  /** Sum of booking prices. */
  spent: number;
  /** Bookings whose departure date is today or later. */
  upcoming: number;
  /** Distinct countries across the user's bookings. */
  countries: number;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

/** Express document → UI model, tolerating shape drift. */
function normalizeBooking(raw: unknown): BookingDoc {
  const doc = (raw ?? {}) as Record<string, unknown>;
  const rawPrice = Number(doc.price);
  return {
    _id: getString(doc._id) ?? getString(doc.id) ?? "",
    ref: getString(doc.ref) ?? "b-????",
    destinationId: getString(doc.destinationId),
    name: getString(doc.name) ?? "Untitled booking",
    country: getString(doc.country),
    imageUrl: getString(doc.imageUrl),
    price: Number.isFinite(rawPrice) ? rawPrice : 0,
    duration: getString(doc.duration),
    departure: getString(doc.departure),
    status: getString(doc.status) ?? "confirmed",
    createdAt: typeof doc.createdAt === "string" ? doc.createdAt : undefined,
  };
}

/**
 * The signed-in user's bookings via `GET /my-bookings/:email` on the Express
 * backend (the backend verifies the forwarded Bearer token and only ever
 * returns the caller's own list). Empty list when logged out / offline.
 */
export async function listBookings(email: string): Promise<BookingDoc[]> {
  const bearer = await getBearerToken();
  if (!bearer) return [];

  try {
    const res = await fetch(
      `${API_BASE_URL}/my-bookings/${encodeURIComponent(email)}`,
      { headers: { authorization: bearer }, cache: "no-store" }
    );
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(normalizeBooking);
  } catch {
    return [];
  }
}

/**
 * Cancels a booking via `DELETE /my-bookings/:id`. The backend enforces
 * ownership (userId in the delete query) — returns false when it wasn't ours.
 */
export async function cancelBooking(id: string): Promise<boolean> {
  const bearer = await getBearerToken();
  if (!bearer) return false;

  const res = await fetch(
    `${API_BASE_URL}/my-bookings/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { authorization: bearer } }
  );
  return res.ok;
}

/** Computes the profile-page stats from a bookings list (no extra backend). */
export function computeBookingStats(bookings: BookingDoc[]): BookingStats {
  const today = new Date().toISOString().slice(0, 10);
  const countries = new Set(
    bookings
      .map((booking) => booking.country)
      .filter((country) => typeof country === "string" && country.trim() !== "")
  );

  return {
    total: bookings.length,
    spent: bookings.reduce((sum, booking) => sum + booking.price, 0),
    upcoming: bookings.filter(
      (booking) => (booking.departure ?? "") >= today
    ).length,
    countries: countries.size,
  };
}
