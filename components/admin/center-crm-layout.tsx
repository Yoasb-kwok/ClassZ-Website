"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useEffect, useLayoutEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { CENTER_FLOW_NAV } from "@/lib/classz-center-flow-nav"
import { centerCrmFlowPath, clearCenterCrmScope, setCenterCrmScope } from "@/lib/center-crm-scope"
import { apiGet } from "@/lib/classz-api-client"

export function CenterCrmLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname() || ""
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const centerId = Number(params?.centerId)
  const [centerName, setCenterName] = useState<string>("")

  useLayoutEffect(() => {
    return () => clearCenterCrmScope()
  }, [])

  useLayoutEffect(() => {
    if (!Number.isFinite(centerId) || centerId < 1) return
    setCenterCrmScope(centerId)
  }, [centerId])

  useEffect(() => {
    if (!Number.isFinite(centerId) || centerId < 1) return
    apiGet<{ center_name?: string }>(`/centers/${centerId}`, "platform_admin")
      .then((row) => setCenterName(String(row?.center_name || "")))
      .catch(() => setCenterName(""))
  }, [centerId])

  if (!Number.isFinite(centerId) || centerId < 1) {
    return <div className="text-red-600 text-sm">Invalid centre id</div>
  }

  const flows = CENTER_FLOW_NAV.map((item) => {
    const slug = item.path.replace("/admin/", "") as "programs" | "schedule" | "attendance" | "feedback"
    return {
      ...item,
      href: centerCrmFlowPath(centerId, slug),
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-classz-200 bg-white px-4 py-3 shadow-sm">
        <Link
          href="/admin/center-crm"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-classz-600 hover:text-classz-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {zh ? "返回中心列表" : "All centres"}
        </Link>
        <span className="text-classz-300">|</span>
        <span className="text-sm font-semibold text-classz-700">
          {centerName || `#${centerId}`}
          <span className="ml-2 text-xs font-normal text-classz-500">ID {centerId}</span>
        </span>
      </div>

      <nav className="flex flex-wrap gap-2">
        {flows.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                active
                  ? "bg-classz-100 border-classz-300 text-classz-700"
                  : "bg-white border-classz-200 text-classz-600 hover:bg-classz-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {zh ? item.labelZh : item.labelEn}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
