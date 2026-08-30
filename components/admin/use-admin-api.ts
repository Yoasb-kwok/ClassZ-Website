import type { ClasszPortalRole } from "@/lib/classz-auth"
import { getClasszSession } from "@/lib/classz-auth"
import { getAdminNavGroups as allGroups, type AdminNavGroup } from "@/lib/classz-admin-nav"
import { getCenterAdminNavGroups, getCoachNavGroups } from "@/lib/center-admin-nav"
import { Building2, CheckCircle, IdCard, LayoutDashboard, Shield, Users } from "lucide-react"

const PLATFORM_ONLY: AdminNavGroup[] = [
  {
    titleZh: "平台管理",
    titleEn: "Platform",
    items: [
      { path: "/admin/centers", labelZh: "中心審核", labelEn: "Centres", icon: Building2, moduleKey: "centers" },
      { path: "/admin/center-accounts", labelZh: "中心帳戶", labelEn: "Centre accounts", icon: Users, moduleKey: "center_accounts" },
      { path: "/admin/center-profiles", labelZh: "中心資料", labelEn: "Centre profiles", icon: IdCard, moduleKey: "center_profiles" },
      { path: "/admin/center-crm", labelZh: "中心 CRM", labelEn: "Centre CRM", icon: LayoutDashboard, moduleKey: "center_crm" },
      { path: "/admin/course-approvals", labelZh: "上架審批", labelEn: "Listing approvals", icon: CheckCircle, moduleKey: "course_approvals" },
      { path: "/admin/permissions", labelZh: "權限管理", labelEn: "Permissions", icon: Shield, moduleKey: "permissions" },
    ],
  },
]

export function getAdminNavGroupsForRole(role: ClasszPortalRole): AdminNavGroup[] {
  if (role === "center_admin") {
    return getCenterAdminNavGroups()
  }
  if (role === "coach") {
    return getCoachNavGroups()
  }
  if (role === "platform_admin") {
    const centerNav = getCenterAdminNavGroups()
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => item.moduleKey !== "centre_profile" && item.moduleKey !== "centre_members"),
      }))
      .filter((g) => g.items.length > 0)
    return [...PLATFORM_ONLY, ...centerNav]
  }
  return allGroups()
}

export function filterNavByModules(groups: AdminNavGroup[], enabled: Set<string>): AdminNavGroup[] {
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => {
        const key = item.moduleKey
        if (!key) return true
        if (key.startsWith("reports_") && key !== "reports") {
          return enabled.has("reports") && enabled.has(key)
        }
        return enabled.has(key)
      }),
    }))
    .filter((g) => g.items.length > 0)
}

export function isDemoSession(): boolean {
  const s = getClasszSession()
  return !s?.token || s.token === "demo-classz-token"
}
