import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getBearerToken } from "@/lib/auth-server";
import { API_BASE_URL } from "@/lib/api";
import { listBookings } from "@/lib/bookings";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Please log in to view your bookings." },
      { status: 401 }
    );
  }
  const bookings = await listBookings(session.user.email);
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json(
      { error: "Please log in to book a trip." },
      { status: 401 }
    );
  }
  const bearer = await getBearerToken();
  if (!bearer) {
    return NextResponse.json(
      { error: "Please log in to book a trip." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { error: "A destination name is required." },
      { status: 400 }
    );
  }

  const stringField = (key: string) =>
    typeof body[key] === "string" && (body[key] as string).trim() !== ""
      ? (body[key] as string).trim()
      : undefined;
  const priceRaw = Number(body.price);
  // The backend keeps a provided ref, so generate it here for an accurate toast.
  const ref = `b-${Math.random().toString(36).slice(2, 6)}`;

  // The backend stamps the owner (userId/email) from the session token —
  // the payload only carries the trip data the user chose.
  try {
    const res = await fetch(`${API_BASE_URL}/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: bearer,
      },
      body: JSON.stringify({
        destinationId: stringField("destinationId"),
        name,
        country: stringField("country"),
        imageUrl: stringField("imageUrl"),
        price: Number.isFinite(priceRaw) ? priceRaw : 0,
        duration: stringField("duration"),
        departure: stringField("departure"),
        ref,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { msg?: string } | null;
      return NextResponse.json(
        { error: data?.msg ?? `Booking failed (HTTP ${res.status}).` },
        { status: res.status === 401 ? 502 : res.status }
      );
    }

    const data = (await res.json()) as { insertedId?: string };
    // Express insertOne returns the id — echo a normalized booking back.
    const booking = {
      _id: data.insertedId,
      ref,
      name,
      price: Number.isFinite(priceRaw) ? priceRaw : 0,
    };
    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the booking server. Please try again." },
      { status: 502 }
    );
  }
}
