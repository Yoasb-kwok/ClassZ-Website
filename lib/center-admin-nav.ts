import type { LucideIcon } from "lucide-react"
import {
  CreditCard,
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
  Star,
  DollarSign,
  UsersRound,
  Flame,
  ListTodo,
  NotebookPen,
} from "lucide-react"

export type CenterAdminNavItem = {
  path: string
  labelZh: string
  labelEn: string
  icon: LucideIcon
  moduleKey?: string
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
      items: [{ path: "/admin", labelZh: "Dashboard", labelEn: "Dashboard", icon: LayoutDashboard, moduleKey: "dashboard" }],
    },
    {
      titleZh: "人員",
      titleEn: "People",
      items: [
        { path: "/admin/students", labelZh: "學員", labelEn: "Students", icon: Users, moduleKey: "students" },
        { path: "/admin/teachers", labelZh: "導師", labelEn: "Teachers", icon: GraduationCap, moduleKey: "teachers" },
      ],
    },
    {
      titleZh: "營運",
      titleEn: "Operations",
      items: [
        { path: "/admin/schedule", labelZh: "排程", labelEn: "Schedule", icon: CalendarCheck, moduleKey: "schedule" },
        { path: "/admin/programs", labelZh: "課程", labelEn: "Courses", icon: BookOpen, moduleKey: "programs" },
        { path: "/admin/bookings", labelZh: "預約", labelEn: "Bookings", icon: CalendarClock, moduleKey: "bookings" },
        { path: "/admin/attendance", labelZh: "點名", labelEn: "Attendance", icon: ClipboardList, moduleKey: "attendance" },
        { path: "/admin/tasks", labelZh: "指派任務", labelEn: "Tasks", icon: ListTodo, moduleKey: "tasks" },
        { path: "/admin/feedback", labelZh: "課堂回饋", labelEn: "Feedback", icon: MessageSquareText, moduleKey: "feedback" },
        {
          path: "/admin/learning-records",
          labelZh: "Learning Record",
          labelEn: "Learning Record",
          icon: NotebookPen,
          moduleKey: "learning_records",
        },
      ],
    },
    {
      titleZh: "財務",
      titleEn: "Finance",
      items: [
        { path: "/admin/payments", labelZh: "付款記錄", labelEn: "Payments", icon: Receipt, moduleKey: "payments" },
        { path: "/admin/subscription", labelZh: "訂閱方案", labelEn: "Plan", icon: CreditCard, moduleKey: "subscription" },
        { path: "/admin/coupons", labelZh: "優惠券", labelEn: "Coupons", icon: Tag, moduleKey: "coupons" },
        { path: "/admin/refunds", labelZh: "退款記錄", labelEn: "Refunds", icon: Undo2, moduleKey: "refunds" },
      ],
    },
    {
      titleZh: "增長",
      titleEn: "Growth",
      items: [
        { path: "/admin/crm", labelZh: "CRM", labelEn: "CRM", icon: Contact, moduleKey: "crm" },
        { path: "/admin/marketing", labelZh: "行銷", labelEn: "Marketing", icon: Megaphone, moduleKey: "marketing" },
      ],
    },
    {
      titleZh: "洞察",
      titleEn: "Insights",
      items: [
        { path: "/admin/reports", labelZh: "報表總覽", labelEn: "Reports hub", icon: BarChart3, moduleKey: "reports" },
        { path: "/admin/reports/teacher-ratings", labelZh: "導師評價排行", labelEn: "Teacher ratings", icon: Star, moduleKey: "reports_teacher_ratings" },
        { path: "/admin/reports/revenue", labelZh: "收入報表", labelEn: "Revenue", icon: DollarSign, moduleKey: "reports_revenue" },
        { path: "/admin/reports/retention", labelZh: "學員留存", labelEn: "Retention", icon: UsersRound, moduleKey: "reports_retention" },
        { path: "/admin/reports/popular-courses", labelZh: "課程熱門度", labelEn: "Course popularity", icon: Flame, moduleKey: "reports_popular" },
        { path: "/admin/reports/ad-conversion", labelZh: "廣告學生轉換率", labelEn: "Ad conversion", icon: Megaphone, moduleKey: "reports_ad_conversion" },
      ],
    },
  ]
}

/** Coach (teacher login) — students Learning Record + tasks. */
export function getCoachNavGroups(): CenterAdminNavGroup[] {
  return [
    {
      titleZh: "總覽",
      titleEn: "Overview",
      items: [
        {
          path: "/admin/teacher-students",
          labelZh: "學員 Learning Record",
          labelEn: "Student Learning Records",
          icon: NotebookPen,
          moduleKey: "teacher_students",
        },
      ],
    },
    {
      titleZh: "營運",
      titleEn: "Operations",
      items: [{ path: "/admin/tasks", labelZh: "我的任務", labelEn: "My tasks", icon: ListTodo, moduleKey: "tasks" }],
    },
  ]
}

/** Kept for platform CRM horizontal nav (4-step ops). */
export { CENTER_FLOW_NAV, isCenterFlowPathActive } from "@/lib/classz-center-flow-nav"
