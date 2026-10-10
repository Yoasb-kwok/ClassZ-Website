"use client"

import { useSyncExternalStore } from "react"
import { AuditManager } from "@/components/admin/audit-manager"
import { CenterAuditLog } from "@/components/admin/center-audit-log"
import { CLASSZ_SESSION_EVENT, getClasszSession } from "@/lib/classz-auth"

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CLASSZ_SESSION_EVENT, onStoreChange)
  return () => window.removeEventListener(CLASSZ_SESSION_EVENT, onStoreChange)
}

function roleSnapshot() {
  return getClasszSession()?.user.role ?? ""
}

export default function AdminAuditLogPage() {
  const role = useSyncExternalStore(subscribe, roleSnapshot, () => "")

  if (!role) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (role === "center_admin") return <CenterAuditLog />
  return <AuditManager />
}
