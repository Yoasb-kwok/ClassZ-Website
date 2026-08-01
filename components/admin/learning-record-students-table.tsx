"use client"

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, ClipboardList, Download, Eye, FileText, Plus, Trash2, Upload, UserPlus } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiDelete, apiGet, apiPost } from "@/lib/classz-api-client"
import {
  formatRecordSummary,
  progressLevelLabel,
  type ActivityLearningRecordRow,
} from "@/lib/activity-learning-record"
import type { LearningCompanionReport } from "@/lib/learning-companion-report"
import { exportLearningCompanionPdf } from "@/lib/learning-companion-pdf"
import { LearningCompanionReportView } from "@/components/admin/learning-companion-report-view"
import {
  AdminCard,
  AdminGhostButton,
  AdminInput,
  AdminLabel,
  AdminModal,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminStatusChip,
  AdminTable,
  AdminTableShell,
} from "@/components/classz-admin-ui"

export type LearningRecordStudent = {
  profile_id: number
  child_name: string
  sex?: number | null
  grade?: string | null
  parent_name: string
  contact_number: string
  parent_email: string
  record_count: number
  report_count?: number
  enrollments: Array<{
    enrollment_id: number
    class_id: number
    class_name: string
    class_start_time?: string | null
    program_code?: string | null
  }>
}

type ClassOption = {
  id: number
  name: string
  start_time?: string | null
}

type AddForm = {
  parent_name: string
  contact_number: string
  child_name: string
  grade: string
  sex: string
  age: string
  class_id: string
}

const emptyAddForm = (): AddForm => ({
  parent_name: "",
  contact_number: "",
  child_name: "",
  grade: "",
  sex: "",
  age: "",
  class_id: "",
})

type ImportStudentRow = {
  parent_name: string
  contact_number: string
  child_name: string
  age?: string | null
  grade?: string | null
  sex?: number | string | null
}

type ImportResult = {
  imported: number
  failed: number
  errors: Array<{ row: number; child_name?: string; msg?: string }>
}

const SAMPLE_CSV_TEMPLATE =
  "Parent_name,Contact_number,Child_name,Age,Grade,Sex\nJane Doe,91234567,Alex,8,P3,Male\nJohn Smith,98765432,Emily,7,P2,Female"

const CSV_HEADER_KEYS: Record<string, keyof ImportStudentRow> = {
  parent_name: "parent_name",
  contact_number: "contact_number",
  child_name: "child_name",
  age: "age",
  grade: "grade",
  sex: "sex",
}
const MIN_RECORDS_FOR_REPORT = 3
type ReportLanguage = "en" | "zh"

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    const next = text[i + 1]
    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"'
        i++
      } else if (c === '"') {
        inQuotes = false
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n" || (c === "\r" && next === "\n")) {
      row.push(field)
      field = ""
      if (row.some((cell) => cell.trim() !== "")) rows.push(row)
      row = []
      if (c === "\r") i++
    } else if (c !== "\r") {
      field += c
    }
  }
  row.push(field)
  if (row.some((cell) => cell.trim() !== "")) rows.push(row)
  return rows
}

function normalizeCsvHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "_")
}

function mapSexValue(raw: string): number | string | null {
  const s = raw.trim()
  if (!s) return null
  const lower = s.toLowerCase()
  if (lower === "male" || lower === "m" || lower === "男") return 1
  if (lower === "female" || lower === "f" || lower === "女") return 0
  if (s === "0" || s === "1") return Number(s)
  return s
}

function parseImportStudents(csvText: string): ImportStudentRow[] {
  const grid = parseCsvRows(csvText)
  if (grid.length < 2) return []
  const headerMap = grid[0].map((h) => CSV_HEADER_KEYS[normalizeCsvHeader(h)] || null)
  const students: ImportStudentRow[] = []
  for (let r = 1; r < grid.length; r++) {
    const cells = grid[r]
    const row: Partial<ImportStudentRow> = {}
    for (let c = 0; c < headerMap.length; c++) {
      const key = headerMap[c]
      if (!key) continue
      const val = (cells[c] ?? "").trim()
      if (key === "sex") row.sex = mapSexValue(val)
      else if (key === "age") row.age = val || null
      else if (key === "grade") row.grade = val || null
      else row[key] = val
    }
    if (!row.parent_name?.trim() || !row.contact_number?.trim() || !row.child_name?.trim()) continue
    students.push({
      parent_name: row.parent_name.trim(),
      contact_number: row.contact_number.trim(),
      child_name: row.child_name.trim(),
      grade: row.grade ?? null,
      age: row.age ?? null,
      sex: row.sex ?? null,
    })
  }
  return students
}

