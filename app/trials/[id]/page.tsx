import { notFound } from "next/navigation"
import { generateMetadata as genMeta } from "@/lib/metadata"
import {
  getPublicCourse,
  getPublicClasses,
  getPublicCourses,
  sessionsForWorkshop,
  type PublicCourse,
} from "@/lib/public-courses"
import { getHostCentre } from "@/lib/public-centres"
import { ProgramDetail } from "@/components/programs/program-detail"

type Params = { params: Promise<{ id: string }> }

async function loadCourse(id: string): Promise<PublicCourse | null> {
  if (!/^\d+$/.test(id)) return null
  return getPublicCourse(Number(id))
}

export async function generateMetadata({ params }: Params) {
  const { id } = await params
  const course = await loadCourse(id)
  if (!course) return genMeta({ title: "Trial class not found", noIndex: true })
  return genMeta({
    title: course.name,
    description: course.intro ?? undefined,
    url: `/trials/${course.id}`,
  })
}

export default async function TrialDetailPage({ params }: Params) {
  const { id } = await params
  const course = await loadCourse(id)
  if (!course) notFound()

  const [classes, allCourses, hostCentre] = await Promise.all([
    getPublicClasses(),
    getPublicCourses(),
    getHostCentre(course.center_id),
  ])
  const sessions = sessionsForWorkshop(classes, course)
  const similar = allCourses
    .filter((c) => c.id !== course.id && c.center_id === course.center_id)
    .slice(0, 3)

  return (
    <ProgramDetail
      course={course}
      classes={sessions}
      similar={similar}
      hostCentre={hostCentre}
      variant="workshop"
    />
  )
}
