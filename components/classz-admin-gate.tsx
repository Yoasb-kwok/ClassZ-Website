"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { clearClasszSession, getClasszSession, isDemoTokenSession } from "@/lib/classz-auth"
import { ClasszAdminShell } from "@/components/classz-admin-shell"
import { adminSurface } from "@/components/classz-admin-ui"
import { useLanguage } from "@/components/language-provider"

export function ClasszAdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const s = getClasszSession()
    if (!s) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`)
      return
    }
    const platformPaths = ["/admin/centers", "/admin/center-accounts", "/admin/center-crm", "/admin/course-approvals"]
    const needsRealToken =
      s.user.role === "platform_admin" &&
      platformPaths.some((p) => pathname === p || pathname?.startsWith(`${p}/`))
    if (needsRealToken && isDemoTokenSession()) {
      clearClasszSession()
      router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`)
      return
    }
    if (s.user.role === "coach") {
      const allowed =
        pathname === "/admin" ||
        pathname === "/admin/tasks" ||
        Boolean(pathname?.startsWith("/admin/tasks/")) ||
        pathname === "/admin/teacher-students" ||
        Boolean(pathname?.startsWith("/admin/teacher-students/"))
      if (!allowed) {
        router.replace("/admin/teacher-students")
        return
      }
    }
    setReady(true)
  }, [router, pathname])

  if (!ready) {
    return (
      <div
        className={`classz-admin-theme min-h-screen flex flex-col items-center justify-center gap-3 font-sans antialiased ${adminSurface}`}
      >
        <div
          className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin"
          aria-hidden
        />
        <p className="text-base text-classz-600">{t("classzAdmin.gateLoading")}</p>
      </div>
    )
  }

  return <ClasszAdminShell>{children}</ClasszAdminShell>
}
