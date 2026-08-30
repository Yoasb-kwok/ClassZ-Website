"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { PublicCourse } from "@/lib/public-courses";
import { DiscoveryListing } from "./discovery-listing";

export function DiscoveryPage({
  courses,
  variant,
  scheduleCounts,
}: {
  courses: PublicCourse[];
  /** "centre" = W7 /centres/[id]?tab=programs state (#2568:10769) */
  variant: "programs" | "workshops" | "trials" | "centre";
  scheduleCounts?: Record<number, number>;
}) {
  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />
      <DiscoveryListing
        courses={courses}
        variant={variant}
        scheduleCounts={scheduleCounts}
      />
      <Footer />
    </main>
  );
}
