/**
 * Base URL of the Wanderlast backend server (separate Express + MongoDB app,
 * outside this repo). Set NEXT_PUBLIC_API_URL in .env.local to override;
 * falls back to the local dev server.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Destination {
  id?: string;
  name: string;
  country: string;
  category: string;
  price: number;
  duration: string;
  departure?: string;
  imageUrl?: string;
  description?: string;
  rating: number;
}

/** Fallback when the backend doesn't send ratings. */
const DEFAULT_RATING = 4.5;

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

/**
 * Backend document → UI model. Tolerates small shape drift between what the
 * add-destination form posts and what the API returns (e.g. _id, imageUrl).
 */
export function normalizeDestination(raw: unknown): Destination {
  const doc = (raw ?? {}) as Record<string, unknown>;
  const rawPrice = doc.price ?? doc.priceUSD;
  const priceValue = Number(
    typeof rawPrice === "string" ? rawPrice.replace(/[$,]/g, "") : rawPrice
  );
  const ratingValue = Number(doc.rating);

  return {
    id: getString(doc._id ?? doc.id),
    name: getString(doc.name ?? doc.title) ?? "Untitled destination",
    country: getString(doc.country) ?? "Unknown",
    category: getString(doc.category) ?? "Other",
    price: Number.isFinite(priceValue) ? priceValue : 0,
    duration: getString(doc.duration) ?? "Flexible",
    departure: getString(doc.departure) ?? getString(doc.departureDate),
    imageUrl: getString(doc.imageUrl ?? doc["image-url"] ?? doc.image_url),
    description: getString(doc.description),
    rating: Number.isFinite(ratingValue) && ratingValue > 0 ? ratingValue : DEFAULT_RATING,
  };
}
