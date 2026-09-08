"use client"

import { useParams } from "next/navigation"
import { LessonRecordPage } from "@/components/account/student-shell"

export default function Page() {
  const params = useParams()
  return (
    <LessonRecordPage
      kind="activity"
      lessonId={String(params.lessonId || "")}
      recordId={String(params.recordId || "")}
    />
  )
}
