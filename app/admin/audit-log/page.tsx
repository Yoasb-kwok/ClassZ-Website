"use client"

import { useEffect, useState } from "react"
import { AuditManager } from "@/components/admin/audit-manager"
import { CenterAuditLog } from "@/components/admin/center-audit-log"
import { getClasszSession } from "@/lib/classz-auth"

export default function AdminAuditLogPage() {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(getClasszSession()?.user.role || "")
  }, [])

  if (role === null) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (role === "center_admin") return <CenterAuditLog />
  return <AuditManager />
}
