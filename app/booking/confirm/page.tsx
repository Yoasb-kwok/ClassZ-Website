import type { Metadata } from "next"
import Link from "next/link"
import {
  getPublicCourse,
  getPublicClasses,
  classesForCourse,
} from "@/lib/public-courses"
import { getHostCentre } from "@/lib/public-centres"
import { BookingConfirm } from "@/components/programs/booking-confirm"

export const metadata: Metadata = {
  title: "Confirm your booking",
  robots: { index: false },
}

type Params = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

function hk(amount: number) {
  const rounded = Math.round(amount)
  const text = rounded === amount ? rounded.toLocaleString("en-HK") : amount.toLocaleString("en-HK")
  return `HK$${text}`
}

export default async function BookingConfirmPage({ searchParams }: Params) {
  const sp = await searchParams
  const courseId = Number(firstParam(sp.course))
  const course =
    Number.isFinite(courseId) && courseId > 0 ? await getPublicCourse(courseId) : null

  if (!course) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <h1 className="text-[24px] font-[weight:590] text-ink">Nothing selected yet</h1>
        <p className="text-[14px] text-[#5E5E5E]">Pick a programme first, then confirm the displayed price.</p>
        <Link
          href="/programs"
          className="flex h-[37px] items-center justify-center rounded-[8px] bg-[#222222] px-[24px] text-[14px] font-[weight:590] text-white"
        >
          Browse programmes
        </Link>
      </main>
    )
  }

  const classIds = firstParam(sp.classes)
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
  const allClasses = await getPublicClasses()
  const programSessions = classesForCourse(allClasses, course)
  const sessions = classIds.length
    ? programSessions.filter((s) => classIds.includes(s.id))
    : programSessions
  const listed = course.price != null ? Number(course.price) : Number.NaN
  const queried = Number(firstParam(sp.price))
  const cataloguePrice = Number.isFinite(listed)
    ? listed
    : Number.isFinite(queried) && firstParam(sp.price) !== ""
      ? queried
      : null
  const priceLabel = cataloguePrice != null ? hk(cataloguePrice) : "—"
  const hostCentre = await getHostCentre(course.center_id)
  const next = new URLSearchParams()
  next.set("course", String(course.id))
  if (sessions.length) next.set("classes", sessions.map((s) => s.id).join(","))
  else if (classIds.length) next.set("classes", classIds.join(","))
  if (cataloguePrice != null) next.set("price", String(cataloguePrice))

  return (
    <BookingConfirm
      name={course.name}
      centreName={hostCentre?.name ?? ""}
      instructor={course.instructor || sessions.find((s) => s.instructor)?.instructor || ""}
      priceLabel={priceLabel}
      checkoutHref={`/payment?${next.toString()}`}
    />
  )
}
