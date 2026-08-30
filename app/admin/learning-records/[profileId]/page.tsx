"use client"

import { Suspense } from "react"
import { TeacherFillLearningRecord } from "@/components/admin/teacher-fill-learning-record"

export default function CentreFillLearningRecordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 rounded-full border-2 border-classz-100 border-t-classz-400 animate-spin" />
        </div>
      }
    >
      <TeacherFillLearningRecord />
    </Suspense>
  )
}
