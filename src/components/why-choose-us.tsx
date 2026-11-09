import { Headset, Map, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Safe & Secure",
    description:
      "Your safety is our priority with comprehensive travel insurance and 24/7 support.",
  },
  {
    icon: Map,
    title: "Expert Guides",
    description:
      "Local experts who bring destinations to life with authentic cultural insights.",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    description:
      "Round-the-clock customer service to assist you wherever your journey takes you.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-brand-soft px-4 py-20">
      <div className="flex flex-col items-center text-center">
        <h2 className="font-serif text-4xl font-light tracking-wide text-foreground sm:text-5xl">
          Why Choose Wanderlast
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Your trusted partner for exceptional travel experiences
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col rounded-md bg-white p-8 shadow-md shadow-foreground/5"
          >
            <feature.icon className="size-7 text-brand" aria-hidden />
            <h3 className="mt-6 font-serif text-2xl text-foreground">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
