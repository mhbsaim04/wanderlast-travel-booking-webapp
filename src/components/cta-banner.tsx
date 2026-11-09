import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden py-16 text-center">
      <Image
        src="/imges/CTA.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-black/55 bg-gradient-to-b from-black/40 to-black/70"
      />

      <div className="relative z-10 flex flex-col items-center px-4">
        <h2 className="font-serif text-4xl font-light tracking-wide text-white sm:text-5xl">
          Ready To Start Your Journey?
        </h2>
        <p className="mt-3 text-sm text-white/85">
          Join thousands of travelers who have discovered the world with us
        </p>
        <Button
          nativeButton={false}
          className="mt-8 h-11 rounded-md bg-white px-8 text-xs font-semibold uppercase tracking-widest text-foreground shadow-lg shadow-black/30 hover:bg-white/85"
          render={<Link href="/destinations" />}
        >
          Book Your Trip Today
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </div>
    </section>
  );
}
