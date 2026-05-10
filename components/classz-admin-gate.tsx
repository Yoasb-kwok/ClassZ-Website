"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getClasszSession } from "@/lib/classz-auth"
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
    setReady(true)
  }, [router, pathname])

  if (!ready) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-3 font-sans antialiased ${adminSurface} text-classz-600`}>
        <div
          className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin"
          aria-hidden
        />
        <p className="text-base">{t("classzAdmin.gateLoading")}</p>
      </div>
    )
  }

  return <ClasszAdminShell>{children}</ClasszAdminShell>
}
