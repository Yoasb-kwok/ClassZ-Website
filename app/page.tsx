import { redirect } from "next/navigation"
import { generateMetadata as genMeta } from "@/lib/metadata"

export const metadata = genMeta({
  title: 'ClassZ - Discover, Book & Track Extracurricular Classes for Kids',
  description: 'ClassZ is your all-in-one platform for discovering enrichment classes, booking sessions seamlessly, and tracking your child\'s learning progress. From sports to arts, coding to music - find the perfect class for your child.',
  url: '/',
})

export default function Page() {
  redirect("/our-mission")
}
