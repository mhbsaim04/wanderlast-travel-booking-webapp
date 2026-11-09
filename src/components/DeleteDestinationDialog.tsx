"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Destination } from "@/lib/api";

/**
 * Confirmation dialog that permanently deletes the travel package via the
 * backend `app.delete('destination/:id')` route (deleteOne on the _id).
 */
export function DeleteDestinationDialog({
  destination,
}: {
  destination: Destination;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!destination.id) {
      toast.error("Cannot delete this package", {
        description:
          "It has no MongoDB id (it may have been opened by name without a matching id).",
      });
      setOpen(false);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/destinations/${encodeURIComponent(destination.id)}`,
        { method: "DELETE" }
      );
      const data = (await res.json().catch(() => null)) as
        | (Record<string, unknown> & {
            message?: string;
            error?: string;
            deletedCount?: number;
          })
        | null;
      if (!res.ok) {
        throw new Error(
          (data?.message ?? data?.error) ??
            `The package could not be deleted (HTTP ${res.status}).`
        );
      }
      if (
        typeof data?.deletedCount === "number" &&
        data.deletedCount === 0
      ) {
        throw new Error(
          "No package with that id exists on the server — refresh the page."
        );
      }
      toast.success(`"${destination.name}" has been deleted.`);
      setOpen(false);
      // The details page would 404 after deletion — return to the grid, which
      // renders fresh (no-store) data from MongoDB.
      router.push("/destinations");
    } catch (error) {
      const description =
        error instanceof TypeError
          ? "Could not reach the server — is the backend running and the admin session valid?"
          : error instanceof Error
            ? error.message
            : "Something went wrong while deleting the package.";
      toast.error("Package could not be deleted", { description });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-destructive/40 bg-transparent px-4 text-sm font-medium whitespace-nowrap text-destructive transition-colors outline-none select-none hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
      >
        <Trash2 className="size-3.5" aria-hidden />
        Delete
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-lg p-6 sm:rounded-lg">
        <div className="flex flex-col gap-3 pr-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
            <CircleAlert className="size-5 text-destructive" aria-hidden />
          </div>
          <DialogTitle className="font-serif text-2xl font-normal text-foreground">
            Delete this travel package?
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {`Are you sure you want to delete "${destination.name}" (${destination.country})? It will be permanently
            remove this travel package. This action cannot be
            undone.`}
          </DialogDescription>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-5"
            disabled={deleting}
            onClick={() => setOpen(false)}
          >
            Keep Package
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-10 rounded-md bg-destructive px-5 text-white hover:bg-destructive/90"
            disabled={deleting}
            onClick={handleDelete}
          >
            <Trash2 data-icon="inline-start" aria-hidden />
            {deleting ? "Deleting…" : "Delete Package"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
