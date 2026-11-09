import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getBearerAuth, getBearerToken } from "@/lib/auth-server";
import { cancelBooking } from "@/lib/bookings";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const bearer = (await getBearerToken()) ?? (await getBearerAuth());
  if (!session?.user || !bearer) {
    return NextResponse.json(
      { error: "Please log in first." },
      { status: 401 }
    );
  }

  const { id } = await params;
  // The backend enforces ownership inside the Mongo query
  // (deleteOne({ _id, userId })) and fails with 404 for foreign bookings.
  const cancelled = await cancelBooking(id);
  if (!cancelled) {
    return NextResponse.json(
      { error: "Booking not found (or it belongs to another account)." },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true });
}
