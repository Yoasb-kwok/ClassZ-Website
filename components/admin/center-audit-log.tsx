"use client"

import { useCallback, useEffect, useState } from "react"
import { FileText } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiSend, ClasszApiError } from "@/lib/classz-api-client"
import {
  centerAuditLogPath,
  filterAuditRowsByDate,
  parseCenterAuditLog,
  type CenterAuditRow,
} from "@/lib/center-audit-log"
import {
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminPageFrame,
  AdminPageHeader,
  AdminTable,
  AdminTableShell,
  AdminToolbar,
} from "@/components/classz-admin-ui"

export function CenterAuditLog() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const [rows, setRows] = useState<CenterAuditRow[]>([])
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (demo) {
      setRows([])
      setError(zh ? "請用中心帳號登入以載入審計日誌" : "Sign in with a centre account to load the audit log")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await apiSend<unknown>("GET", centerAuditLogPath(from, to), undefined, "center_admin")
      if (!result.ok) {
        throw new ClasszApiError(result.message, result.status, result.payload)
      }
      setRows(filterAuditRowsByDate(parseCenterAuditLog(result.payload), from, to))
    } catch (e) {
      setRows([])
      setError(e instanceof Error ? e.message : "Load failed")
    } finally {
      setLoading(false)
    }
  }, [demo, from, to, zh])

  useEffect(() => {
    load()
  }, [load])

  const visible = rows.slice(0, 100)

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "審計日誌" : "Audit log"}
        description={
          zh
            ? "此中心最近的排程變更，來自中心審計紀錄。"
            : "Recent scheduling changes for this centre, from the centre audit log."
        }
        Icon={FileText}
      />
      {error ? (
        <div
          role="alert"
          className="text-sm text-brand-coral bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] rounded-lg px-3 py-2"
        >
          {error}
        </div>
      ) : null}
      <AdminCard>
        <AdminToolbar>
          <div>
            <AdminLabel>{zh ? "由" : "From"}</AdminLabel>
            <AdminInput
              data-testid="audit-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <AdminLabel>{zh ? "至" : "To"}</AdminLabel>
            <AdminInput data-testid="audit-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </AdminToolbar>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 rounded-full border-2 border-classz-100 border-t-classz-400 animate-spin" />
          </div>
        ) : (
          <AdminTableShell>
            <AdminTable>
              <thead className="bg-classz-50 text-classz-600">
                <tr>
                  <th className="px-3 py-2 text-left">{zh ? "時間" : "Time"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "操作者" : "Actor"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "動作" : "Action"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "對象" : "Target"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "詳情" : "Details"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {visible.map((row) => (
                  <tr key={row.id} data-testid="audit-row">
                    <td className="px-3 py-2 text-sm text-classz-600 whitespace-nowrap">
                      {row.at
                        ? new Date(row.at.includes("T") ? row.at : row.at.replace(" ", "T")).toLocaleString(
                            zh ? "zh-HK" : "en-HK"
                          )
                        : "—"}
                    </td>
                    <td className="px-3 py-2">{row.actor || "—"}</td>
                    <td className="px-3 py-2">{row.action || "—"}</td>
                    <td className="px-3 py-2">{row.target || "—"}</td>
                    <td className="px-3 py-2 max-w-md truncate">{row.details || "—"}</td>
                  </tr>
                ))}
                {!visible.length ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-classz-500" data-testid="audit-empty">
                      {zh ? "此日期沒有審計紀錄" : "No audit entries in this range"}
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
