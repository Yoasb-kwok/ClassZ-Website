"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Megaphone } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { CourseBoostPanel } from "@/components/admin/course-boost-panel"
import { AdminPageFrame, AdminPageHeader } from "@/components/classz-admin-ui"

export function MarketingHub() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<"course" | "workshop">(
    searchParams.get("tab") === "workshop" ? "workshop" : "course",
  )

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "行銷" : "Marketing"}
        description={
          zh
            ? "把課程或工作坊置頂到前台列表。先付款者排最前。"
            : "Pin courses or workshops to the public lists. Whoever pays first stays on top."
        }
        Icon={Megaphone}
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["course", zh ? "課程置頂" : "Pin courses"],
            ["workshop", zh ? "工作坊置頂" : "Pin workshops"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${
              tab === k ? "bg-classz-100 border-classz-400" : "bg-white border-classz-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <CourseBoostPanel listing={tab} />
    </AdminPageFrame>
  )
}
