"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      // Same JWT contract as booking: the backend verifies ownership from it.
      const { data: tokenData } = await authClient.token();
      const headers: Record<string, string> = {};
      if (tokenData?.token) {
        headers.authorization = `Bearer ${tokenData.token}`;
      }

      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast.error("Could not cancel", {
          description: body?.error ?? "Please try again.",
        });
        return;
      }
      toast.success("Booking cancelled", {
        description: "The trip has been removed from your plans.",
      });
      router.refresh();
    } catch {
      toast.error("Could not cancel", {
        description: "Could not reach the server. Please try again.",
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={cancelling}
      className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-destructive/50 px-3 text-xs font-medium text-destructive transition-colors outline-none hover:bg-destructive/10 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60"
    >
      {cancelling ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      ) : (
        <Trash2 className="size-3.5" aria-hidden />
      )}
      Cancel
    </button>
  );
}
