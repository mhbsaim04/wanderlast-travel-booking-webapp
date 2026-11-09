"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";

const TESTIMONIALS = [
  {
    quote:
      "The Bali Trip Was Absolutely Magical! Every Detail Was Perfectly Planned. The Resorts Were Luxurious And The Cultural Experiences Were Unforgettable.",
    name: "Michael Chen",
    location: "Singapore",
    photo: "/imges/person2.png",
  },
  {
    quote:
      "Swiss Alps Adventure Exceeded All Expectations. The Mountain Views Were Breathtaking And Our Guide Was Incredibly Knowledgeable. Highly Recommend!",
    name: "Sarah Johnson",
    location: "New York, USA",
    photo: "/imges/person1.png",
  },
  {
    quote:
      "The Kyoto Tour Was A Dream Come True. Every Temple Visit Was Thoughtfully Curated And Our Guide Shared Stories We Would Never Have Found Ourselves.",
    name: "Aisha Patel",
    location: "Dubai, UAE",
    photo: "/imges/person3.jpg",
  },
  {
    quote:
      "Santorini Was Even Better Than The Photos. Seamless Transfers, Stunning Hotels, And A Team That Felt Like Friends By The End Of The Week.",
    name: "Daniel Rodriguez",
    location: "Barcelona, Spain",
    photo: "/imges/person4.jpg",
  },
];

function CarouselArrows() {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Previous testimonials"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className="rounded-full border-border/60 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden />
      </Button>
      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Next testimonials"
        disabled={!canScrollNext}
        onClick={scrollNext}
        className="rounded-full border-border/60 text-muted-foreground hover:text-foreground"
      >
        <ArrowRight aria-hidden />
      </Button>
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  location,
  photo,
}: (typeof TESTIMONIALS)[number]) {
  return (
    <figure className="flex h-full gap-6 rounded-[4px] border border-border/60 bg-white p-6 shadow-sm shadow-foreground/5">
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <blockquote className="font-serif text-[17px] leading-snug text-foreground">
          &quot;{quote}&quot;
        </blockquote>
        <figcaption className="mt-6">
          <div className="text-[15px] font-medium text-brand">— {name}</div>
          <div className="pl-[18px] text-xs text-muted-foreground">
            {location}
          </div>
        </figcaption>
      </div>
      <Image
        src={photo}
        alt={`Photo of ${name}`}
        width={360}
        height={480}
        className="w-32 shrink-0 self-stretch object-cover sm:w-36"
      />
    </figure>
  );
}

export function Testimonials() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <Carousel opts={{ align: "start", loop: true }}>
          <div className="flex items-end justify-between gap-6 pb-10">
            <div>
              <h2 className="font-serif text-4xl font-light tracking-wide text-foreground sm:text-5xl">
                What Travelers Say
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Real experiences from our happy travelers
              </p>
            </div>
            <CarouselArrows />
          </div>
          <CarouselContent>
            {TESTIMONIALS.map((testimonial) => (
              <CarouselItem
                key={testimonial.name}
                className="basis-full sm:basis-1/2"
              >
                <TestimonialCard {...testimonial} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
