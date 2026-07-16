"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Receipt } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet } from "@/lib/classz-api-client"
import {
  AdminCard,
  AdminPageFrame,
  AdminPageHeader,
  AdminSelect,
  AdminTable,
  AdminTableShell,
  AdminToolbar,
} from "@/components/classz-admin-ui"

type Order = {
  id: number
  total?: number
  payment_status?: string
  payment_method?: string
  created_at?: string
  user_id?: number
  order_id?: string
}

export function PaymentsManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const [filter, setFilter] = useState<"all" | "paid" | "outstanding">("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (demo) {
      setOrders([])
      setError(zh ? "請用中心帳號登入以載入真實數據" : "Sign in with a centre account for live data")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const ords = await apiGet<Order[]>("/orders")
      setOrders(Array.isArray(ords) ? ords : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [demo, zh])

  useEffect(() => {
    load()
  }, [load])

  const list = useMemo(() => {
    if (filter === "paid") {
      return orders.filter((o) => String(o.payment_status || "").toLowerCase() === "paid")
    }
    if (filter === "outstanding") {
      return orders.filter((o) => !["paid", "refunded"].includes(String(o.payment_status || "").toLowerCase()))
    }
    return orders
  }, [orders, filter])

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "付款記錄" : "Payment records"}
        description={zh ? "中心訂單與付款狀態" : "Centre orders and payment status"}
        Icon={Receipt}
      />

      {error ? (
        <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      ) : null}

      <AdminToolbar>
        <AdminSelect
          className="max-w-[12rem]"
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <option value="all">{zh ? "全部" : "All"}</option>
          <option value="paid">{zh ? "已付款" : "Paid"}</option>
          <option value="outstanding">{zh ? "未付款" : "Outstanding"}</option>
        </AdminSelect>
      </AdminToolbar>

      <AdminCard>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 rounded-full border-2 border-classz-100 border-t-classz-400 animate-spin" />
          </div>
        ) : (
          <AdminTableShell>
            <AdminTable>
              <thead className="bg-classz-50 text-classz-600">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">{zh ? "訂單編號" : "Order"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "金額" : "Amount"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "狀態" : "Status"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "付款方式" : "Method"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "日期" : "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {list.map((o) => (
                  <tr key={o.id}>
                    <td className="px-3 py-2">{o.id}</td>
                    <td className="px-3 py-2 font-mono text-xs">{o.order_id || "—"}</td>
                    <td className="px-3 py-2">HK${Number(o.total || 0).toLocaleString()}</td>
                    <td className="px-3 py-2">{o.payment_status || "—"}</td>
                    <td className="px-3 py-2">{o.payment_method || "—"}</td>
                    <td className="px-3 py-2 text-sm text-classz-600">
                      {o.created_at ? new Date(o.created_at).toLocaleString(zh ? "zh-HK" : "en-HK") : "—"}
                    </td>
                  </tr>
                ))}
                {!list.length ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-classz-500">
                      {zh ? "無付款記錄" : "No payment records"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </AdminTable>
          </AdminTableShell>
        )}
      </AdminCard>
    </AdminPageFrame>
  )
}
