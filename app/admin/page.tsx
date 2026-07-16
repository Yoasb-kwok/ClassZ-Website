"use client"

import { getClasszSession } from "@/lib/classz-auth"
import { CentreDashboard } from "@/components/admin/centre-dashboard"
import AdminDashboardPage from "./dashboard-content"

export default function AdminHomePage() {
  const session = getClasszSession()

  if (session?.user.role === "center_admin") {
    return <CentreDashboard />
  }

  return <AdminDashboardPage />
}
