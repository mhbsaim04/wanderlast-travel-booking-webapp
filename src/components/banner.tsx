import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/hero/hero-search";
import { loadAllDestinations } from "@/lib/destinations-server";

export async function Banner() {
  // Live destination data for the interactive hero search — streamed in
  // behind the <Suspense> boundary in the homepage.
  const { destinations } = await loadAllDestinations();

  return (
    <section className="relative flex min-h-[calc(100svh-2.75rem)] flex-1 flex-col items-center justify-center overflow-hidden">
      <Image
        src="/imges/Banner.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-black/25 bg-linear-to-b from-black/30 via-transparent to-black/50"
      />

      {/* Hero copy */}
      <div className="relative z-10 flex flex-col items-center px-4 pb-24 text-center">
        <h1 className="font-serif text-5xl font-light tracking-wide text-white sm:text-6xl md:text-7xl">
          Discover Your
          <br />
          Next Adventure
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-white/90">
          Explore breathtaking destinations and create unforgettable memories
          with our curated travel experiences.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            nativeButton={false}
            className="h-11 rounded-md bg-brand px-8 text-xs font-semibold uppercase tracking-widest text-white shadow-lg shadow-black/20 hover:bg-brand/90"
            render={<Link href="/destinations" />}
          >
            Explore Now
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Button>
          <Button
            nativeButton={false}
            className="h-11 rounded-md border-white/30 bg-white/25 px-8 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm hover:bg-white/35"
            render={<Link href="/bookings" />}
          >
            My Bookings
          </Button>
        </div>
      </div>

      {/* Interactive search */}
      <HeroSearch destinations={destinations} />
    </section>
  );
}
