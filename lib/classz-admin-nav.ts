import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Receipt,
  LibraryBig,
  GraduationCap,
  Tag,
  FileText,
  MessageSquare,
  BookOpen,
  Newspaper,
  Info,
  Phone,
  HelpCircle,
  ScrollText,
  Shield,
} from "lucide-react"

export type AdminNavItem = {
  path: string
  labelZh: string
  labelEn: string
  icon: LucideIcon
  moduleKey?: string
}

export type AdminNavGroup = {
  titleZh: string
  titleEn: string
  items: AdminNavItem[]
}

/** Sidebar + route list — aligned with Yard admin scope (ClassZ). */
export function getAdminNavGroups(): AdminNavGroup[] {
  return [
    {
      titleZh: "總覽與財務",
      titleEn: "Overview & finance",
      items: [
        { path: "/admin", labelZh: "總覽", labelEn: "Overview", icon: LayoutDashboard },
        { path: "/admin/financial", labelZh: "財務", labelEn: "Financial", icon: DollarSign },
      ],
    },
    {
      titleZh: "營運管理",
      titleEn: "Operations",
      items: [
        { path: "/admin/users", labelZh: "用戶管理", labelEn: "User management", icon: Users },
        { path: "/admin/purchases", labelZh: "購買記錄", labelEn: "Purchase records", icon: Receipt },
        { path: "/admin/courses", labelZh: "課程管理", labelEn: "Course management", icon: LibraryBig },
        { path: "/admin/instructors", labelZh: "導師管理", labelEn: "Instructor management", icon: GraduationCap },
        { path: "/admin/coupons", labelZh: "優惠券管理", labelEn: "Coupon management", icon: Tag },
        { path: "/admin/audit-log", labelZh: "審計日誌", labelEn: "Audit log", icon: FileText },
        { path: "/admin/class-notices", labelZh: "全班通知", labelEn: "Class notices", icon: MessageSquare },
      ],
    },
    {
      titleZh: "內容",
      titleEn: "Content",
      items: [
        { path: "/admin/cms/course-intro", labelZh: "課程介紹", labelEn: "Course intro", icon: BookOpen },
        { path: "/admin/cms/news", labelZh: "最新消息", labelEn: "News", icon: Newspaper },
        { path: "/admin/cms/about", labelZh: "關於我們", labelEn: "About us", icon: Info },
        { path: "/admin/cms/contact", labelZh: "聯絡我們", labelEn: "Contact us", icon: Phone },
        { path: "/admin/cms/faq", labelZh: "常見問題", labelEn: "FAQ", icon: HelpCircle },
        { path: "/admin/cms/terms", labelZh: "條款細則", labelEn: "Terms", icon: ScrollText },
        { path: "/admin/cms/privacy", labelZh: "私隱政策", labelEn: "Privacy policy", icon: Shield },
      ],
    },
  ]
}

export function getAdminNavLabel(path: string, zh: boolean): string | null {
  for (const g of getAdminNavGroups()) {
    const item = g.items.find((i) => i.path === path)
    if (item) return zh ? item.labelZh : item.labelEn
  }
  return null
}

export function isAdminNavPathActive(pathname: string, itemPath: string): boolean {
  if (itemPath === "/admin") {
    return pathname === "/admin" || pathname === "/admin/"
  }
  // Reports hub index should not stay active on nested report pages
  if (itemPath === "/admin/reports") {
    return pathname === "/admin/reports" || pathname === "/admin/reports/"
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}
