"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { PublicCourse } from "@/lib/public-courses"
import { DiscoveryListing } from "./discovery-listing"

export function DiscoveryPage({
  courses,
  variant,
}: {
  courses: PublicCourse[]
  variant: "programs" | "workshops"
}) {
  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />
      <DiscoveryListing courses={courses} variant={variant} />
      <Footer />
    </main>
  )
}
