import { notFound } from "next/navigation"
import { generateMetadata as genMeta } from "@/lib/metadata"
import {
  getPublicCourse,
  getPublicClasses,
  getPublicCourses,
  sessionsForWorkshop,
  type PublicCourse,
} from "@/lib/public-courses"
import { ProgramDetail } from "@/components/programs/program-detail"

/**
 * Workshop detail — W5, mirror of /programs/[id] on Figma #1988:7824
 * "workshop - more details". Same skeleton as the program detail
 * (variant="workshop"); the only per-screen delta is the location row
 * (12/400 lh14, #3873:18890). No course_type guard — the listing only
 * links short_term/summer courses here, and the page renders any id
 * it is given (visual-only build).
 */
type Params = { params: Promise<{ id: string }> }

async function loadCourse(id: string): Promise<PublicCourse | null> {
  if (!/^\d+$/.test(id)) return null
  return getPublicCourse(Number(id))
}

export async function generateMetadata({ params }: Params) {
  const { id } = await params
  const course = await loadCourse(id)
  if (!course) return genMeta({ title: "Workshop not found", noIndex: true })
  return genMeta({
    title: course.name,
    description: course.intro ?? undefined,
    url: `/workshops/${course.id}`,
  })
}

export default async function WorkshopDetailPage({ params }: Params) {
  const { id } = await params
  const course = await loadCourse(id)
  if (!course) notFound()

  const [classes, allCourses] = await Promise.all([getPublicClasses(), getPublicCourses()])
  const sessions = sessionsForWorkshop(classes, course)
  const similar = allCourses
    .filter((c) => c.id !== course.id && c.center_id === course.center_id)
    .slice(0, 3)

  return (
    <ProgramDetail
      course={course}
      classes={sessions}
      similar={similar}
      variant="workshop"
    />
  )
}
