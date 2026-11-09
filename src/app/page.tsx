import { Suspense } from "react";
import { Banner } from "@/components/banner";
import { FeaturedDestinations } from "@/components/featured/featured-destinations";
import { WhyChooseUs } from "@/components/why-choose-us";
import { Testimonials } from "@/components/testimonials";
import { CtaBanner } from "@/components/cta-banner";

export default function Home() {
  return (
    <>
      {/* Hero streams in behind the boundary — it loads live destinations
          for the interactive search bar */}
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100svh-2.75rem)] items-center justify-center bg-brand-soft/40">
            <div className="size-40 animate-pulse rounded-full bg-brand/20" />
          </div>
        }
      >
        <Banner />
      </Suspense>

      <FeaturedDestinations />
      <WhyChooseUs />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
