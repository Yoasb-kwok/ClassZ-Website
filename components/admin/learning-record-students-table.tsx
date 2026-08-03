"use client"

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Pencil,
  Plus,
  Printer,
  Trash2,
  Upload,
  UserPlus,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
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
  date_of_birth?: string | null
  parent_name: string
  contact_number: string
  parent_email: string
  record_count: number
  report_count?: number
  report_coach_user_id?: number | null
  report_coach_name?: string | null
  report_coach_email?: string | null
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

type CoachAccountOption = {
  id: number
  full_name?: string | null
  name?: string | null
  email: string
  instructor_id?: number | null
  isActivated?: number | boolean | null
}

type InstructorOption = {
  id: number
  name: string
  profile_image_url?: string | null
}

/** Companion dropdown options sourced from 導師管理 (instructors with linked coach login). */
type CompanionCoachOption = {
  coach_user_id: number
  instructor_id: number
  label: string
  email: string
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

type SortKey = "child" | "grade" | "parent" | "phone" | "session" | "records" | "coach"
type SortDir = "asc" | "desc"

function compareLocale(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
}

function sortValue(row: LearningRecordStudent, key: SortKey): string | number {
  switch (key) {
    case "child":
      return String(row.child_name || "")
    case "grade":
      return String(row.grade || "")
    case "parent":
      return String(row.parent_name || "")
    case "phone":
      return String(row.contact_number || "").replace(/\D/g, "") || String(row.contact_number || "")
    case "session":
      return String(row.enrollments[0]?.class_name || "")
    case "records":
      return Number(row.record_count) || 0
    case "coach":
      return String(row.report_coach_name || row.report_coach_email || "")
    default:
      return ""
  }
}

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

/** Companion animal seed students (Demo Rabbit / Owl / …). */
function isCompanionAnimalDemoStudent(row: LearningRecordStudent) {
  const name = String(row.child_name || "").trim()
  if (/^Demo\s+(Rabbit|Owl|Dolphin|Turtle|Fox|Bee)$/i.test(name)) return true
  const email = String(row.parent_email || "").trim().toLowerCase()
  if (/^demo\.(rabbit|owl|dolphin|turtle|fox|bee)@classz\.co$/.test(email)) return true
  const parent = String(row.parent_name || "").trim()
  if (/^Parent\s+(Rabbit|Owl|Dolphin|Turtle|Fox|Bee)$/i.test(parent)) return true
  return false
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
  const [sortKey, setSortKey] = useState<SortKey>("child")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [history, setHistory] = useState<Record<number, ActivityLearningRecordRow[]>>({})
  const [historyLoading, setHistoryLoading] = useState<number | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<LearningRecordStudent | null>(null)
  const [addForm, setAddForm] = useState<AddForm>(emptyAddForm)
  const [editForm, setEditForm] = useState<AddForm>(emptyAddForm)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importClassId, setImportClassId] = useState("")
  const [importRows, setImportRows] = useState<ImportStudentRow[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const [importSaving, setImportSaving] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [deletingProfileId, setDeletingProfileId] = useState<number | null>(null)
  const [clearingRecordsProfileId, setClearingRecordsProfileId] = useState<number | null>(null)
  const [removingStudentProfileId, setRemovingStudentProfileId] = useState<number | null>(null)
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null)
  const [assigningProfileId, setAssigningProfileId] = useState<number | null>(null)
  const [reportLanguageByProfile, setReportLanguageByProfile] = useState<Record<number, ReportLanguage>>({})
  const [coachOptions, setCoachOptions] = useState<CompanionCoachOption[]>([])
  const [coachAccounts, setCoachAccounts] = useState<CoachAccountOption[]>([])
  const [reportOpen, setReportOpen] = useState(false)
  const [activeReport, setActiveReport] = useState<LearningCompanionReport | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)
  const [savedReports, setSavedReports] = useState<Record<number, LearningCompanionReport[]>>({})
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkCoachId, setBulkCoachId] = useState("")
  const [bulkReportLanguage, setBulkReportLanguage] = useState<ReportLanguage>(zh ? "zh" : "en")

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
      const [students, instructors, coaches] = await Promise.all([
        apiGet<LearningRecordStudent[]>("/learning-record-students"),
        mode === "admin"
          ? apiGet<InstructorOption[]>("/instructors").catch(() => [] as InstructorOption[])
          : Promise.resolve([] as InstructorOption[]),
        mode === "admin"
          ? apiGet<CoachAccountOption[]>("/coaches?include_inactive=0").catch(() => [] as CoachAccountOption[])
          : Promise.resolve([] as CoachAccountOption[]),
      ])
      const nextRows = Array.isArray(students) ? students : []
      setRows(nextRows)
      const instructorList = Array.isArray(instructors) ? instructors : []
      const coachList = Array.isArray(coaches) ? coaches : []
      setCoachAccounts(coachList)

      const coachByInstructorId = new Map<number, CoachAccountOption>()
      for (const coach of coachList) {
        const iid = coach.instructor_id != null ? Number(coach.instructor_id) : NaN
        if (!Number.isFinite(iid) || iid < 1) continue
        if (!coachByInstructorId.has(iid)) coachByInstructorId.set(iid, coach)
      }

      // Prefer teachers from 導師管理 that have a linked coach login.
      // Fallback: list active coach accounts directly if instructors API is empty/unavailable.
      const fromTeachers: CompanionCoachOption[] = []
      for (const instructor of instructorList) {
        const coach = coachByInstructorId.get(Number(instructor.id))
        if (!coach?.id) continue
        fromTeachers.push({
          coach_user_id: Number(coach.id),
          instructor_id: Number(instructor.id),
          label: String(instructor.name || "").trim() || coach.email,
          email: coach.email,
        })
      }
      fromTeachers.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }))
      if (fromTeachers.length) {
        setCoachOptions(fromTeachers)
      } else {
        const fromCoaches = coachList
          .filter((c) => c?.id && Number(c.isActivated) !== 0)
          .map((c) => ({
            coach_user_id: Number(c.id),
            instructor_id: c.instructor_id != null ? Number(c.instructor_id) : 0,
            label: String(c.full_name || c.name || "").trim() || String(c.email || "").split("@")[0] || c.email,
            email: c.email,
          }))
          .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }))
        setCoachOptions(fromCoaches)
      }
      setSelectedIds((prev) => {
        if (!prev.size) return prev
        const alive = new Set(nextRows.map((r) => r.profile_id))
        const pruned = new Set<number>()
        for (const id of prev) if (alive.has(id)) pruned.add(id)
        return pruned.size === prev.size ? prev : pruned
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
      setRows([])
      setCoachOptions([])
      setCoachAccounts([])
    } finally {
      setLoading(false)
    }
  }, [demo, mode, zh])

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

  const sortedRows = useMemo(() => {
    const list = [...filteredRows]
    const dir = sortDir === "asc" ? 1 : -1
    list.sort((a, b) => {
      const av = sortValue(a, sortKey)
      const bv = sortValue(b, sortKey)
      if (typeof av === "number" && typeof bv === "number") {
        if (av === bv) return compareLocale(a.child_name, b.child_name) * dir
        return (av - bv) * dir
      }
      const cmp = compareLocale(String(av), String(bv))
      if (cmp !== 0) return cmp * dir
      return compareLocale(a.child_name, b.child_name) * dir
    })
    return list
  }, [filteredRows, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
      return
    }
    setSortKey(key)
    setSortDir("asc")
  }

  function SortableTh({
    label,
    column,
    className = "px-3 py-2 text-left",
  }: {
    label: string
    column: SortKey
    className?: string
  }) {
    const active = sortKey === column
    const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown
    return (
      <th className={className}>
        <button
          type="button"
          className={`inline-flex items-center gap-1 font-medium transition-colors ${
            active ? "text-brand-teal" : "text-classz-600 hover:text-brand-slate"
          }`}
          onClick={() => toggleSort(column)}
          aria-label={zh ? `依${label}排序` : `Sort by ${label}`}
        >
          <span>{label}</span>
          <Icon className={`h-3.5 w-3.5 ${active ? "opacity-100" : "opacity-45"}`} />
        </button>
      </th>
    )
  }

  const mainRows = useMemo(
    () => sortedRows.filter((row) => !isCompanionAnimalDemoStudent(row)),
    [sortedRows],
  )
  const demoRows = useMemo(
    () => sortedRows.filter((row) => isCompanionAnimalDemoStudent(row)),
    [sortedRows],
  )

  const selectedRows = useMemo(
    () => sortedRows.filter((row) => selectedIds.has(row.profile_id)),
    [sortedRows, selectedIds],
  )
  const allFilteredSelected =
    mainRows.length > 0 && mainRows.every((row) => selectedIds.has(row.profile_id))
  const someFilteredSelected = mainRows.some((row) => selectedIds.has(row.profile_id))

  function toggleSelectProfile(profileId: number, e?: { stopPropagation?: () => void }) {
    e?.stopPropagation?.()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(profileId)) next.delete(profileId)
      else next.add(profileId)
      return next
    })
  }

  function toggleSelectAllFiltered(e?: { stopPropagation?: () => void }) {
    e?.stopPropagation?.()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        for (const row of mainRows) next.delete(row.profile_id)
      } else {
        for (const row of mainRows) next.add(row.profile_id)
      }
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  function companionOptionsForSelect(currentCoachUserId?: number | null): CompanionCoachOption[] {
    const list = [...coachOptions]
    const ids = new Set(list.map((c) => c.coach_user_id))
    if (currentCoachUserId && !ids.has(currentCoachUserId)) {
      const account = coachAccounts.find((c) => Number(c.id) === Number(currentCoachUserId))
      list.push({
        coach_user_id: Number(currentCoachUserId),
        instructor_id: account?.instructor_id != null ? Number(account.instructor_id) : 0,
        label:
          String(account?.full_name || account?.name || account?.email || `Coach #${currentCoachUserId}`).trim(),
        email: account?.email || "",
      })
    }
    return list
  }

  async function loadClassOptions(): Promise<{ list: ClassOption[]; error: string | null }> {
    try {
      const data = await apiGet<Record<string, unknown>[]>("/classes")
      const list = (Array.isArray(data) ? data : [])
        .map((c) => ({
          id: Number(c.id),
          name: String(c.name || ""),
          start_time: (c.start_time as string) || null,
        }))
        .filter((c) => Number.isFinite(c.id) && c.id > 0)
        .sort((a, b) => String(b.start_time || "").localeCompare(String(a.start_time || "")))
      return { list, error: null }
    } catch (e) {
      return {
        list: [],
        error: e instanceof Error ? e.message : zh ? "無法載入場次" : "Failed to load sessions",
      }
    }
  }

  function ageFromDob(dob?: string | null): string {
    if (!dob) return ""
    const d = new Date(dob)
    if (Number.isNaN(d.getTime())) return ""
    const age = new Date().getFullYear() - d.getFullYear()
    return age > 0 && age < 30 ? String(age) : ""
  }

  async function openAddModal() {
    setAddError(null)
    setAddForm(emptyAddForm())
    setAddOpen(true)
    const { list, error } = await loadClassOptions()
    setClasses(list)
    if (error) setAddError(error)
    if (list.length === 1) {
      setAddForm((f) => ({ ...f, class_id: String(list[0].id) }))
    }
  }

  async function openEditModal(student: LearningRecordStudent, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (demo) return
    setEditError(null)
    setEditingStudent(student)
    const primary = student.enrollments[0]
    setEditForm({
      parent_name: student.parent_name || "",
      contact_number: student.contact_number || "",
      child_name: student.child_name || "",
      grade: student.grade || "",
      sex: student.sex === 0 || student.sex === 1 ? String(student.sex) : "",
      age: ageFromDob(student.date_of_birth),
      class_id: primary?.class_id ? String(primary.class_id) : "",
    })
    setEditOpen(true)
    const { list, error } = await loadClassOptions()
    setClasses(list)
    if (error) setEditError(error)
  }

  async function openImportModal(rows: ImportStudentRow[]) {
    setImportError(null)
    setImportResult(null)
    setImportRows(rows)
    setImportClassId("")
    setImportOpen(true)
    const { list, error } = await loadClassOptions()
    setClasses(list)
    if (error) setImportError(error)
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

  async function submitEdit() {
    if (demo || !editingStudent) {
      setEditError(zh ? "請用中心帳號登入" : "Sign in as centre admin")
      return
    }
    if (!editForm.parent_name.trim() || !editForm.child_name.trim() || !editForm.contact_number.trim()) {
      setEditError(zh ? "請填寫家長、學生姓名及電話" : "Parent, child name and phone are required")
      return
    }
    if (!editForm.class_id) {
      setEditError(zh ? "請選擇課堂／體驗日場次" : "Please select a class / open-day session")
      return
    }
    setSaving(true)
    setEditError(null)
    try {
      await apiPatch(`/learning-record-students/${editingStudent.profile_id}`, {
        parent_name: editForm.parent_name.trim(),
        contact_number: editForm.contact_number.trim(),
        child_name: editForm.child_name.trim(),
        grade: editForm.grade.trim() || null,
        sex: editForm.sex === "" ? null : Number(editForm.sex),
        age: editForm.age.trim() || null,
        class_id: Number(editForm.class_id),
      })
      setEditOpen(false)
      setEditingStudent(null)
      setEditForm(emptyAddForm())
      await load()
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Save failed")
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

  async function assignCompanionCoach(
    profileId: number,
    coachUserId: number | null,
    e?: { stopPropagation?: () => void },
  ) {
    e?.stopPropagation()
    if (demo) return
    setAssigningProfileId(profileId)
    setReportError(null)
    try {
      const assigned = await apiPatch<{
        coach_user_id: number | null
        coach_name?: string | null
        coach_email?: string | null
      }>(`/learning-record-students/${profileId}/report-coach`, {
        coach_user_id: coachUserId,
      })
      setRows((prev) =>
        prev.map((row) =>
          row.profile_id === profileId
            ? {
                ...row,
                report_coach_user_id: assigned?.coach_user_id ?? null,
                report_coach_name: assigned?.coach_name ?? null,
                report_coach_email: assigned?.coach_email ?? null,
              }
            : row,
        ),
      )
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Assign failed")
      setReportOpen(true)
    } finally {
      setAssigningProfileId(null)
    }
  }

  async function bulkAssignCompanion() {
    if (demo || bulkBusy || !selectedRows.length) return
    const coachUserId = bulkCoachId ? Number(bulkCoachId) : null
    const ok = window.confirm(
      zh
        ? `確定為已選 ${selectedRows.length} 位學生${coachUserId ? "指派 Companion 導師" : "取消 Companion 指派"}？`
        : `${coachUserId ? "Assign companion coach to" : "Unassign companion coach for"} ${selectedRows.length} selected student(s)?`,
    )
    if (!ok) return
    setBulkBusy(true)
    setReportError(null)
    const failures: string[] = []
    try {
      for (const row of selectedRows) {
        try {
          const assigned = await apiPatch<{
            coach_user_id: number | null
            coach_name?: string | null
            coach_email?: string | null
          }>(`/learning-record-students/${row.profile_id}/report-coach`, {
            coach_user_id: coachUserId,
          })
          setRows((prev) =>
            prev.map((item) =>
              item.profile_id === row.profile_id
                ? {
                    ...item,
                    report_coach_user_id: assigned?.coach_user_id ?? null,
                    report_coach_name: assigned?.coach_name ?? null,
                    report_coach_email: assigned?.coach_email ?? null,
                  }
                : item,
            ),
          )
        } catch (err) {
          failures.push(`${row.child_name}: ${err instanceof Error ? err.message : "failed"}`)
        }
      }
      if (failures.length) {
        setReportError(
          (zh ? `部分指派失敗：\n` : `Some assignments failed:\n`) + failures.join("\n"),
        )
        setReportOpen(true)
      }
    } finally {
      setBulkBusy(false)
    }
  }

  async function bulkGenerateReports() {
    if (demo || bulkBusy || !selectedRows.length) return
    const eligible = selectedRows.filter((row) => row.record_count >= MIN_RECORDS_FOR_REPORT)
    if (!eligible.length) {
      alert(
        zh
          ? `已選學生皆未滿 ${MIN_RECORDS_FOR_REPORT} 次紀錄，無法產生報告`
          : `None of the selected students have ${MIN_RECORDS_FOR_REPORT}+ records`,
      )
      return
    }
    const skipped = selectedRows.length - eligible.length
    const ok = window.confirm(
      zh
        ? `將為 ${eligible.length} 位學生產生${bulkReportLanguage === "zh" ? "中文" : "英文"}報告${skipped ? `（略過 ${skipped} 位未滿紀錄）` : ""}？`
        : `Generate ${bulkReportLanguage === "zh" ? "Chinese" : "English"} reports for ${eligible.length} student(s)${skipped ? ` (skip ${skipped} under-quota)` : ""}?`,
    )
    if (!ok) return
    setBulkBusy(true)
    setReportError(null)
    const failures: string[] = []
    let lastReport: LearningCompanionReport | null = null
    try {
      for (const row of eligible) {
        setGeneratingId(row.profile_id)
        try {
          const data = await apiPost<LearningCompanionReport>(
            `/learning-record-students/${row.profile_id}/generate-report`,
            { report_language: bulkReportLanguage },
          )
          lastReport = data
          setSavedReports((prev) => ({
            ...prev,
            [row.profile_id]: [data, ...(prev[row.profile_id] || [])],
          }))
        } catch (err) {
          failures.push(`${row.child_name}: ${err instanceof Error ? err.message : "failed"}`)
        }
      }
      await load()
      if (lastReport) {
        setActiveReport(lastReport)
        setReportOpen(true)
      }
      if (failures.length) {
        setReportError(
          (zh ? `部分報告產生失敗：\n` : `Some reports failed:\n`) + failures.join("\n"),
        )
        setReportOpen(true)
      } else {
        alert(
          zh
            ? `已為 ${eligible.length} 位學生產生報告`
            : `Generated reports for ${eligible.length} student(s)`,
        )
      }
    } finally {
      setGeneratingId(null)
      setBulkBusy(false)
    }
  }

  async function bulkClearRecords() {
    if (demo || bulkBusy || !selectedRows.length) return
    const targets = selectedRows.filter((row) => row.record_count > 0)
    if (!targets.length) {
      alert(zh ? "已選學生沒有可刪除的 Learning Record" : "Selected students have no Learning Records")
      return
    }
    const ok = window.confirm(
      zh
        ? `確定刪除已選 ${targets.length} 位學生的全部 Learning Record？`
        : `Clear all Learning Records for ${targets.length} selected student(s)?`,
    )
    if (!ok) return
    setBulkBusy(true)
    setReportError(null)
    try {
      for (const row of targets) {
        await apiDelete(`/learning-record-students/${row.profile_id}/records`)
      }
      setHistory({})
      await load()
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Delete failed")
      setReportOpen(true)
    } finally {
      setBulkBusy(false)
    }
  }

  async function bulkRemoveStudents() {
    if (demo || bulkBusy || !selectedRows.length) return
    const ok = window.confirm(
      zh
        ? `確定從 Learning Record 名單移除已選 ${selectedRows.length} 位學生（含紀錄與報告）？`
        : `Remove ${selectedRows.length} selected student(s) from Learning Record (including records and reports)?`,
    )
    if (!ok) return
    setBulkBusy(true)
    setReportError(null)
    const failures: string[] = []
    try {
      for (const row of selectedRows) {
        try {
          await apiDelete(`/learning-record-students/${row.profile_id}`)
        } catch (err) {
          failures.push(`${row.child_name}: ${err instanceof Error ? err.message : "failed"}`)
        }
      }
      clearSelection()
      setHistory({})
      setSavedReports({})
      setExpanded(null)
      await load()
      if (failures.length) {
        setReportError(
          (zh ? `部分刪除失敗：\n` : `Some deletes failed:\n`) + failures.join("\n"),
        )
        setReportOpen(true)
      }
    } finally {
      setBulkBusy(false)
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

  async function clearStudentLearningRecords(profileId: number, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (demo) return
    const ok = window.confirm(
      zh
        ? "確定刪除此學生的全部 Learning Record（紀錄數會歸零）？"
        : "Delete all Learning Records for this student (record count will reset to 0)?",
    )
    if (!ok) return
    setClearingRecordsProfileId(profileId)
    setReportError(null)
    try {
      await apiDelete(`/learning-record-students/${profileId}/records`)
      setHistory((prev) => ({ ...prev, [profileId]: [] }))
      await load()
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Delete failed")
      setReportOpen(true)
    } finally {
      setClearingRecordsProfileId(null)
    }
  }

  async function removeStudentFromLearningRecord(profileId: number, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (demo) return
    const ok = window.confirm(
      zh
        ? "確定從此 Learning Record 名單移除整個學生（含紀錄與報告）？"
        : "Remove this student entirely from Learning Record (including records and reports)?",
    )
    if (!ok) return
    setRemovingStudentProfileId(profileId)
    setReportError(null)
    try {
      await apiDelete(`/learning-record-students/${profileId}`)
      setHistory((prev) => {
        const next = { ...prev }
        delete next[profileId]
        return next
      })
      setSavedReports((prev) => {
        const next = { ...prev }
        delete next[profileId]
        return next
      })
      if (expanded === profileId) setExpanded(null)
      await load()
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Delete failed")
      setReportOpen(true)
    } finally {
      setRemovingStudentProfileId(null)
    }
  }

  async function deleteSingleLearningRecord(profileId: number, recordId: number, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (demo) return
    const ok = window.confirm(zh ? "確定刪除這一份 Learning Record？" : "Delete this Learning Record?")
    if (!ok) return
    setDeletingRecordId(recordId)
    try {
      await apiDelete(`/activity-learning-records/${recordId}?force=1`)
      setHistory((prev) => ({
        ...prev,
        [profileId]: (prev[profileId] || []).filter((item) => item.id !== recordId),
      }))
      await load()
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Delete failed")
      setReportOpen(true)
    } finally {
      setDeletingRecordId(null)
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

  const tableColSpan = mode === "admin" ? 10 : 7

  function renderStudentRows(list: LearningRecordStudent[]) {
    return (
      <>
        {list.map((r) => {
                  const open = expanded === r.profile_id
                  const primary = r.enrollments[0]
                  return (
                    <Fragment key={r.profile_id}>
                      <tr
                        className={
                          mode === "admin"
                            ? `cursor-pointer hover:bg-classz-50/80 ${selectedIds.has(r.profile_id) ? "bg-brand-teal/5" : ""}`
                            : "bg-white"
                        }
                        onClick={mode === "admin" ? () => toggleExpand(r.profile_id) : undefined}
                      >
                        {mode === "admin" ? (
                          <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-[var(--brand-teal)]"
                              checked={selectedIds.has(r.profile_id)}
                              onChange={(e) => toggleSelectProfile(r.profile_id, e)}
                              disabled={demo || bulkBusy}
                              aria-label={zh ? `選取 ${r.child_name}` : `Select ${r.child_name}`}
                            />
                          </td>
                        ) : null}
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
                          <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <AdminStatusChip
                              tone={r.record_count >= MIN_RECORDS_FOR_REPORT ? "teal" : r.record_count > 0 ? "orange" : "magenta"}
                            >
                              {r.record_count}/{MIN_RECORDS_FOR_REPORT}+
                            </AdminStatusChip>
                            {mode === "admin" && r.record_count > 0 ? (
                              <button
                                type="button"
                                className="p-1.5 rounded-md text-brand-coral hover:bg-brand-coral/10 disabled:opacity-40"
                                disabled={demo || clearingRecordsProfileId === r.profile_id}
                                title={zh ? "刪除此學生全部紀錄" : "Clear this student's records"}
                                onClick={(e) => clearStudentLearningRecords(r.profile_id, e)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                        {mode === "admin" ? (
                          <td className="px-3 py-2 text-sm" onClick={(e) => e.stopPropagation()}>
                            <AdminSelect
                              value={String(r.report_coach_user_id || "")}
                              onChange={(e) => {
                                const raw = e.target.value
                                void assignCompanionCoach(r.profile_id, raw ? Number(raw) : null, e)
                              }}
                              disabled={demo || assigningProfileId === r.profile_id}
                              className="min-w-[12rem] py-1.5 text-sm"
                            >
                              <option value="">{zh ? "未指派" : "Unassigned"}</option>
                              {companionOptionsForSelect(r.report_coach_user_id).map((coach) => (
                                <option key={coach.coach_user_id} value={String(coach.coach_user_id)}>
                                  {coach.label}
                                </option>
                              ))}
                            </AdminSelect>
                            {r.report_coach_name || r.report_coach_email ? (
                              <div className="mt-1 text-[11px] text-brand-slate/55 truncate max-w-[13rem]">
                                {r.report_coach_name || r.report_coach_email}
                              </div>
                            ) : !coachOptions.length ? (
                              <div className="mt-1 text-[11px] text-brand-slate/45">
                                <Link href="/admin/teachers" className="text-brand-teal hover:underline">
                                  {zh ? "到導師管理設定登入" : "Set teacher login"}
                                </Link>
                              </div>
                            ) : null}
                          </td>
                        ) : null}
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
                                      className={`inline-flex items-center justify-center rounded-md px-1.5 py-1 text-base leading-none transition-colors ${
                                        preferredReportLanguage(r.profile_id) === "en"
                                          ? "bg-brand-teal/15 ring-1 ring-brand-teal/40"
                                          : "hover:bg-classz-50 opacity-60"
                                      }`}
                                      disabled={generatingId === r.profile_id || demo}
                                      onClick={() =>
                                        setReportLanguageByProfile((prev) => ({
                                          ...prev,
                                          [r.profile_id]: "en",
                                        }))
                                      }
                                      title={zh ? "英文報告" : "English report"}
                                      aria-label={zh ? "英文報告" : "English report"}
                                    >
                                      <span aria-hidden>🇬🇧</span>
                                    </button>
                                    <button
                                      type="button"
                                      className={`inline-flex items-center justify-center rounded-md px-1.5 py-1 text-base leading-none transition-colors ${
                                        preferredReportLanguage(r.profile_id) === "zh"
                                          ? "bg-brand-teal/15 ring-1 ring-brand-teal/40"
                                          : "hover:bg-classz-50 opacity-60"
                                      }`}
                                      disabled={generatingId === r.profile_id || demo}
                                      onClick={() =>
                                        setReportLanguageByProfile((prev) => ({
                                          ...prev,
                                          [r.profile_id]: "zh",
                                        }))
                                      }
                                      title={zh ? "中文報告" : "Chinese report"}
                                      aria-label={zh ? "中文報告" : "Chinese report"}
                                    >
                                      <span aria-hidden>🇭🇰</span>
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    className="inline-flex p-1.5 rounded-md text-white bg-brand-teal hover:bg-brand-teal/90 border border-brand-teal disabled:opacity-40"
                                    disabled={generatingId === r.profile_id || demo}
                                    onClick={(e) => generateReport(r.profile_id, preferredReportLanguage(r.profile_id), e)}
                                    title={
                                      generatingId === r.profile_id
                                        ? zh
                                          ? "產生中…"
                                          : "Generating…"
                                        : zh
                                          ? "產生報告"
                                          : "Generate report"
                                    }
                                    aria-label={zh ? "產生報告" : "Generate report"}
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex p-1.5 rounded-md text-brand-slate hover:bg-classz-50 border border-classz-200 disabled:opacity-40"
                                    disabled={demo || saving}
                                    title={zh ? "編輯學生資料" : "Edit student"}
                                    onClick={(e) => openEditModal(r, e)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <Link
                                    href={`/admin/teacher-students/${r.profile_id}`}
                                    className="inline-flex p-1.5 rounded-md text-brand-slate hover:bg-classz-50 border border-classz-200"
                                    title={zh ? "填寫 Learning Record" : "Fill learning record"}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ClipboardList className="h-3.5 w-3.5" />
                                  </Link>
                                  <button
                                    type="button"
                                    className="inline-flex p-1.5 rounded-md text-brand-coral hover:bg-brand-coral/10 border border-brand-coral/30 disabled:opacity-40"
                                    disabled={demo || removingStudentProfileId === r.profile_id}
                                    title={zh ? "刪除整個學生紀錄" : "Delete entire student record"}
                                    onClick={(e) => removeStudentFromLearningRecord(r.profile_id, e)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5">
                                  <span className="text-[11px] text-brand-slate/45 self-center">
                                    {zh
                                      ? `需 ${MIN_RECORDS_FOR_REPORT - r.record_count} 次紀錄`
                                      : `Need ${MIN_RECORDS_FOR_REPORT - r.record_count} more`}
                                  </span>
                                  <button
                                    type="button"
                                    className="inline-flex p-1.5 rounded-md text-brand-slate hover:bg-classz-50 border border-classz-200 disabled:opacity-40"
                                    disabled={demo || saving}
                                    title={zh ? "編輯學生資料" : "Edit student"}
                                    onClick={(e) => openEditModal(r, e)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <Link
                                    href={`/admin/teacher-students/${r.profile_id}`}
                                    className="inline-flex p-1.5 rounded-md text-brand-slate hover:bg-classz-50 border border-classz-200"
                                    title={zh ? "填寫 Learning Record" : "Fill learning record"}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ClipboardList className="h-3.5 w-3.5" />
                                  </Link>
                                  <button
                                    type="button"
                                    className="inline-flex p-1.5 rounded-md text-brand-coral hover:bg-brand-coral/10 border border-brand-coral/30 disabled:opacity-40"
                                    disabled={demo || removingStudentProfileId === r.profile_id}
                                    title={zh ? "刪除整個學生紀錄" : "Delete entire student record"}
                                    onClick={(e) => removeStudentFromLearningRecord(r.profile_id, e)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                              {(Number(r.report_count) || 0) > 0 ? (
                                <button
                                  type="button"
                                  className="inline-flex p-1.5 rounded-md text-brand-slate hover:bg-classz-50 border border-classz-200 disabled:opacity-40"
                                  disabled={demo}
                                  onClick={(e) => viewLatestReport(r.profile_id, e)}
                                  title={zh ? "查看報告" : "View report"}
                                  aria-label={zh ? "查看報告" : "View report"}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              ) : null}
                              {(Number(r.report_count) || 0) > 0 ? (
                                <button
                                  type="button"
                                  className="inline-flex p-1.5 rounded-md text-brand-slate hover:bg-classz-50 border border-classz-200 disabled:opacity-40"
                                  disabled={demo}
                                  onClick={(e) => exportPdfForProfile(r.profile_id, e)}
                                  title={zh ? "下載 PDF" : "Download PDF"}
                                  aria-label={zh ? "下載 PDF" : "Download PDF"}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                              ) : null}
                              {(Number(r.report_count) || 0) > 0 ? (
                                <button
                                  type="button"
                                  className="inline-flex p-1.5 rounded-md text-brand-coral hover:bg-brand-coral/10 border border-brand-coral/30 disabled:opacity-40"
                                  disabled={demo || deletingProfileId === r.profile_id}
                                  onClick={(e) => deleteLatestReport(r.profile_id, e)}
                                  title={
                                    deletingProfileId === r.profile_id
                                      ? zh
                                        ? "刪除中…"
                                        : "Deleting…"
                                      : zh
                                        ? "刪除報告"
                                        : "Delete report"
                                  }
                                  aria-label={zh ? "刪除報告" : "Delete report"}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        )}
                      </tr>
                      {mode === "admin" && open ? (
                        <tr className="bg-[var(--admin-canvas)]">
                          <td colSpan={tableColSpan} className="px-4 py-3">
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
                                      <div className="ml-auto inline-flex items-center gap-1">
                                        <Link
                                          href={`/admin/teacher-students/${r.profile_id}`}
                                          className="p-1 rounded-md text-brand-slate hover:bg-classz-50"
                                          title={zh ? "編輯" : "Edit"}
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </Link>
                                        <button
                                          type="button"
                                          className="p-1 rounded-md text-brand-coral hover:bg-brand-coral/10 disabled:opacity-40"
                                          disabled={demo || deletingRecordId === rec.id}
                                          title={zh ? "刪除這份紀錄" : "Delete this record"}
                                          onClick={(e) => deleteSingleLearningRecord(r.profile_id, rec.id, e)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
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
      </>
    )
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
        <div className="flex w-full sm:w-auto flex-wrap items-center gap-2 shrink-0">
          <AdminGhostButton
            type="button"
            onClick={() => {
              window.open("/forms/learning-record-coach-form.html", "_blank", "noopener,noreferrer")
            }}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5"
            title={zh ? "開啟紙本 Learning Record 表單（可列印／儲存 PDF）" : "Open printable Learning Record form"}
          >
            <Printer className="h-4 w-4" />
            {zh ? "列印紙本表單" : "Print blank form"}
          </AdminGhostButton>
          {mode === "admin" ? (
            <>
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
            </>
          ) : null}
        </div>
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
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          <div className="min-w-0 flex-1">
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
        </div>

        {mode === "admin" && selectedRows.length > 0 ? (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-classz-200 bg-classz-50/70 px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-brand-slate">
                {zh ? `已選 ${selectedRows.length} 位` : `${selectedRows.length} selected`}
              </p>
              <button
                type="button"
                className="text-xs text-brand-slate/60 hover:text-brand-slate underline-offset-2 hover:underline disabled:opacity-40"
                disabled={bulkBusy}
                onClick={clearSelection}
              >
                {zh ? "取消選取" : "Clear selection"}
              </button>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-end">
              <div className="min-w-[12rem] flex-1">
                <AdminLabel>
                  <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {zh ? "批次指派 Companion" : "Bulk assign companion"}
                    <Link
                      href="/admin/teachers"
                      className="text-[11px] font-normal text-brand-teal hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {zh ? "來自導師管理" : "From Teachers"}
                    </Link>
                  </span>
                </AdminLabel>
                <div className="flex flex-wrap gap-2">
                  <AdminSelect
                    value={bulkCoachId}
                    onChange={(e) => setBulkCoachId(e.target.value)}
                    disabled={demo || bulkBusy}
                    className="min-w-[11rem] flex-1 py-1.5 text-sm"
                  >
                    <option value="">{zh ? "未指派" : "Unassigned"}</option>
                    {companionOptionsForSelect().map((coach) => (
                      <option key={coach.coach_user_id} value={String(coach.coach_user_id)}>
                        {coach.label}
                        {coach.email ? ` (${coach.email})` : ""}
                      </option>
                    ))}
                  </AdminSelect>
                  <AdminGhostButton
                    type="button"
                    className="inline-flex items-center gap-1.5 justify-center"
                    disabled={demo || bulkBusy}
                    onClick={() => void bulkAssignCompanion()}
                  >
                    {zh ? "套用指派" : "Apply assign"}
                  </AdminGhostButton>
                </div>
                {!coachOptions.length ? (
                  <p className="mt-1 text-[11px] text-brand-slate/55">
                    {zh ? (
                      <>
                        尚無已連結登入的導師，請先到{" "}
                        <Link href="/admin/teachers" className="text-brand-teal hover:underline">
                          導師管理
                        </Link>{" "}
                        同步／設定登入
                      </>
                    ) : (
                      <>
                        No teachers with login yet — sync or set login in{" "}
                        <Link href="/admin/teachers" className="text-brand-teal hover:underline">
                          Teachers
                        </Link>
                      </>
                    )}
                  </p>
                ) : null}
              </div>

              <div>
                <AdminLabel>{zh ? "批次產生報告" : "Bulk generate reports"}</AdminLabel>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center rounded-lg border border-classz-200 bg-white p-0.5">
                    <button
                      type="button"
                      className={`inline-flex items-center justify-center rounded-md px-1.5 py-1 text-base leading-none transition-colors ${
                        bulkReportLanguage === "en"
                          ? "bg-brand-teal/15 ring-1 ring-brand-teal/40"
                          : "hover:bg-classz-50 opacity-60"
                      }`}
                      disabled={bulkBusy || demo}
                      onClick={() => setBulkReportLanguage("en")}
                      title={zh ? "英文報告" : "English report"}
                      aria-label={zh ? "英文報告" : "English report"}
                    >
                      <span aria-hidden>🇬🇧</span>
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center justify-center rounded-md px-1.5 py-1 text-base leading-none transition-colors ${
                        bulkReportLanguage === "zh"
                          ? "bg-brand-teal/15 ring-1 ring-brand-teal/40"
                          : "hover:bg-classz-50 opacity-60"
                      }`}
                      disabled={bulkBusy || demo}
                      onClick={() => setBulkReportLanguage("zh")}
                      title={zh ? "中文報告" : "Chinese report"}
                      aria-label={zh ? "中文報告" : "Chinese report"}
                    >
                      <span aria-hidden>🇭🇰</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="inline-flex p-1.5 rounded-md text-white bg-brand-teal hover:bg-brand-teal/90 border border-brand-teal disabled:opacity-40"
                    disabled={demo || bulkBusy}
                    onClick={() => void bulkGenerateReports()}
                    title={
                      bulkBusy && generatingId
                        ? zh
                          ? "產生中…"
                          : "Generating…"
                        : zh
                          ? "批次產生報告"
                          : "Bulk generate reports"
                    }
                    aria-label={zh ? "批次產生報告" : "Bulk generate reports"}
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:ml-auto">
                <AdminGhostButton
                  type="button"
                  className="inline-flex items-center gap-1.5 justify-center text-brand-coral border-brand-coral/30 hover:bg-brand-coral/10"
                  disabled={demo || bulkBusy || !selectedRows.some((row) => row.record_count > 0)}
                  onClick={() => void bulkClearRecords()}
                >
                  <Trash2 className="h-4 w-4" />
                  {zh ? "刪除紀錄" : "Clear records"}
                </AdminGhostButton>
                <AdminGhostButton
                  type="button"
                  className="inline-flex items-center gap-1.5 justify-center text-brand-coral border-brand-coral/30 hover:bg-brand-coral/10"
                  disabled={demo || bulkBusy}
                  onClick={() => void bulkRemoveStudents()}
                >
                  <Trash2 className="h-4 w-4" />
                  {zh ? "刪除學生" : "Delete students"}
                </AdminGhostButton>
              </div>
            </div>
          </div>
        ) : null}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-classz-100 border-t-classz-400 animate-spin" />
          </div>
        ) : (
          <>
          <AdminTableShell>
            <AdminTable className="min-w-[82rem]">
              <thead className="bg-classz-50 text-classz-600">
                <tr>
                  {mode === "admin" ? (
                    <th className="px-2 py-2 w-10" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[var(--brand-teal)]"
                        checked={allFilteredSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected
                        }}
                        onChange={(e) => toggleSelectAllFiltered(e)}
                        disabled={demo || !mainRows.length || bulkBusy}
                        aria-label={zh ? "全選目前列表" : "Select all in list"}
                      />
                    </th>
                  ) : null}
                  {mode === "admin" ? <th className="px-2 py-2 w-8" /> : null}
                  <SortableTh label={zh ? "學生" : "Child"} column="child" />
                  <SortableTh label={zh ? "年級" : "Grade"} column="grade" />
                  <SortableTh label={zh ? "家長" : "Parent"} column="parent" />
                  <SortableTh label={zh ? "電話" : "Phone"} column="phone" />
                  <SortableTh label={zh ? "課堂" : "Session"} column="session" />
                  <SortableTh label={zh ? "紀錄數" : "Records"} column="records" />
                  {mode === "admin" ? (
                    <th className="px-3 py-2 text-left">
                      <span className="inline-flex flex-col gap-0.5">
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1 font-medium transition-colors ${
                            sortKey === "coach" ? "text-brand-teal" : "text-classz-600 hover:text-brand-slate"
                          }`}
                          onClick={() => toggleSort("coach")}
                          aria-label={zh ? "依 Companion 導師排序" : "Sort by companion coach"}
                        >
                          <span>{zh ? "Companion導師" : "Companion coach"}</span>
                          {sortKey === "coach" ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-45" />
                          )}
                        </button>
                        <Link
                          href="/admin/teachers"
                          className="text-[11px] font-normal text-brand-teal hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {zh ? "導師管理" : "Teachers"}
                        </Link>
                      </span>
                    </th>
                  ) : null}
                  {mode === "teacher" ? (
                    <th className="px-3 py-2 text-right">{zh ? "操作" : "Action"}</th>
                  ) : (
                    <th className="px-3 py-2 text-right">{zh ? "報告" : "Report"}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {renderStudentRows(mainRows)}
                {!mainRows.length ? (
                  <tr>
                    <td colSpan={tableColSpan} className="px-3 py-10 text-center text-brand-slate/50">
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

          {demoRows.length > 0 ? (
            <div className="mt-8 border-t border-classz-100 pt-6">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-brand-slate">
                  {zh ? "Companion 動物 Demo（測試用）" : "Companion animal demos (for testing)"}
                </h3>
                <p className="mt-1 text-xs text-brand-slate/55">
                  {zh
                    ? "這 6 位 Demo 學生各對應一種動物型格，僅供產生報告測試，與上方正式名單分開。"
                    : "These 6 demo students each map to one animal type for report testing, kept separate from the live list above."}
                </p>
              </div>
              <AdminTableShell>
                <AdminTable className="min-w-[82rem]">
                  <thead className="bg-classz-50 text-classz-600">
                    <tr>
                      {mode === "admin" ? <th className="px-2 py-2 w-10" /> : null}
                      {mode === "admin" ? <th className="px-2 py-2 w-8" /> : null}
                      <SortableTh label={zh ? "學生" : "Child"} column="child" />
                      <SortableTh label={zh ? "年級" : "Grade"} column="grade" />
                      <SortableTh label={zh ? "家長" : "Parent"} column="parent" />
                      <SortableTh label={zh ? "電話" : "Phone"} column="phone" />
                      <SortableTh label={zh ? "課堂" : "Session"} column="session" />
                      <SortableTh label={zh ? "紀錄數" : "Records"} column="records" />
                      {mode === "admin" ? (
                        <SortableTh label={zh ? "Companion導師" : "Companion coach"} column="coach" />
                      ) : null}
                      {mode === "teacher" ? (
                        <th className="px-3 py-2 text-right">{zh ? "操作" : "Action"}</th>
                      ) : (
                        <th className="px-3 py-2 text-right">{zh ? "報告" : "Report"}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-classz-100">{renderStudentRows(demoRows)}</tbody>
                </AdminTable>
              </AdminTableShell>
            </div>
          ) : null}
          </>
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
          open={editOpen}
          title={zh ? "編輯學生資料" : "Edit student"}
          onClose={() => {
            if (saving) return
            setEditOpen(false)
            setEditingStudent(null)
          }}
          footer={
            <>
              <AdminGhostButton
                type="button"
                disabled={saving}
                onClick={() => {
                  setEditOpen(false)
                  setEditingStudent(null)
                }}
              >
                {zh ? "取消" : "Cancel"}
              </AdminGhostButton>
              <AdminPrimaryButton type="button" disabled={saving} onClick={submitEdit}>
                {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "儲存" : "Save"}
              </AdminPrimaryButton>
            </>
          }
        >
          {editError ? (
            <p role="alert" className="text-sm text-brand-coral mb-3">
              {editError}
            </p>
          ) : null}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <AdminLabel>{zh ? "家長姓名" : "Parent name"} *</AdminLabel>
                <AdminInput
                  value={editForm.parent_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, parent_name: e.target.value }))}
                />
              </div>
              <div>
                <AdminLabel>{zh ? "聯絡電話" : "Phone"} *</AdminLabel>
                <AdminInput
                  inputMode="tel"
                  value={editForm.contact_number}
                  onChange={(e) => setEditForm((f) => ({ ...f, contact_number: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <AdminLabel>{zh ? "學生姓名" : "Child name"} *</AdminLabel>
                <AdminInput
                  value={editForm.child_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, child_name: e.target.value }))}
                />
              </div>
              <div>
                <AdminLabel>{zh ? "年級" : "Grade"}</AdminLabel>
                <AdminInput
                  placeholder="P1 / K3…"
                  value={editForm.grade}
                  onChange={(e) => setEditForm((f) => ({ ...f, grade: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <AdminLabel>{zh ? "性別" : "Sex"}</AdminLabel>
                <AdminSelect
                  value={editForm.sex}
                  onChange={(e) => setEditForm((f) => ({ ...f, sex: e.target.value }))}
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
                  value={editForm.age}
                  onChange={(e) => setEditForm((f) => ({ ...f, age: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <AdminLabel>{zh ? "課堂／體驗日場次" : "Class / Open Day session"} *</AdminLabel>
              <AdminSelect
                value={editForm.class_id}
                onChange={(e) => setEditForm((f) => ({ ...f, class_id: e.target.value }))}
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
