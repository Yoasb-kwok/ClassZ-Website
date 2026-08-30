"use client"

import { useLayoutEffect } from "react"
import { useParams } from "next/navigation"
import { setCenterCrmScope, clearCenterCrmScope } from "@/lib/center-crm-scope"

export default function CenterProfileScopedLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const centerId = Number(params?.centerId)

  useLayoutEffect(() => {
    return () => clearCenterCrmScope()
  }, [])

  useLayoutEffect(() => {
    if (!Number.isFinite(centerId) || centerId < 1) return
    setCenterCrmScope(centerId)
  }, [centerId])

  return <>{children}</>
}
