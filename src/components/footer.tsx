import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const LINK_GROUPS = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "Destinations", href: "/destinations" },
      { label: "My Bookings", href: "/bookings" },
      { label: "My Profile", href: "/profile" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedInLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const SOCIALS = [
  { label: "X (Twitter)", href: "https://x.com", icon: XLogo },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedInLogo },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramLogo },
];

export function Footer() {
  return (
    <footer className="bg-[#0b0d10] text-white">
      <div className="mx-auto max-w-5xl px-4 pt-16 pb-8">
        <h2 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Wanderlast
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Your gateway to extraordinary travel experiences around the world.
        </p>

        <div className="mt-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <h3 className="font-serif text-sm tracking-wide">NEWSLETTER</h3>
            <p className="mt-2 text-xs text-white/60">
              Subscribe for exclusive travel deals and inspiration.
            </p>
            <form
              action="/newsletter"
              className="mt-4 flex h-10 items-center rounded-md bg-white/10 pr-1 pl-4 transition-colors focus-within:bg-white/15"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Enter email"
                className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="rounded-md p-2 text-white transition-colors hover:bg-white/10"
              >
                <ArrowUpRight className="size-4" aria-hidden />
              </button>
            </form>
          </div>

          {LINK_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="font-serif text-sm tracking-wide">
                {group.title.toUpperCase()}
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h3 className="font-serif text-sm tracking-wide">CONTACT US</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li>
                <a href="tel:7869011622" className="transition-colors hover:text-white">
                  786 901 1622
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@wanderlast.com"
                  className="transition-colors hover:text-white"
                >
                  info@wanderlast.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex items-center justify-between border-t border-white/10 py-6">
          <p className="text-xs text-white/50">
            © 2026 Wanderlast. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-white transition-colors
                 hover:text-white/60"
              >
                <social.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
