'use client'

import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "cn";
import { UserInfo } from "@/components/user-info";
import { isAdminId } from "@/lib/admin";
import { useSession } from "@/lib/auth-client";

const NAV_LINKS = [
  { label: "Home", href: "/", active: true },
  { label: "Destinations", href: "/destinations" },
  { label: "Add Destination", href: "/add-destination", adminOnly: true },
  { label: "My Bookings", href: "/bookings" },
];

type NavLink = (typeof NAV_LINKS)[number];

export function Navbar() {
  // Client session check — the admin-only link appears once the session
  // resolves. The page itself is still gated server-side (defense in depth).
  const { data: session } = useSession();
  const isAdmin = isAdminId(session?.user?.id);

  const links = NAV_LINKS.filter(
    (link: NavLink) => !link.adminOnly || isAdmin
  );

  return (
    <header className="sticky top-0 z-50 grid h-11 grid-cols-[1fr_auto_1fr] items-center border-b border-border/60 bg-white px-4 sm:px-6">
      <nav className="hidden items-center gap-6 text-[13px] font-medium text-foreground md:flex">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              "transition-colors hover:text-brand",
              link.active &&
                "text-brand underline decoration-brand underline-offset-4"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile menu trigger */}
      <button
        type="button"
        aria-label="Open menu"
        className="justify-self-start md:hidden"
      >
        <Menu className="size-4" />
      </button>

      <Link
        href="/"
        className="justify-self-center text-xl font-bold tracking-tight text-brand"
      >
        Wanderlast
      </Link>

      <div className="flex items-center justify-end gap-6 text-[13px] font-medium text-foreground">
        <UserInfo />
      </div>
    </header>
  );
}
