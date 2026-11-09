import { API_BASE_URL, normalizeDestination, type Destination } from "@/lib/api";

/**
 * Live destinations from the Express backend — shared by the /destinations
 * page, the homepage featured carousel and the hero search. `no-store` so
 * newly added packages appear on the next request.
 */
export async function loadAllDestinations(): Promise<{
  destinations: Destination[];
  error: string | null;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/destinations`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`The destinations API responded with HTTP ${res.status}.`);
    }
    const data: unknown = await res.json();
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as { destinations?: unknown[] })?.destinations)
        ? (data as { destinations: unknown[] }).destinations
        : [];
    return { destinations: list.map(normalizeDestination), error: null };
  } catch (caught) {
    return {
      destinations: [],
      error:
        caught instanceof TypeError
          ? `Could not reach the API at ${API_BASE_URL} — is the backend running?`
          : caught instanceof Error
            ? caught.message
            : "Something went wrong while loading destinations.",
    };
  }
}
