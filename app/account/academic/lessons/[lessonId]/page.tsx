"use client"

import { useParams } from "next/navigation"
import { LessonPage } from "@/components/account/student-shell"

export default function Page() {
  const params = useParams()
  return <LessonPage kind="academic" lessonId={String(params.lessonId || "")} />
}