function downloadSampleCsvTemplate() {
  const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "learning-record-students-template.csv"
  a.click()
  URL.revokeObjectURL(url)
}

function sexLabel(sex: number | null | undefined, zh: boolean) {
  if (sex === 0) return zh ? "女" : "F"
  if (sex === 1) return zh ? "男" : "M"
  return "—"
}

export function LearningRecordStudentsTable({
  mode,
}: {
  /** teacher = read + fill button; admin = expand history + add student */
  mode: "teacher" | "admin"
}) {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const [rows, setRows] = useState<LearningRecordStudent[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [history, setHistory] = useState<Record<number, ActivityLearningRecordRow[]>>({})
  const [historyLoading, setHistoryLoading] = useState<number | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState<AddForm>(emptyAddForm)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importClassId, setImportClassId] = useState("")
  const [importRows, setImportRows] = useState<ImportStudentRow[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const [importSaving, setImportSaving] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [deletingProfileId, setDeletingProfileId] = useState<number | null>(null)
  const [reportLanguageByProfile, setReportLanguageByProfile] = useState<Record<number, ReportLanguage>>({})
  const [reportOpen, setReportOpen] = useState(false)
  const [activeReport, setActiveReport] = useState<LearningCompanionReport | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)
  const [savedReports, setSavedReports] = useState<Record<number, LearningCompanionReport[]>>({})

  const load = useCallback(async () => {
    if (demo) {
      setRows([])
      setError(zh ? "請用 ClassZ Centre 帳號登入以載入真實資料" : "Sign in with a ClassZ Centre account for live data")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<LearningRecordStudent[]>("/learning-record-students")
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [demo, zh])

  useEffect(() => {
    load()
  }, [load])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => {
      const sessionNames = row.enrollments.map((e) => e.class_name || "").join(" ")
      const haystack = [
        row.child_name,
        row.parent_name,
        row.contact_number,
        row.parent_email,
        row.grade,
        sessionNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [rows, search])

  async function loadClassOptions(): Promise<ClassOption[]> {
    try {
      const data = await apiGet<Record<string, unknown>[]>("/classes")
      return (Array.isArray(data) ? data : [])
        .map((c) => ({
          id: Number(c.id),
          name: String(c.name || ""),
          start_time: (c.start_time as string) || null,
        }))
        .filter((c) => Number.isFinite(c.id) && c.id > 0)
        .sort((a, b) => String(b.start_time || "").localeCompare(String(a.start_time || "")))
    } catch {
      return []
    }
  }

  async function openAddModal() {
    setAddError(null)
    setAddForm(emptyAddForm())
    setAddOpen(true)
    const list = await loadClassOptions()
    setClasses(list)
    if (list.length === 1) {
      setAddForm((f) => ({ ...f, class_id: String(list[0].id) }))
    }
  }

  async function openImportModal(rows: ImportStudentRow[]) {
    setImportError(null)
    setImportResult(null)
    setImportRows(rows)
    setImportClassId("")
    setImportOpen(true)
    const list = await loadClassOptions()
    setClasses(list)
    if (list.length === 1) {
      setImportClassId(String(list[0].id))
    }
  }

  function handleCsvFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || "")
      const parsed = parseImportStudents(text)
      if (!parsed.length) {
        setImportError(zh ? "CSV 無有效資料列（需 Parent_name、Contact_number、Child_name）" : "No valid rows (need Parent_name, Contact_number, Child_name)")
        setImportOpen(true)
        setImportRows([])
        setImportResult(null)
        return
      }
      void openImportModal(parsed)
    }
    reader.onerror = () => {
      setImportError(zh ? "無法讀取檔案" : "Could not read file")
      setImportOpen(true)
    }
    reader.readAsText(file)
  }

  async function submitImport() {
    if (demo) {
      setImportError(zh ? "請用中心帳號登入" : "Sign in as centre admin")
      return
    }
    if (!importClassId) {
      setImportError(zh ? "請選擇課堂／體驗日場次" : "Please select a class / open-day session")
      return
    }
    if (!importRows.length) {
      setImportError(zh ? "沒有可匯入的資料列" : "No rows to import")
      return
    }
    setImportSaving(true)
    setImportError(null)
    try {
      const resp = await apiPost<{ imported?: number; failed?: number; errors?: ImportResult["errors"] }>(
        "/learning-record-students/import",
        {
          class_id: Number(importClassId),
          students: importRows.map((s) => ({
            parent_name: s.parent_name,
            contact_number: s.contact_number,
            child_name: s.child_name,
            grade: s.grade || null,
            sex: s.sex ?? null,
            age: s.age || null,
          })),
        },
      )
      const result: ImportResult = {
        imported: Number(resp?.imported ?? 0),
        failed: Number(resp?.failed ?? 0),
        errors: Array.isArray(resp?.errors) ? resp.errors : [],
      }
      setImportResult(result)
      if (result.imported > 0) {
        await load()
      }
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Import failed")
    } finally {
      setImportSaving(false)
    }
  }

  async function submitAdd() {
    if (demo) {
      setAddError(zh ? "請用中心帳號登入" : "Sign in as centre admin")
      return
    }
    if (!addForm.parent_name.trim() || !addForm.child_name.trim() || !addForm.contact_number.trim()) {
      setAddError(zh ? "請填寫家長、學生姓名及電話" : "Parent, child name and phone are required")
      return
    }
    if (!addForm.class_id) {
      setAddError(zh ? "請選擇課堂／體驗日場次" : "Please select a class / open-day session")
      return
    }
    setSaving(true)
    setAddError(null)
    try {
      await apiPost("/learning-record-students", {
        parent_name: addForm.parent_name.trim(),
        contact_number: addForm.contact_number.trim(),
        child_name: addForm.child_name.trim(),
        grade: addForm.grade.trim() || null,
        sex: addForm.sex === "" ? null : Number(addForm.sex),
        age: addForm.age.trim() || null,
        class_id: Number(addForm.class_id),
      })
      setAddOpen(false)
      setAddForm(emptyAddForm())
      await load()
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  function preferredReportLanguage(profileId: number): ReportLanguage {
    return reportLanguageByProfile[profileId] || (zh ? "zh" : "en")
  }

  async function generateReport(profileId: number, language: ReportLanguage, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (demo) return
    setGeneratingId(profileId)
    setReportError(null)
    try {
      const data = await apiPost<LearningCompanionReport>(
        `/learning-record-students/${profileId}/generate-report`,
        { report_language: language },
      )
      setActiveReport(data)
      setReportOpen(true)
      setSavedReports((prev) => ({
        ...prev,
        [profileId]: [data, ...(prev[profileId] || [])],
      }))
      await load()
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Generate failed")
      setReportOpen(true)
      setActiveReport(null)
    } finally {
      setGeneratingId(null)
    }
  }

  async function viewLatestReport(profileId: number, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (demo) return
    setReportError(null)
    try {
      let list = savedReports[profileId]
      if (!list) {
        list = await apiGet<LearningCompanionReport[]>(
          `/learning-record-students/${profileId}/reports`,
        )
        list = Array.isArray(list) ? list : []
        setSavedReports((prev) => ({ ...prev, [profileId]: list! }))
      }
      if (!list.length) {
        setReportError(zh ? "尚未產生報告，請先按「產生報告」" : "No report yet — generate one first")
        setActiveReport(null)
        setReportOpen(true)
        return
      }
      setActiveReport(list[0])
      setReportOpen(true)
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Load failed")
      setActiveReport(null)
      setReportOpen(true)
    }
  }

  async function deleteLatestReport(profileId: number, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (demo) return
    const ok = window.confirm(zh ? "確定要刪除最新一份已產生報告？" : "Delete the latest generated report?")
    if (!ok) return

    setDeletingProfileId(profileId)
    setReportError(null)
    try {
      let list = savedReports[profileId]
      if (!list) {
        list = await apiGet<LearningCompanionReport[]>(`/learning-record-students/${profileId}/reports`)
        list = Array.isArray(list) ? list : []
      }
      const latest = list[0]
      if (!latest?.id) {
        setReportError(zh ? "尚未有可刪除的報告" : "No report to delete")
        setActiveReport(null)
        setReportOpen(true)
        return
      }

      await apiDelete(`/learning-companion-reports/${latest.id}`)
      const nextList = list.filter((item) => item.id !== latest.id)
      setSavedReports((prev) => ({ ...prev, [profileId]: nextList }))
      await load()

      if (activeReport?.id === latest.id) {
        setActiveReport(nextList[0] || null)
        setReportOpen(Boolean(nextList[0]))
      }
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Delete failed")
      setReportOpen(true)
    } finally {
      setDeletingProfileId(null)
    }
  }

  async function exportPdfForProfile(profileId: number, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (demo) return
    setReportError(null)
    try {
      let report = activeReport?.profile_id === profileId ? activeReport : null
      if (!report) {
        let list = savedReports[profileId]
        if (!list) {
          list = await apiGet<LearningCompanionReport[]>(
            `/learning-record-students/${profileId}/reports`,
          )
          list = Array.isArray(list) ? list : []
          setSavedReports((prev) => ({ ...prev, [profileId]: list! }))
        }
        report = list[0] || null
      }
      if (!report) {
        setReportError(zh ? "尚未產生報告，無法輸出 PDF" : "No report to export — generate one first")
        setActiveReport(null)
        setReportOpen(true)
        return
      }
      exportLearningCompanionPdf(report)
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "PDF export failed")
      setReportOpen(true)
    }
  }

  function exportActivePdf() {
    if (!activeReport) return
    try {
      exportLearningCompanionPdf(activeReport)
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "PDF export failed")
    }
  }

  async function toggleExpand(profileId: number) {
    if (expanded === profileId) {
      setExpanded(null)
      return
    }
    setExpanded(profileId)
    if (history[profileId]) return
    setHistoryLoading(profileId)
    try {
      const data = await apiGet<ActivityLearningRecordRow[]>(
        `/activity-learning-records?profile_id=${encodeURIComponent(String(profileId))}`,
      )
      setHistory((h) => ({ ...h, [profileId]: Array.isArray(data) ? data : [] }))
    } catch {
      setHistory((h) => ({ ...h, [profileId]: [] }))
    } finally {
      setHistoryLoading(null)
    }
  }

  return (
    <AdminPageFrame>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <AdminPageHeader
          title={zh ? "Learning Record" : "Learning Record"}
          description={
            mode === "teacher"
              ? zh
                ? "已登記學員（唯讀）— 點擊填寫該學生的 Academic Learning Record"
                : "Enrolled students (read-only) — fill Academic Learning Record per student"
              : zh
                ? "已登記學生及家長資料；點擊列展開過往 Learning Record。正式上線後會同步就讀課程學員；目前可手動新增以支援資訊日／體驗日測試。"
                : "Registered students & parents — expand a row for past records. Production will sync enrolled students; for now you can add manually for Open Day testing."
          }
          Icon={ClipboardList}
        />
        {mode === "admin" ? (
          <div className="flex w-full sm:w-auto flex-wrap items-center gap-2 shrink-0">
            <AdminPrimaryButton type="button" onClick={openAddModal} disabled={demo} className="w-full sm:w-auto justify-center">
              <UserPlus className="h-4 w-4" />
              {zh ? "新增學生" : "Add student"}
            </AdminPrimaryButton>
            <AdminGhostButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={demo}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5"
            >
              <Upload className="h-4 w-4" />
              {zh ? "匯入 CSV" : "Import CSV"}
            </AdminGhostButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleCsvFileSelect}
            />
          </div>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="text-sm text-brand-coral bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] rounded-lg px-3 py-2"
        >
          {error}
        </div>
      ) : null}

      <AdminCard>
        <div className="mb-4">
          <AdminLabel>{zh ? "搜尋學生 / 家長 / 電話 / 場次" : "Search student / parent / phone / session"}</AdminLabel>
          <AdminInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              zh
                ? "輸入電話號碼、學生姓名、家長名稱、家長電郵或場次"
                : "Search by phone, child name, parent name, parent email, or session"
            }
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-classz-100 border-t-classz-400 animate-spin" />
          </div>
        ) : (
          <AdminTableShell>
            <AdminTable className="min-w-[72rem]">
              <thead className="bg-classz-50 text-classz-600">
                <tr>
                  {mode === "admin" ? <th className="px-2 py-2 w-8" /> : null}
                  <th className="px-3 py-2 text-left">{zh ? "學生" : "Child"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "年級" : "Grade"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "家長" : "Parent"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "電話" : "Phone"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "課堂" : "Session"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "紀錄數" : "Records"}</th>
                  {mode === "teacher" ? (
                    <th className="px-3 py-2 text-right">{zh ? "操作" : "Action"}</th>
                  ) : (
                    <th className="px-3 py-2 text-right">{zh ? "報告" : "Report"}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {filteredRows.map((r) => {
                  const open = expanded === r.profile_id
                  const primary = r.enrollments[0]
                  return (
                    <Fragment key={r.profile_id}>
                      <tr
                        className={mode === "admin" ? "cursor-pointer hover:bg-classz-50/80" : "bg-white"}
                        onClick={mode === "admin" ? () => toggleExpand(r.profile_id) : undefined}
                      >
                        {mode === "admin" ? (
                          <td className="px-2 py-2 text-brand-slate/50">
                            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </td>
                        ) : null}
                        <td className="px-3 py-2 font-medium text-brand-slate">
                          {r.child_name}
                          <span className="ml-1 text-xs text-brand-slate/50">{sexLabel(r.sex, zh)}</span>
                        </td>
                        <td className="px-3 py-2 text-sm">{r.grade || "—"}</td>
                        <td className="px-3 py-2 text-sm">
                          <div>{r.parent_name || "—"}</div>
                          {r.parent_email ? (
                            <div className="text-[11px] text-brand-slate/50 truncate max-w-[12rem]">{r.parent_email}</div>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 text-sm font-mono">{r.contact_number || "—"}</td>
                        <td className="px-3 py-2 text-sm max-w-[14rem] truncate" title={primary?.class_name}>
                          {primary?.class_name || "—"}
                        </td>
                        <td className="px-3 py-2">
                          <AdminStatusChip
                            tone={r.record_count >= MIN_RECORDS_FOR_REPORT ? "teal" : r.record_count > 0 ? "orange" : "magenta"}
                          >
                            {r.record_count}/{MIN_RECORDS_FOR_REPORT}+
                          </AdminStatusChip>
                        </td>
                        {mode === "teacher" ? (
                          <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/admin/teacher-students/${r.profile_id}`}>
                              <AdminPrimaryButton type="button" className="text-sm py-1.5 px-3 inline-flex">
                                <Plus className="h-3.5 w-3.5" />
                                {zh ? "填寫紀錄" : "Fill record"}
                              </AdminPrimaryButton>
                            </Link>
                          </td>
                        ) : (
                          <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex min-w-[14rem] flex-wrap justify-end gap-1.5">
                              {r.record_count >= MIN_RECORDS_FOR_REPORT ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <div className="inline-flex items-center rounded-lg border border-classz-200 bg-white p-0.5">
                                    <button
                                      type="button"
                                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                        preferredReportLanguage(r.profile_id) === "en"
                                          ? "bg-brand-teal text-white"
                                          : "text-brand-slate hover:bg-classz-50"
                                      }`}
                                      disabled={generatingId === r.profile_id || demo}
                                      onClick={() =>
                                        setReportLanguageByProfile((prev) => ({
                                          ...prev,
                                          [r.profile_id]: "en",
                                        }))
                                      }
                                      title={zh ? "切換為英文報告" : "Switch to English report"}
                                    >
                                      EN
                                    </button>
                                    <button
                                      type="button"
                                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                        preferredReportLanguage(r.profile_id) === "zh"
                                          ? "bg-brand-teal text-white"
                                          : "text-brand-slate hover:bg-classz-50"
                                      }`}
                                      disabled={generatingId === r.profile_id || demo}
                                      onClick={() =>
                                        setReportLanguageByProfile((prev) => ({
                                          ...prev,
                                          [r.profile_id]: "zh",
                                        }))
                                      }
                                      title={zh ? "切換為中文報告" : "Switch to Chinese report"}
                                    >
                                      中文
                                    </button>
                                  </div>
                                  <AdminPrimaryButton
                                    type="button"
                                    className="text-sm py-1.5 px-3 inline-flex"
                                    disabled={generatingId === r.profile_id || demo}
                                    onClick={(e) => generateReport(r.profile_id, preferredReportLanguage(r.profile_id), e)}
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    {generatingId === r.profile_id
                                      ? zh
                                        ? "產生中…"
                                        : "Generating…"
                                      : zh
                                        ? "產生報告"
                                        : "Generate report"}
                                  </AdminPrimaryButton>
                                </div>
                              ) : (
                                <span className="text-[11px] text-brand-slate/45 self-center">
                                  {zh
                                    ? `需 ${MIN_RECORDS_FOR_REPORT - r.record_count} 次紀錄`
                                    : `Need ${MIN_RECORDS_FOR_REPORT - r.record_count} more`}
                                </span>
                              )}
                              {(Number(r.report_count) || 0) > 0 ? (
                                <AdminGhostButton
                                  type="button"
                                  className="text-sm py-1.5 px-2 inline-flex items-center gap-1"
                                  disabled={demo}
                                  onClick={(e) => viewLatestReport(r.profile_id, e)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  {zh ? "查看報告" : "Check report"}
                                </AdminGhostButton>
                              ) : null}
                              {(Number(r.report_count) || 0) > 0 ? (
                                <AdminGhostButton
                                  type="button"
                                  className="text-sm py-1.5 px-2 inline-flex items-center gap-1"
                                  disabled={demo}
                                  onClick={(e) => exportPdfForProfile(r.profile_id, e)}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  PDF
                                </AdminGhostButton>
                              ) : null}
                              {(Number(r.report_count) || 0) > 0 ? (
                                <AdminGhostButton
                                  type="button"
                                  className="text-sm py-1.5 px-2 inline-flex items-center gap-1 text-brand-coral border-brand-coral/30 hover:bg-brand-coral/10"
                                  disabled={demo || deletingProfileId === r.profile_id}
                                  onClick={(e) => deleteLatestReport(r.profile_id, e)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {deletingProfileId === r.profile_id
                                    ? zh
                                      ? "刪除中…"
                                      : "Deleting…"
                                    : zh
                                      ? "刪除報告"
                                      : "Delete report"}
                                </AdminGhostButton>
                              ) : null}
                            </div>
                          </td>
                        )}
                      </tr>
                      {mode === "admin" && open ? (
                        <tr className="bg-[var(--admin-canvas)]">
                          <td colSpan={8} className="px-4 py-3">
                            {historyLoading === r.profile_id ? (
                              <p className="text-sm text-brand-slate/60">{zh ? "載入中…" : "Loading…"}</p>
                            ) : !(history[r.profile_id] || []).length ? (
                              <p className="text-sm text-brand-slate/55">
                                {zh
                                  ? `尚未有 Learning Record（目標至少 ${MIN_RECORDS_FOR_REPORT} 次）`
                                  : `No learning records yet (target ≥ ${MIN_RECORDS_FOR_REPORT})`}
                              </p>
                            ) : (
                              <ul className="space-y-2">
                                {(history[r.profile_id] || []).map((rec) => (
                                  <li
                                    key={rec.id}
                                    className="rounded-lg border border-classz-100 bg-white px-3 py-2 text-sm"
                                  >
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="font-semibold text-brand-slate">
                                        #{rec.id} · {rec.class_name || `class ${rec.class_id}`}
                                      </span>
                                      <AdminStatusChip tone={rec.is_confirmed ? "teal" : "orange"}>
                                        {rec.is_confirmed ? (zh ? "已確認" : "Confirmed") : zh ? "草稿" : "Draft"}
                                      </AdminStatusChip>
                                      <span className="text-xs text-brand-slate/50">
                                        {rec.created_at
                                          ? new Date(rec.created_at).toLocaleString(zh ? "zh-HK" : "en-HK")
                                          : ""}
                                      </span>
                                      {rec.progress_level ? (
                                        <span className="text-xs text-brand-teal">
                                          {progressLevelLabel(rec.progress_level)}
                                        </span>
                                      ) : null}
                                    </div>
                                    <pre className="text-xs text-brand-slate/80 whitespace-pre-wrap font-sans">
                                      {formatRecordSummary(rec)}
                                    </pre>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}
                {!filteredRows.length ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-brand-slate/50">
                      {search.trim()
                        ? zh
                          ? "找不到符合搜尋的學生"
                          : "No matching students"
                        : zh
                          ? "尚無已登記學員"
                          : "No enrolled students"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </AdminTable>
          </AdminTableShell>
        )}
      </AdminCard>

      {mode === "admin" ? (
        <AdminModal
          open={addOpen}
          title={zh ? "新增學生（資訊日／體驗日）" : "Add student (Open Day)"}
          onClose={() => !saving && setAddOpen(false)}
          footer={
            <>
              <AdminGhostButton type="button" disabled={saving} onClick={() => setAddOpen(false)}>
                {zh ? "取消" : "Cancel"}
              </AdminGhostButton>
              <AdminPrimaryButton type="button" disabled={saving} onClick={submitAdd}>
                {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "新增並登記" : "Add & enrol"}
              </AdminPrimaryButton>
            </>
          }
        >
          <p className="text-xs text-brand-slate/60 mb-3 leading-relaxed">
            {zh
              ? "會建立家長／學員資料並登記到所選課堂，之後導師即可填寫 Learning Record。正式營運時學員會由就讀課程自動同步。"
              : "Creates parent/child records and enrols them into the selected session so teachers can fill Learning Records. In production, enrolled course students will sync automatically."}
          </p>
          {addError ? (
            <p role="alert" className="text-sm text-brand-coral mb-3">
              {addError}
            </p>
          ) : null}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <AdminLabel>{zh ? "家長姓名" : "Parent name"} *</AdminLabel>
                <AdminInput
                  value={addForm.parent_name}
                  onChange={(e) => setAddForm((f) => ({ ...f, parent_name: e.target.value }))}
                />
              </div>
              <div>
                <AdminLabel>{zh ? "聯絡電話" : "Phone"} *</AdminLabel>
                <AdminInput
                  inputMode="tel"
                  value={addForm.contact_number}
                  onChange={(e) => setAddForm((f) => ({ ...f, contact_number: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <AdminLabel>{zh ? "學生姓名" : "Child name"} *</AdminLabel>
                <AdminInput
                  value={addForm.child_name}
                  onChange={(e) => setAddForm((f) => ({ ...f, child_name: e.target.value }))}
                />
              </div>
              <div>
                <AdminLabel>{zh ? "年級" : "Grade"}</AdminLabel>
                <AdminInput
                  placeholder="P1 / K3…"
                  value={addForm.grade}
                  onChange={(e) => setAddForm((f) => ({ ...f, grade: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <AdminLabel>{zh ? "性別" : "Sex"}</AdminLabel>
                <AdminSelect
                  value={addForm.sex}
                  onChange={(e) => setAddForm((f) => ({ ...f, sex: e.target.value }))}
                >
                  <option value="">{zh ? "未指定" : "Unspecified"}</option>
                  <option value="1">{zh ? "男" : "Male"}</option>
                  <option value="0">{zh ? "女" : "Female"}</option>
                </AdminSelect>
              </div>
              <div>
                <AdminLabel>{zh ? "年齡" : "Age"}</AdminLabel>
                <AdminInput
                  inputMode="numeric"
                  value={addForm.age}
                  onChange={(e) => setAddForm((f) => ({ ...f, age: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <AdminLabel>{zh ? "課堂／體驗日場次" : "Class / Open Day session"} *</AdminLabel>
              <AdminSelect
                value={addForm.class_id}
                onChange={(e) => setAddForm((f) => ({ ...f, class_id: e.target.value }))}
              >
                <option value="">{zh ? "請選擇…" : "Select…"}</option>
                {classes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                    {c.start_time ? ` · ${new Date(c.start_time).toLocaleString(zh ? "zh-HK" : "en-HK")}` : ""}
                  </option>
                ))}
              </AdminSelect>
              {!classes.length ? (
                <p className="text-xs text-brand-orange mt-1">
                  {zh
                    ? "此中心尚無課堂。請先到排程建立體驗日場次。"
                    : "No classes yet. Create an Open Day session under Schedule first."}
                </p>
              ) : null}
            </div>
          </div>
        </AdminModal>
      ) : null}

      {mode === "admin" ? (
        <AdminModal
          open={importOpen}
          title={zh ? "匯入學生 CSV" : "Import students (CSV)"}
          onClose={() => !importSaving && setImportOpen(false)}
          size="lg"
          footer={
            importResult ? (
              <AdminGhostButton type="button" onClick={() => setImportOpen(false)}>
                {zh ? "關閉" : "Close"}
              </AdminGhostButton>
            ) : (
              <>
                <AdminGhostButton type="button" disabled={importSaving} onClick={() => setImportOpen(false)}>
                  {zh ? "取消" : "Cancel"}
                </AdminGhostButton>
                <AdminPrimaryButton type="button" disabled={importSaving || !importRows.length} onClick={submitImport}>
                  {importSaving
                    ? zh
                      ? "匯入中…"
                      : "Importing…"
                    : zh
                      ? `匯入 ${importRows.length} 筆`
                      : `Import ${importRows.length} row${importRows.length === 1 ? "" : "s"}`}
                </AdminPrimaryButton>
              </>
            )
          }
        >
          {importResult ? (
            <div className="space-y-3">
              <p className="text-sm text-brand-slate">
                {zh
                  ? `成功 ${importResult.imported} 筆，失敗 ${importResult.failed} 筆`
                  : `${importResult.imported} imported, ${importResult.failed} failed`}
              </p>
              {importResult.errors.length > 0 ? (
                <ul className="text-xs text-brand-coral space-y-1 max-h-40 overflow-y-auto">
                  {importResult.errors.slice(0, 8).map((err, i) => (
                    <li key={i}>
                      {zh ? "第" : "Row "}
                      {err.row}
                      {err.child_name ? ` · ${err.child_name}` : ""}: {err.msg || "—"}
                    </li>
                  ))}
                  {importResult.errors.length > 8 ? (
                    <li className="text-brand-slate/60">
                      {zh
                        ? `…另有 ${importResult.errors.length - 8} 筆錯誤`
                        : `…and ${importResult.errors.length - 8} more errors`}
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>
          ) : (
            <>
              <p className="text-xs text-brand-slate/60 mb-3 leading-relaxed">
                {zh
                  ? "上傳含 Parent_name、Contact_number、Child_name 的 CSV；可選 Age、Grade、Sex（Male/Female）。"
                  : "Upload CSV with Parent_name, Contact_number, Child_name; optional Age, Grade, Sex (Male/Female)."}
                {" "}
                <button
                  type="button"
                  className="text-brand-teal underline underline-offset-2 hover:text-brand-teal/80"
                  onClick={downloadSampleCsvTemplate}
                >
                  {zh ? "下載範本" : "Download template"}
                </button>
              </p>
              {importError ? (
                <p role="alert" className="text-sm text-brand-coral mb-3">
                  {importError}
                </p>
              ) : null}
              <div className="space-y-3">
                <p className="text-sm font-medium text-brand-slate">
                  {zh ? `已解析 ${importRows.length} 筆有效資料` : `${importRows.length} valid row(s) parsed`}
                </p>
                <div>
                  <AdminLabel>{zh ? "課堂／體驗日場次" : "Class / Open Day session"} *</AdminLabel>
                  <AdminSelect value={importClassId} onChange={(e) => setImportClassId(e.target.value)}>
                    <option value="">{zh ? "請選擇…" : "Select…"}</option>
                    {classes.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                        {c.start_time ? ` · ${new Date(c.start_time).toLocaleString(zh ? "zh-HK" : "en-HK")}` : ""}
                      </option>
                    ))}
                  </AdminSelect>
                  {!classes.length ? (
                    <p className="text-xs text-brand-orange mt-1">
                      {zh
                        ? "此中心尚無課堂。請先到排程建立體驗日場次。"
                        : "No classes yet. Create an Open Day session under Schedule first."}
                    </p>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </AdminModal>
      ) : null}

      {mode === "admin" ? (
        <AdminModal
          open={reportOpen}
          title={zh ? "Learning Companion 報告" : "Learning Companion report"}
          onClose={() => setReportOpen(false)}
          size="xl"
          footer={
            <>
              {activeReport ? (
                <AdminPrimaryButton type="button" onClick={exportActivePdf} className="inline-flex items-center gap-1.5">
                  <Download className="h-4 w-4" />
                  {zh ? "輸出 PDF" : "Export PDF"}
                </AdminPrimaryButton>
              ) : null}
              <AdminGhostButton type="button" onClick={() => setReportOpen(false)}>
                {zh ? "關閉" : "Close"}
              </AdminGhostButton>
            </>
          }
        >
          {reportError ? (
            <p role="alert" className="text-sm text-brand-coral mb-3">
              {reportError}
            </p>
          ) : null}
          {activeReport ? <LearningCompanionReportView report={activeReport} zh={zh} /> : null}
          {!activeReport && !reportError ? (
            <p className="text-sm text-brand-slate/55">{zh ? "沒有報告內容" : "No report content"}</p>
          ) : null}
        </AdminModal>
      ) : null}
    </AdminPageFrame>
  )
}
