import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { getBearerToken } from "@/lib/auth-server";
import { API_BASE_URL } from "@/lib/api";

/**
 * POST /api/admin/destinations
 * Creates a travel package on the Express backend. Double-gated: this route
 * checks the session is the admin, then forwards the admin's JWT so the
 * backend's verifyToken + verifyAdmin re-check it.
 */
export async function POST(request: Request) {
  // The form sends a fresh JWT it fetched with `authClient.token()` — Forward
  // it so the backend verifies the very token the client obtained.
  const clientAuth = request.headers.get("authorization");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Please log in as the site admin to add packages." },
      { status: 401 }
    );
  }
  if (!isAdminId(session.user.id)) {
    return NextResponse.json(
      { error: "Admins only!" },
      { status: 403 }
    );
  }
  const bearer =
    clientAuth?.startsWith("Bearer ") ? clientAuth : await getBearerToken();
  if (!bearer) {
    return NextResponse.json(
      { error: "Session expired — please log in again." },
      { status: 401 }
    );
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const res = await fetch(`${API_BASE_URL}/add-destination`, {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: bearer },
    body: raw,
  }).catch(() => null);

  if (!res) {
    return NextResponse.json(
      { error: "Could not reach the destination server." },
      { status: 502 }
    );
  }
  return NextResponse.json(await res.json().catch(() => ({})), {
    status: res.status,
  });
}
