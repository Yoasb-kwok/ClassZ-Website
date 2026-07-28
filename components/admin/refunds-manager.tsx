"use client"

import { useCallback, useEffect, useState } from "react"
import { Undo2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet, apiPost } from "@/lib/classz-api-client"
import {
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminTable,
  AdminTableShell,
} from "@/components/classz-admin-ui"

type RefundRow = {
  id: number
  amount?: number
  reason?: string
  created_at?: string
  enrollment_id?: number
}

export function RefundsManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const [refunds, setRefunds] = useState<RefundRow[]>([])
  const [form, setForm] = useState({ amount: "", reason: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (demo) {
      setRefunds([])
      setError(zh ? "請用中心帳號登入以載入真實數據" : "Sign in with a centre account for live data")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const rows = await apiGet<RefundRow[]>("/refund-records")
      setRefunds(Array.isArray(rows) ? rows : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
      setRefunds([])
    } finally {
      setLoading(false)
    }
  }, [demo, zh])

  useEffect(() => {
    load()
  }, [load])

  async function addRefund() {
    if (!form.amount) return
    try {
      await apiPost("/refund-records", {
        amount: Number(form.amount),
        reason: form.reason,
      })
      setForm({ amount: "", reason: "" })
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "退款記錄" : "Refund records"}
        description={zh ? "查詢與新增退款紀錄" : "View and record refunds"}
        Icon={Undo2}
      />

      {error ? (
        <div role="alert" className="text-sm text-brand-coral bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] rounded-lg px-3 py-2">
          {error}
        </div>
      ) : null}

      <AdminCard>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <AdminLabel>{zh ? "金額" : "Amount"}</AdminLabel>
            <AdminInput
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <AdminLabel>{zh ? "原因" : "Reason"}</AdminLabel>
            <AdminInput
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder={zh ? "退款原因" : "Reason"}
            />
          </div>
          <div className="flex items-end">
            <AdminPrimaryButton type="button" onClick={addRefund} disabled={demo || !form.amount}>
              {zh ? "記錄退款" : "Record refund"}
            </AdminPrimaryButton>
          </div>
        </div>

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
                  <th className="px-3 py-2 text-left">{zh ? "金額" : "Amount"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "原因" : "Reason"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "日期" : "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {refunds.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2 font-medium text-brand-coral">HK${Number(r.amount || 0).toLocaleString()}</td>
                    <td className="px-3 py-2">{r.reason || "—"}</td>
                    <td className="px-3 py-2 text-sm text-classz-600">
                      {r.created_at ? new Date(r.created_at).toLocaleString(zh ? "zh-HK" : "en-HK") : "—"}
                    </td>
                  </tr>
                ))}
                {!refunds.length ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-classz-500">
                      {zh ? "無退款記錄" : "No refund records"}
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
