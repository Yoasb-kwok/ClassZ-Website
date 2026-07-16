import type { ClasszPortalRole } from "@/lib/classz-auth"
import { getClasszSession } from "@/lib/classz-auth"
import { getAdminNavGroups as allGroups, type AdminNavGroup } from "@/lib/classz-admin-nav"
import { getCenterAdminNavGroups } from "@/lib/center-admin-nav"
import { Building2, CheckCircle, LayoutDashboard, Users } from "lucide-react"

const PLATFORM_ONLY: AdminNavGroup[] = [
  {
    titleZh: "平台管理",
    titleEn: "Platform",
    items: [
      { path: "/admin/centers", labelZh: "中心審核", labelEn: "Centres", icon: Building2 },
      { path: "/admin/center-accounts", labelZh: "中心帳戶", labelEn: "Centre accounts", icon: Users },
      { path: "/admin/center-crm", labelZh: "中心 CRM", labelEn: "Centre CRM", icon: LayoutDashboard },
      { path: "/admin/course-approvals", labelZh: "課程上架審批", labelEn: "Course approvals", icon: CheckCircle },
    ],
  },
]

export function getAdminNavGroupsForRole(role: ClasszPortalRole): AdminNavGroup[] {
  if (role === "center_admin") {
    return getCenterAdminNavGroups()
  }
  const base = allGroups()
  if (role === "platform_admin") {
    return [...PLATFORM_ONLY, ...base.filter((g) => g.titleEn === "Content")]
  }
  if (role === "coach") {
    return base.filter((g) => g.titleEn === "Operations" || g.titleEn === "Overview & finance")
  }
  return base
}

export function isDemoSession(): boolean {
  const s = getClasszSession()
  return !s?.token || s.token === "demo-classz-token"
}
