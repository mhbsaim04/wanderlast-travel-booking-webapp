"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut, Ticket, User } from "lucide-react";
import { toast } from "sonner";

import { authClient, useSession } from "@/lib/auth-client";
import {
  Popover,
  PopoverContent,
  PopoverSeparator,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AUTH_LINKS = [
  { label: "Login", href: "/login" },
  { label: "Sign Up", href: "/sign-up" },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/**
 * Google Drive "share" links (…/file/d/<id>/view?usp=…) are HTML pages, not
 * images, so browsers can't render them in <img>. Convert them to Drive's
 * direct thumbnail URL, which renders as a real image.
 */
function toDirectImageUrl(src: string) {
  const drive = src.match(
    /^https?:\/\/drive\.google\.com\/file\/d\/([^/?#]+)/
  );
  if (drive) {
    return `https://drive.google.com/thumbnail?id=${drive[1]}&sz=w400`;
  }
  return src;
}

export function UserAvatar({
  src,
  name,
  size = "sm",
  className,
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  // Only real http(s) URLs can resolve; anything else falls back to initials.
  const imageSrc =
    src?.startsWith("http") ? toDirectImageUrl(src) : undefined;

  return (
    <Avatar size={size} className={className}>
      {imageSrc ? <AvatarImage src={imageSrc} alt="" /> : null}
      <AvatarFallback className="bg-brand font-semibold text-white">
        {initials(name) || "?"}
      </AvatarFallback>
    </Avatar>
  );
}

function SkeletonLink() {
  return (
    <span
      className="h-4 w-12 animate-pulse rounded bg-muted"
      aria-hidden
    />
  );
}

export function UserInfo() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    const { error } = await authClient.signOut();
    setSigningOut(false);
    if (error) {
      toast.error("Sign out failed", {
        description: error.message ?? "Please try again.",
      });
      return;
    }
    toast.success("Logged out", { description: "See you on your next trip! ✈️" });
    router.push("/");
    router.refresh();
  };

  if (isPending) {
    return (
      <div className="flex items-center gap-6">
        <SkeletonLink />
        <SkeletonLink />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-6">
        {AUTH_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="transition-colors hover:text-brand"
          >
            {link.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      {/* Profile link — matches the other navbar items */}
      <Link
        href="/profile"
        className="hidden items-center gap-1.5 transition-colors hover:text-brand sm:flex"
      >
        <User className="size-3.5" aria-hidden />
        Profile
      </Link>

      <Popover>
        <PopoverTrigger
          className="flex cursor-pointer items-center gap-2 rounded-full py-0.5 pr-2.5 pl-0.5 transition-colors hover:bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Open account menu"
        >
          <UserAvatar src={user.image} name={user.name} size="sm" />

          <span className="hidden max-w-30 truncate sm:block">
            {user.name}
          </span>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-64">
          <div className="flex items-center gap-3 p-1.5">
            <UserAvatar src={user.image} name={user.name} size="lg" />
            <div className="min-w-0">
              <PopoverTitle className="truncate">{user.name}</PopoverTitle>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>

          <PopoverSeparator />

          {/* Quick links — also makes Profile reachable on mobile */}
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <User className="size-4" aria-hidden />
            My Profile
          </Link>
          <Link
            href="/bookings"
            className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Ticket className="size-4" aria-hidden />
            My Bookings
          </Link>

          <PopoverSeparator />
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-sm outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground"
          >
            {signingOut ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LogOut className="size-4" aria-hidden />
            )}
            Sign Out
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
