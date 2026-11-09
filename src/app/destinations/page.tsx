import type { Metadata } from "next";
import { DestinationsExplorer } from "@/components/destinations-explorer";
import { loadAllDestinations } from "@/lib/destinations-server";

export const metadata: Metadata = {
  title: "Explore Destinations — Wanderlast",
  description:
    "Find your perfect travel experience from Wanderlast's curated collection of destinations.",
};

export default async function DestinationsPage() {
  const { destinations, error } = await loadAllDestinations();

  return (
    <main className="flex-1">
      <DestinationsExplorer destinations={destinations} error={error} />
    </main>
  );
}
