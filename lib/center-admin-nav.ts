import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  CalendarClock,
  ClipboardList,
  MessageSquareText,
  Receipt,
  Tag,
  Undo2,
  Contact,
  BarChart3,
  Megaphone,
} from "lucide-react"

export type CenterAdminNavItem = {
  path: string
  labelZh: string
  labelEn: string
  icon: LucideIcon
}

export type CenterAdminNavGroup = {
  titleZh: string
  titleEn: string
  items: CenterAdminNavItem[]
}

/** Full Centre Admin IA — Dashboard through Marketing. */
export function getCenterAdminNavGroups(): CenterAdminNavGroup[] {
  return [
    {
      titleZh: "總覽",
      titleEn: "Overview",
      items: [{ path: "/admin", labelZh: "Dashboard", labelEn: "Dashboard", icon: LayoutDashboard }],
    },
    {
      titleZh: "人員",
      titleEn: "People",
      items: [
        { path: "/admin/students", labelZh: "學員", labelEn: "Students", icon: Users },
        { path: "/admin/teachers", labelZh: "導師", labelEn: "Teachers", icon: GraduationCap },
      ],
    },
    {
      titleZh: "營運",
      titleEn: "Operations",
      items: [
        { path: "/admin/schedule", labelZh: "排程", labelEn: "Schedule", icon: CalendarCheck },
        { path: "/admin/programs", labelZh: "課程", labelEn: "Courses", icon: BookOpen },
        { path: "/admin/bookings", labelZh: "預約", labelEn: "Bookings", icon: CalendarClock },
        { path: "/admin/attendance", labelZh: "點名", labelEn: "Attendance", icon: ClipboardList },
        { path: "/admin/feedback", labelZh: "課堂回饋", labelEn: "Feedback", icon: MessageSquareText },
      ],
    },
    {
      titleZh: "財務",
      titleEn: "Finance",
      items: [
        { path: "/admin/payments", labelZh: "付款記錄", labelEn: "Payments", icon: Receipt },
        { path: "/admin/coupons", labelZh: "優惠券", labelEn: "Coupons", icon: Tag },
        { path: "/admin/refunds", labelZh: "退款記錄", labelEn: "Refunds", icon: Undo2 },
      ],
    },
    {
      titleZh: "增長",
      titleEn: "Growth",
      items: [
        { path: "/admin/crm", labelZh: "CRM", labelEn: "CRM", icon: Contact },
        { path: "/admin/marketing", labelZh: "行銷", labelEn: "Marketing", icon: Megaphone },
      ],
    },
    {
      titleZh: "洞察",
      titleEn: "Insights",
      items: [{ path: "/admin/reports", labelZh: "報表", labelEn: "Reports", icon: BarChart3 }],
    },
  ]
}

/** Kept for platform CRM horizontal nav (4-step ops). */
export { CENTER_FLOW_NAV, isCenterFlowPathActive } from "@/lib/classz-center-flow-nav"
