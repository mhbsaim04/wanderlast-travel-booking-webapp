"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  DollarSign,
  ImagePlus,
  Link2,
  MapPin,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryCombobox } from "@/components/ui/country-combobox";
import { CategorySelect } from "@/components/category-select";
import { Textarea } from "@/components/ui/textarea";


const inputClass = "h-10";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function FieldIcon({ icon: Icon }: { icon: typeof MapPin }) {
  return (
    <Icon
      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden
    />
  );
}

export function AddDestinationForm() {
  const router = useRouter();
  const [country, setCountry] = useState<string | null>(null);
  const [countryError, setCountryError] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showPreview = /^https?:\/\/.+\.\S+/.test(imageUrl) && !imageError;

  function handleCountryChange(value: string | null) {
    setCountry(value);
    setCountryError(false);
  }

  function handleSelectChange(value: string | null) {
    setCategory(value);
    setCategoryError(false);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!category) setCategoryError(true);
    if (!country) setCountryError(true);
    if (!category || !country) return;

    // Fetch the JWT from better-auth; sent up so the Express backend verifies
    // it against the app's JWKS (the Next proxy forwards it verbatim).
   

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    // Base UI Select/Combobox aren't native form controls with stable FormData —
    // merge their state in explicitly.
    const payload = {
      ...Object.fromEntries(formData.entries()),
      country,
      category,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = `Package could not be saved (HTTP ${res.status}).`;
        try {
          const data = (await res.json()) as { message?: string; error?: string };
          message = data.message ?? data.error ?? message;
        } catch {
          // Non-JSON error body — keep the generic message.
        }
        throw new Error(message);
      }

      toast.success(`Travel Package for "${name || "New package"}" added!`, {
        description: `${country} · ${category}`,
      });
      form.reset();
      setImageUrl("");
      setImageError(false);
      setCountry(null);
      setCategory(null);
    } catch (error) {
      const description =
        error instanceof TypeError
          ? "Could not reach the server — is the backend running and the admin session valid?"
          : error instanceof Error
            ? error.message
            : "Something went wrong while saving the package.";
      toast.error("Package could not be saved", { description });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-3xl [--card-spacing:--spacing(8)] shadow-xl shadow-foreground/5">
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          <Field label="Destination Name" htmlFor="name">
            <div className="relative">
              <FieldIcon icon={MapPin} />
              <Input
                id="name"
                name="name"
                className={`${inputClass} pl-9`}
                placeholder="e.g., Bali Paradise"
                required
              />
            </div>
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label="Country"
              htmlFor="country"
              hint={countryError ? "Please choose or type a country." : undefined}
            >
              <CountryCombobox
                id="country"
                value={country}
                onValueChange={handleCountryChange}
                invalid={countryError}
              />
            </Field>

            <Field label="Category" hint={categoryError ? "Please choose a category." : undefined}>
              <CategorySelect
                value={category}
                onValueChange={handleSelectChange}
                invalid={categoryError}
              />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Price (USD)" htmlFor="price">
              <div className="relative">
                <FieldIcon icon={DollarSign} />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  className={`${inputClass} pl-9`}
                  placeholder="1,299"
                  required
                />
              </div>
            </Field>

            <Field label="Duration" htmlFor="duration">
              <div className="relative">
                <FieldIcon icon={CalendarDays} />
                <Input
                  id="duration"
                  name="duration"
                  className={`${inputClass} pl-9`}
                  placeholder="e.g., 7 Days/6 Nights"
                  required
                />
              </div>
            </Field>
          </div>

          <Field label="Departure Date" htmlFor="departure">
            <div className="relative">
              <FieldIcon icon={CalendarDays} />
              <Input
                id="departure"
                name="departure"
                type="date"
                className={`${inputClass} pl-9`}
                required
              />
            </div>
          </Field>

          <Field
            label="Image URL"
            htmlFor="image-url"
            hint={showPreview ? undefined : "Paste a link to a destination photo."}
          >
            <div className="relative">
              <FieldIcon icon={Link2} />
              <Input
                id="image-url"
                name="image-url"
                type="url"
                className={`${inputClass} pl-9`}
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(event) => {
                  setImageUrl(event.target.value);
                  setImageError(false);
                }}
                required
              />
            </div>
            {showPreview ? (
              <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-input bg-brand-soft/40">
                {/* Admin-entered remote URL — plain img, host isn't in next.config remotePatterns */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Destination preview"
                  className="size-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-brand-soft/40 text-xs text-muted-foreground">
                <ImagePlus className="size-5" aria-hidden />
                Live preview of your destination photo appears here
              </div>
            )}
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              className="min-h-36"
              placeholder="Describe the travel experience…"
              required
            />
          </Field>

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="destructive"
              className="h-10 rounded-md px-6"
              disabled={submitting}
              onClick={() => router.push("/")}
            >
              <Trash2 data-icon="inline-start" aria-hidden />
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-md bg-brand px-6 hover:bg-brand/90"
              disabled={submitting}
            >
              <Save data-icon="inline-start" aria-hidden />
              {submitting ? "Adding…" : "Add Travel Package"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
