"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getClasszSession } from "@/lib/classz-auth"
import { StudentAccountGate } from "@/components/account/student-shell"

/**
 * ADR-006 D9 — the new Profile pages (/account/profile|children|transactions|
 * favorites) get their own in-page sidebar and must NOT render inside the
 * ZPassport shell. This switch keeps the passport gate/shell for the old
 * /account/* routes and renders a lightweight authenticated frame for the
 * Profile section.
 */

const PROFILE_PATHS = [
  "/account/profile",
  "/account/children",
  "/account/transactions",
  "/account/favorites",
]

export function AccountLayoutSwitch({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const isProfileSection = PROFILE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )

  useEffect(() => {
    if (!isProfileSection) return
    const session = getClasszSession()
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/account/profile")}`)
      return
    }
    if (session.user.role !== "student") {
      router.replace("/admin")
      return
    }
    setChecked(true)
  }, [isProfileSection, pathname, router])

  if (!isProfileSection) {
    return <StudentAccountGate>{children}</StudentAccountGate>
  }
  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-classz-400 border-t-transparent" />
      </div>
    )
  }
  return <>{children}</>
}
