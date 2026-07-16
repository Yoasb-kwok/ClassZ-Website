"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle, LibraryBig } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { apiGet, apiPatch } from "@/lib/classz-api-client"
import {
  AdminCard,
  AdminGhostButton,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminTable,
  AdminTableShell,
} from "@/components/classz-admin-ui"

type ApprovalCourse = {
  id: number
  name: string
  center_name?: string
  center_id?: number
  publish_status?: string
  program_code?: string
}

export function CourseApprovalsManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const [rows, setRows] = useState<ApprovalCourse[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<ApprovalCourse[]>("/courses/approval-queue", "platform_admin")
      setRows(Array.isArray(data) ? data : [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function decide(id: number, publish_status: "published" | "rejected") {
    try {
      await apiPatch(`/courses/${id}/publish-status`, { publish_status }, "platform_admin")
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader title={zh ? "課程上架審批" : "Course approvals"} Icon={LibraryBig} />
      <AdminCard>
        <AdminTableShell>
          <AdminTable>
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-3 text-left">ID</th>
                <th className="px-3 py-3 text-left">{zh ? "課程" : "Course"}</th>
                <th className="px-3 py-3 text-left">{zh ? "中心" : "Centre"}</th>
                <th className="px-3 py-3 text-left">{zh ? "狀態" : "Status"}</th>
                <th className="px-3 py-3 text-right">{zh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-classz-600">
                    {zh ? "暫無待審批課程" : "No courses pending approval"}
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="bg-white">
                    <td className="px-3 py-2">{c.id}</td>
                    <td className="px-3 py-2 font-medium">{c.name}</td>
                    <td className="px-3 py-2 text-sm">{c.center_name || c.center_id}</td>
                    <td className="px-3 py-2 text-sm">{c.publish_status}</td>
                    <td className="px-3 py-2 text-right space-x-1">
                      <AdminPrimaryButton type="button" className="inline-flex text-sm py-1 px-2" onClick={() => decide(c.id, "published")}>
                        <CheckCircle className="h-4 w-4" />
                        {zh ? "批准上架" : "Publish"}
                      </AdminPrimaryButton>
                      <AdminGhostButton type="button" className="inline-flex text-sm py-1 px-2" onClick={() => decide(c.id, "rejected")}>
                        {zh ? "拒絕" : "Reject"}
                      </AdminGhostButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </AdminTable>
        </AdminTableShell>
      </AdminCard>
    </AdminPageFrame>
  )
}
