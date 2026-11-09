import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { getBearerToken } from "@/lib/auth-server";
import { API_BASE_URL } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH/DELETE /api/admin/destinations/:id
 * Proxies to the Express destination-management endpoints, which verify the
 * forwarded JWT is admin-owned before touching MongoDB.
 */
export async function PATCH(request: Request, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id || !isAdminId(session.user.id)) {
    return NextResponse.json({ error: "Admins only!" }, { status: 403 });
  }
  const bearer = await getBearerToken();
  if (!bearer) {
    return NextResponse.json(
      { error: "Session expired — please log in again." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const raw = await request.text();

  const res = await fetch(
    `${API_BASE_URL}/destination/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", authorization: bearer },
      body: raw,
    }
  ).catch(() => null);

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

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id || !isAdminId(session.user.id)) {
    return NextResponse.json({ error: "Admins only!" }, { status: 403 });
  }
  const bearer = await getBearerToken();
  if (!bearer) {
    return NextResponse.json(
      { error: "Session expired — please log in again." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const res = await fetch(
    `${API_BASE_URL}/destination/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { authorization: bearer } }
  ).catch(() => null);

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
