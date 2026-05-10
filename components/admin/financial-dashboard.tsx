"use client"

import { useMemo, useState } from "react"
import { BarChart3, DollarSign } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useAdminStore } from "@/components/admin/use-admin-store"
import { AdminCard, AdminInput, AdminLabel, AdminPageFrame, AdminPageHeader } from "@/components/classz-admin-ui"

function monthKey(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function FinancialDashboard() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const { store, ready } = useAdminStore()
  const defaultMonth = monthKey(new Date().toISOString())
  const [reportMonth, setReportMonth] = useState(defaultMonth)

  const stats = useMemo(() => {
    if (!store) return { revenue: 0, orders: 0, discount: 0, pending: 0 }
    const paid = store.orders.filter((o) => o.payment_status === "paid")
    const inMonth = paid.filter((o) => monthKey(o.created_at) === reportMonth)
    const revenue = inMonth.reduce((s, o) => s + o.total, 0)
    const discount = inMonth.reduce((s, o) => s + (o.discount || 0), 0)
    const pending = store.orders.filter((o) => o.payment_status === "pending").length
    return { revenue, orders: inMonth.length, discount, pending }
  }, [store, reportMonth])

  if (!ready || !store) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader title={zh ? "財務" : "Financial"} Icon={DollarSign} />
      <AdminCard className="max-w-xs">
        <AdminLabel>{zh ? "報表月份" : "Report month"}</AdminLabel>
        <AdminInput type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} />
      </AdminCard>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: zh ? "本月收入 (HK$)" : "Revenue (HK$)", value: stats.revenue.toLocaleString() },
          { label: zh ? "本月訂單" : "Orders", value: String(stats.orders) },
          { label: zh ? "本月折扣 (HK$)" : "Discounts (HK$)", value: stats.discount.toLocaleString() },
          { label: zh ? "待付款單" : "Pending", value: String(stats.pending) },
        ].map((c) => (
          <AdminCard key={c.label} className="p-5">
            <p className="text-base font-medium text-classz-600">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-classz-700">{c.value}</p>
          </AdminCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard>
          <h2 className="text-xl font-semibold text-classz-700 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-classz-500" />
            {zh ? "收入趨勢（示範）" : "Revenue trend (demo)"}
          </h2>
          <div className="h-56 rounded-md bg-classz-50 border border-dashed border-classz-200 flex items-center justify-center text-base text-classz-500">
            {zh ? "圖表區 — 接上 API 後可換 recharts" : "Chart area — wire API later"}
          </div>
        </AdminCard>
        <AdminCard>
          <h2 className="text-xl font-semibold text-classz-700 mb-4">{zh ? "分項（示範）" : "Breakdown (demo)"}</h2>
          <div className="h-56 rounded-md bg-classz-50 border border-dashed border-classz-200 flex items-center justify-center text-base text-classz-500">
            {zh ? "套餐／付款方式分佈" : "Package / payment split"}
          </div>
        </AdminCard>
      </div>
    </AdminPageFrame>
  )
}
