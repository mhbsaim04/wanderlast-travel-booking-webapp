"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategorySelect } from "@/components/category-select";
import { CountryCombobox } from "@/components/ui/country-combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Destination } from "@/lib/api";

const inputClass = "h-10";

export function EditDestinationDialog({
  destination,
}: {
  destination: Destination;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState<string | null>(destination.country);
  const [category, setCategory] = useState<string | null>(destination.category);
  const [invalidCountry, setInvalidCountry] = useState(false);
  const [invalidCategory, setInvalidCategory] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      // Re-sync with the latest server data every time the dialog opens.
      setCountry(destination.country);
      setCategory(destination.category);
      setInvalidCountry(false);
      setInvalidCategory(false);
    }
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!country) setInvalidCountry(true);
    if (!category) setInvalidCategory(true);
    if (!country || !category) return;

    const form = event.currentTarget;
    // Base UI Select/Combobox aren't native form controls with stable FormData —
    // merge their state in explicitly, matching the add-destination payload keys.
    const payload: Record<string, unknown> = {
      ...Object.fromEntries(new FormData(form).entries()),
      country,
      category,
    };

    setSaving(true);
    void (async () => {
      try {
        // Backend route: app.patch('/destination/:id') — single "destination".
        // Falls back to name-matching only in the list route; the PATCH needs a
        // real _id, so bail with a clear message if we somehow don't have one.
        if (!destination.id) {
          throw new Error(
            "This package has no MongoDB id, so it can't be updated in place."
          );
        }
        const res = await fetch(
          `/api/admin/destinations/${encodeURIComponent(destination.id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = (await res.json().catch(() => null)) as
          | (Record<string, unknown> & {
              message?: string;
              error?: string;
              matchedCount?: number;
            })
          | null;
        if (!res.ok) {
          throw new Error(
            (data?.message ?? data?.error) ??
              `Changes could not be saved (HTTP ${res.status}).`
          );
        }
        // updateOne() reports matches — a 200 with matchedCount: 0 means the
        // document is gone (deleted / id mismatch), not that anything saved.
        if (typeof data?.matchedCount === "number" && data.matchedCount === 0) {
          throw new Error(
            "No package with that id exists on the server — it may have been deleted. Refresh the page."
          );
        }
        toast.success(`"${String(payload.name)}" has been updated!`);
        setOpen(false);
        // Re-render the server component with the updated MongoDB document.
        router.refresh();
      } catch (error) {
        const description =
          error instanceof TypeError
            ? "Could not reach the server — is the backend running and the admin session valid?"
            : error instanceof Error
              ? error.message
              : "Something went wrong while saving your changes.";
        toast.error("Changes could not be saved", { description });
      } finally {
        setSaving(false);
      }
    })();
  }

  return (
    <Dialog  open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-transparent px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none select-none hover:bg-muted aria-expanded:bg-muted aria-expanded:text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <Pencil className="size-3.5" aria-hidden />
        Edit
      </DialogTrigger>
      <DialogContent className="grid max-h-[calc(100svh-2rem)] w-auto max-w-3xl grid-rows-[auto_1fr_auto] gap-x-0 gap-y-6 overflow-hidden rounded-lg p-6 sm:rounded-lg">
        <div className="flex flex-col gap-2 pr-8">
          <DialogTitle className="font-serif text-2xl font-normal text-foreground">
            Update Travel Package
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Make changes to the travel package details below
          </DialogDescription>
        </div>

        {/* Scrollable field area — keeps the dialog inside the viewport on
            small screens while the header and action row stay pinned. */}
        <form
          id="edit-destination-form"
          onSubmit={handleSave}
          className="flex min-h-0 flex-col gap-5 overflow-y-auto pr-1"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name">Destination Name</Label>
            <Input
              id="edit-name"
              name="name"
              className={inputClass}
              defaultValue={destination.name}
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-country">Country</Label>
              <CountryCombobox
                id="edit-country"
                value={country}
                onValueChange={(value) => {
                  setCountry(value);
                  setInvalidCountry(false);
                }}
                invalid={invalidCountry}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <CategorySelect
                value={category}
                onValueChange={(value) => {
                  setCategory(value);
                  setInvalidCategory(false);
                }}
                invalid={invalidCategory}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-price">Price (USD)</Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                className={inputClass}
                defaultValue={Number.isFinite(destination.price) ? destination.price : ""}
                placeholder="e.g., 1299"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-duration">Duration</Label>
              <Input
                id="edit-duration"
                name="duration"
                className={inputClass}
                defaultValue={destination.duration}
                placeholder="e.g., 7 Days/6 Nights"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-departure">Departure Date</Label>
            <Input
              id="edit-departure"
              name="departure"
              type="date"
              className={inputClass}
              defaultValue={destination.departure ?? ""}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-image-url">Image URL</Label>
            <Input
              id="edit-image-url"
              name="image-url"
              type="url"
              className={inputClass}
              defaultValue={destination.imageUrl ?? ""}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              name="description"
              className="min-h-32"
              defaultValue={destination.description ?? ""}
              placeholder="Describe the travel experience…"
              required
            />
          </div>
        </form>

        {/* Pinned action row — submits the scrollable form via the form id. */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="destructive"
            className="h-10 rounded-md px-6"
            disabled={saving}
            onClick={() => setOpen(false)}
          >
            <Trash2 data-icon="inline-start" aria-hidden />
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-destination-form"
            className="h-10 rounded-md bg-brand px-6 hover:bg-brand/90"
            disabled={saving}
          >
            <Save data-icon="inline-start" aria-hidden />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
