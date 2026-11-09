"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

import type { Destination } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

interface Props {
  destination: Destination;
  className?: string;
  /** User-chosen departure date (ISO yyyy-mm-dd); overrides the package default. */
  departure?: string;
}

export function BookNowButton({ destination, className, departure }: Props) {
  const router = useRouter();
  const [booking, setBooking] = useState(false);

  const handleBook = async () => {
    setBooking(true);
    try {
      // The backend verifies this JWT against better-auth's JWKS; when the
      // visitor isn't logged in there's no token and the API returns 401.
      const { data: tokenData } = await authClient.token();
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (tokenData?.token) {
        authHeaders.authorization = `Bearer ${tokenData.token}`;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          destinationId: destination.id,
          name: destination.name,
          country: destination.country,
          imageUrl: destination.imageUrl,
          price: destination.price,
          duration: destination.duration,
          departure: departure ?? destination.departure,
        }),
      });

      if (res.status === 401) {
        toast.info("Please log in to book", {
          description: "Create an account or log in first, then try again.",
          action: {
            label: "Log in",
            onClick: () => router.push("/login"),
          },
        });
        return;
      }

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast.error("Booking failed", {
          description: body?.error ?? "Please try again in a moment.",
        });
        return;
      }

      const { booking: created } = (await res.json()) as {
        booking?: { ref?: string };
      };
      toast.success("Trip booked!!", {
        description: created?.ref
          ? `Booking ${created.ref} is confirmed — see it under My Bookings.`
          : "Your trip is confirmed - see it under My Bookings.",
      });
      router.push("/bookings");
    } catch {
      toast.error("Booking failed", {
        description: "Could not reach the server. Please try again.",
      });
    } finally {
      setBooking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBook}
      disabled={booking}
      className={
        cn(
      "inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md bg-brand text-sm font-medium whitespace-nowrap text-white transition-all outline-none select-none hover:bg-brand/90 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
          className
        )
      }
    >
      {booking ? (
        <>
          Booking…
          <Loader2 className="size-4 animate-spin" aria-hidden />
        </>
      ) : (
        <>
          Book Now
          <ArrowRight data-icon="inline-end" aria-hidden />
        </>
      )}
    </button>
  );
}
