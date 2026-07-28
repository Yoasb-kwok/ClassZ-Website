"use client"

import Link from "next/link"
import { BarChart3, DollarSign, Flame, Megaphone, Star, UsersRound } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { AdminPageFrame, AdminPageHeader, type BrandTone } from "@/components/classz-admin-ui"

const REPORTS: Array<{
  href: string
  icon: typeof Star
  zh: string
  en: string
  descZh: string
  descEn: string
  tone: BrandTone
}> = [
  {
    href: "/admin/reports/teacher-ratings",
    icon: Star,
    zh: "導師評價排行",
    en: "Teacher ratings",
    descZh: "綜合評分與名次",
    descEn: "Composite scores and ranking",
    tone: "orange",
  },
  {
    href: "/admin/reports/revenue",
    icon: DollarSign,
    zh: "收入報表",
    en: "Revenue",
    descZh: "每日／每月已付收入",
    descEn: "Daily / monthly paid revenue",
    tone: "teal",
  },
  {
    href: "/admin/reports/retention",
    icon: UsersRound,
    zh: "學員留存",
    en: "Retention",
    descZh: "續約率與流失名單",
    descEn: "Renewal rate and churn list",
    tone: "magenta",
  },
  {
    href: "/admin/reports/popular-courses",
    icon: Flame,
    zh: "課程熱門度",
    en: "Course popularity",
    descZh: "報名與滿額率排行",
    descEn: "Enrollment and fill-rate ranking",
    tone: "coral",
  },
  {
    href: "/admin/reports/ad-conversion",
    icon: Megaphone,
    zh: "廣告學生轉換率",
    en: "Ad conversion",
    descZh: "渠道名單 → 轉換漏斗",
    descEn: "Channel lead → conversion funnel",
    tone: "slate",
  },
]

const TONE_ICON: Record<BrandTone, string> = {
  teal: "bg-[color-mix(in_srgb,var(--brand-teal)_14%,white)] text-brand-teal",
  slate: "bg-[color-mix(in_srgb,var(--brand-slate)_10%,white)] text-brand-slate",
  magenta: "bg-[color-mix(in_srgb,var(--brand-magenta)_12%,white)] text-brand-magenta",
  orange: "bg-[color-mix(in_srgb,var(--brand-orange)_14%,white)] text-brand-orange",
  coral: "bg-[color-mix(in_srgb,var(--brand-coral)_12%,white)] text-brand-coral",
}

const TONE_BORDER: Record<BrandTone, string> = {
  teal: "hover:border-brand-teal/40",
  slate: "hover:border-brand-slate/35",
  magenta: "hover:border-brand-magenta/40",
  orange: "hover:border-brand-orange/40",
  coral: "hover:border-brand-coral/40",
}

export function ReportsHub() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "報表" : "Reports"}
        description={zh ? "選擇報表類型查看洞察" : "Choose a report to explore insights"}
        Icon={BarChart3}
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {REPORTS.map((r) => {
          const Icon = r.icon
          return (
            <Link
              key={r.href}
              href={r.href}
              className={`group block rounded-xl border border-classz-100 bg-white p-4 shadow-[0_1px_2px_rgba(10,186,181,0.05)] hover:bg-classz-50/40 transition-colors ${TONE_BORDER[r.tone]}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${TONE_ICON[r.tone]}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="font-semibold text-brand-slate">{zh ? r.zh : r.en}</h2>
                  <p className="text-sm text-brand-slate/65 mt-0.5">{zh ? r.descZh : r.descEn}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </AdminPageFrame>
  )
}
