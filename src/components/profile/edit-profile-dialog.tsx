"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PencilLine } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface Props {
  name: string;
  image?: string | null;
  email: string;
}

export function EditProfileButton({ name, image, email }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newName = String(formData.get("name") ?? "").trim();
    const newImage = String(formData.get("image") ?? "").trim();

    if (!newName) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    const { error } = await authClient.updateUser({
      name: newName,
      image: newImage || undefined,
    });
    setSaving(false);

    if (error) {
      toast.error("Could not update profile", {
        description: error.message ?? "Please try again.",
      });
      return;
    }

    toast.success("Profile updated", {
      description: "Your changes are live across the site.",
    });
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(props) => (
          <button
            type="button"
            {...props}
            className={cn(
              "inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand text-sm font-medium text-white transition-colors outline-none hover:bg-brand/85 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            )}
          >
            <PencilLine className="size-4" aria-hidden />
            Edit Profile
          </button>
        )}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update how you appear on Wanderlast. Email is managed by your
            sign-in ({email}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
              <Input
                id="profile-name"
                name="name"
                type="text"
                defaultValue={name}
                autoComplete="name"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-image">
                Profile image URL{" "}
                <span className="font-normal text-muted-foreground">
                  (Google Drive share links work too)
                </span>
              </FieldLabel>
              <Input
                id="profile-image"
                name="image"
                type="url"
                defaultValue={image ?? ""}
                placeholder="https://…"
                autoComplete="off"
              />
            </Field>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" className="bg-brand hover:bg-brand/85" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
