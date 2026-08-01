"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getClasszSession } from "@/lib/classz-auth"
import { CentreDashboard } from "@/components/admin/centre-dashboard"

export default function AdminHomePage() {
  const session = getClasszSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user.role === "coach") {
      router.replace("/admin/teacher-students")
    }
  }, [session?.user.role, router])

  if (session?.user.role === "coach") {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  // centre_admin + platform_admin land on centre-side dashboard first
  return <CentreDashboard />
}
