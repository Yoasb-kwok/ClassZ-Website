import { BookOpen, CalendarCheck, ClipboardList, type LucideIcon } from "lucide-react"

export type CenterFlowNavItem = {
  path: string
  labelZh: string
  labelEn: string
  icon: LucideIcon
}

/** Centre admin: program → schedule → attendance. */
export const CENTER_FLOW_NAV: CenterFlowNavItem[] = [
  { path: "/admin/programs", labelZh: "課程設定", labelEn: "Programs", icon: BookOpen },
  { path: "/admin/schedule", labelZh: "排程", labelEn: "Scheduling", icon: CalendarCheck },
  { path: "/admin/attendance", labelZh: "點名", labelEn: "Attendance", icon: ClipboardList },
]

export function isCenterFlowPathActive(pathname: string, itemPath: string): boolean {
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}
