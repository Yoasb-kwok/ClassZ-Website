import { Suspense } from "react"
import { AttendanceManager } from "@/components/admin/attendance-manager"

export default function AttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <AttendanceManager />
    </Suspense>
  )
}
