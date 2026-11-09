import Image from "next/image"
import { Compass, Headset, ShieldCheck } from "lucide-react"

const HIGHLIGHTS = [
  {
    icon: Compass,
    title: "Curated destinations",
    text: "Hand-picked stays and experiences across 120+ countries.",
  },
  {
    icon: ShieldCheck,
    title: "Secure account",
    text: "Your credentials are encrypted — we never share your data.",
  },
  {
    icon: Headset,
    title: "24/7 human support",
    text: "Real travel experts, ready whenever your plans change.",
  },
]

/**
 * Split-screen shell shared by the sign-up and login pages:
 * a full-bleed brand visual on the left, the auth card on the right.
 */
export function AuthShell({
  children,
  image,
  imageAlt,
}: {
  children: React.ReactNode
  image: string
  imageAlt: string
}) {
  return (
    <div className="flex flex-1">
      {/* Brand visual panel */}
      <div className="relative hidden w-[44%] max-w-xl overflow-hidden lg:block">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />
        <div className="relative flex h-full flex-col justify-end gap-10 p-10 text-white">
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-widest uppercase text-brand-soft">
              Wanderlast
            </p>
            <p className="text-3xl leading-tight font-semibold">
              Every great journey
              <br />
              starts with a single trip.
            </p>
          </div>
          <ul className="space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-sm text-white/75">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-brand-soft/60 to-background px-4 py-10 sm:px-6">
        {children}
      </div>
    </div>
  )
}
