"use client"

import { useCallback, useEffect, useState } from "react"
import { DollarSign } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet } from "@/lib/classz-api-client"
import {
  AdminCard,
  AdminPageFrame,
  AdminPageHeader,
  AdminTable,
  AdminTableShell,
} from "@/components/classz-admin-ui"

type Order = {
  id: number
  total?: number
  payment_status?: string
  created_at?: string
  user_id?: number
}

type Coupon = { id: number; code?: string; discount_value?: number; is_active?: boolean | number }

export function FinanceHub() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const [tab, setTab] = useState<"payments" | "outstanding" | "coupons" | "revenue">("payments")
  const [orders, setOrders] = useState<Order[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [revenue, setRevenue] = useState<{ days: Array<{ day: string; revenue: number }>; total: number } | null>(null)

  const load = useCallback(async () => {
    if (demo) return
    try {
      const [ords, cps, rev] = await Promise.all([
        apiGet<Order[]>("/orders").catch(() => []),
        apiGet<Coupon[]>("/coupons").catch(() => []),
        apiGet<{ days: Array<{ day: string; revenue: number }>; total: number }>("/reports/revenue").catch(() => null),
      ])
      setOrders(Array.isArray(ords) ? ords : [])
      setCoupons(Array.isArray(cps) ? cps : [])
      setRevenue(rev)
    } catch {
      /* ignore */
    }
  }, [demo])

  useEffect(() => {
    load()
  }, [load])

  const outstanding = orders.filter((o) => !["paid", "refunded"].includes(String(o.payment_status || "").toLowerCase()))
  const list = tab === "outstanding" ? outstanding : orders

  return (
    <AdminPageFrame>
      <AdminPageHeader title={zh ? "財務中心" : "Finance"} Icon={DollarSign} />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["payments", zh ? "付款" : "Payments"],
            ["outstanding", zh ? "未付" : "Outstanding"],
            ["coupons", zh ? "優惠券" : "Coupons"],
            ["revenue", zh ? "收入報表" : "Revenue"],
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

      {tab === "payments" || tab === "outstanding" ? (
        <AdminCard>
          <AdminTableShell>
            <AdminTable>
              <thead className="bg-classz-100">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">{zh ? "金額" : "Amount"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "狀態" : "Status"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "日期" : "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {list.map((o) => (
                  <tr key={o.id}>
                    <td className="px-3 py-2">{o.id}</td>
                    <td className="px-3 py-2">HK${Number(o.total || 0).toLocaleString()}</td>
                    <td className="px-3 py-2">{o.payment_status}</td>
                    <td className="px-3 py-2 text-sm text-classz-500">
                      {o.created_at ? new Date(o.created_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
                {!list.length ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-classz-500">
                      {demo ? (zh ? "請用中心帳號登入" : "Sign in") : zh ? "無訂單" : "No orders"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </AdminTable>
          </AdminTableShell>
        </AdminCard>
      ) : null}

      {tab === "coupons" ? (
        <AdminCard>
          <AdminTableShell>
            <AdminTable>
              <thead className="bg-classz-100">
                <tr>
                  <th className="px-3 py-2 text-left">Code</th>
                  <th className="px-3 py-2 text-left">{zh ? "折扣" : "Discount"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "狀態" : "Active"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 font-mono">{c.code}</td>
                    <td className="px-3 py-2">{c.discount_value}</td>
                    <td className="px-3 py-2">{c.is_active ? "Yes" : "No"}</td>
                  </tr>
                ))}
                {!coupons.length ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-classz-500">
                      {zh ? "無優惠券" : "No coupons"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </AdminTable>
          </AdminTableShell>
        </AdminCard>
      ) : null}

      {tab === "revenue" ? (
        <AdminCard>
          <p className="text-lg font-semibold text-classz-800 mb-4">
            {zh ? "近 30 日總收入" : "Last 30 days"}: HK${Number(revenue?.total || 0).toLocaleString()}
          </p>
          <ul className="text-sm divide-y divide-classz-100 max-h-96 overflow-y-auto">
            {(revenue?.days || []).map((d) => (
              <li key={d.day} className="py-2 flex justify-between">
                <span>{String(d.day).slice(0, 10)}</span>
                <span>HK${Number(d.revenue).toLocaleString()}</span>
              </li>
            ))}
            {!revenue?.days?.length ? <li className="py-6 text-center text-classz-500">{zh ? "無數據" : "No data"}</li> : null}
          </ul>
        </AdminCard>
      ) : null}
    </AdminPageFrame>
  )
}
