import { cookies, headers } from "next/headers";

import { auth } from "@/lib/auth";

/** better-auth sets its session under this cookie name. */
export const SESSION_COOKIE = "better-auth.session_token";

/**
 * Legacy helper: forwards the better-auth session cookie value as
 * `Authorization: Bearer <sessionToken>`. The Express backend still accepts
 * this as the fallback path (it looks the token up in the `session`
 * collection), but its primary path is a real JWT verified against the app's
 * JWKS — prefer `getBearerToken()`.
 */
export async function getBearerAuth(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  return raw ? `Bearer ${raw}` : undefined;
}

/**
 * Preferred helper: obtains a short-lived better-auth **JWT** for the current
 * session (`auth.api.getToken`, issued by the jwt plugin) and returns it as a
 * Bearer header string. The Express backend verifies this against better-auth's
 * JWKS, so tokens stay valid even if their session rows rotate. Falls back to
 * the session-cookie Bearer when no JWT can be issued.
 */
export async function getBearerToken(): Promise<string | undefined> {
  try {
    const { token } = (await auth.api.getToken({
      headers: await headers(),
    })) as { token?: string };

    if (token) return `Bearer ${token}`;
  } catch {
    // Not logged in (or the jwt plugin isn't engaged) — try the cookie path.
  }
  return getBearerAuth();
}
