"use client"

import { useEffect, useMemo, useState } from "react"
import { BookOpen, Edit, Plus, Search, Sparkles, Trash2, UserPlus } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { appendAudit, newId, type AdminCourse } from "@/lib/classz-admin-store"
import { useAdminStore } from "@/components/admin/use-admin-store"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import { useCenterApiList } from "@/components/admin/use-center-api-list"
import { CENTRE_CATEGORIES } from "@/lib/register-center-validation"
import {
  HK_ISLAND_DISTRICTS,
  KOWLOON_DISTRICTS,
  NEW_TERRITORIES_DISTRICTS,
  districtLabel,
  findDistrict,
} from "@/lib/locations"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import { isRegularCourseType, isTrialCourseType, isWorkshopCourseType } from "@/lib/course-types"
import {
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminModal,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminTable,
  AdminTableShell,
  AdminTextarea,
  AdminToolbar,
} from "@/components/classz-admin-ui"

const WEEKDAYS = [
  { value: "0", zh: "星期日", en: "Sunday" },
  { value: "1", zh: "星期一", en: "Monday" },
  { value: "2", zh: "星期二", en: "Tuesday" },
  { value: "3", zh: "星期三", en: "Wednesday" },
  { value: "4", zh: "星期四", en: "Thursday" },
  { value: "5", zh: "星期五", en: "Friday" },
  { value: "6", zh: "星期六", en: "Saturday" },
] as const

const LEVELS = [
  { value: "entry", zh: "入門", en: "Entry" },
  { value: "intermediate", zh: "中級", en: "Intermediate" },
  { value: "advanced", zh: "進階", en: "Advanced" },
] as const

const COURSE_TYPES = [
  { value: "regular", zh: "常規課程（Programs）", en: "Regular (Programs)" },
  { value: "short_term", zh: "短期工作坊（Workshops）", en: "Short-term (Workshops)" },
  { value: "summer", zh: "暑期課程（Workshops）", en: "Summer (Workshops)" },
] as const

type CatalogForm = {
  name: string
  program_code: string
  intro: string
  instructor: string
  trial_class_name: string
  location: string
  weekday: string
  course_type: string
  category: string
  level: string
  price: string
  age_min: string
  age_max: string
  image_url: string
  starts_at: string
  ends_at: string
  capacity: string
  venue: string
  default_instructor_id: string
  status: AdminCourse["status"]
}

const EMPTY_FORM: CatalogForm = {
  name: "",
  program_code: "",
  intro: "",
  instructor: "",
  trial_class_name: "",
  location: "",
  weekday: "6",
  course_type: "regular",
  category: "",
  level: "entry",
  price: "",
  age_min: "",
  age_max: "",
  image_url: "",
  starts_at: "",
  ends_at: "",
  capacity: "10",
  venue: "",
  default_instructor_id: "",
  status: "published",
}

function asText(v: unknown) {
  return v == null || v === "" ? "" : String(v)
}

function composeAgeTag(min: string, max: string) {
  if (min && max) return `${min}-${max}`
  if (min) return `${min}+`
  return ""
}

function isSessionListingType(courseType?: string | null) {
  return isWorkshopCourseType(courseType) || isTrialCourseType(courseType)
}

function toDatetimeLocal(value?: string | null) {
  if (!value) return ""
  const s = String(value).trim()
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/)
  if (m) return `${m[1]}T${m[2]}`
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatWorkshopWhen(value?: string | null) {
  const local = toDatetimeLocal(value)
  if (!local) return "—"
  return local.replace("T", " ")
}

function districtSlugFromCentre(district?: string | null) {
  if (!district) return ""
  return findDistrict(district)?.slug || district
}

export function CoursesManager({
  variant = "courses",
  embedded = false,
}: {
  variant?: "courses" | "programs" | "workshops" | "trials"
  embedded?: boolean
}) {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const isPrograms = variant === "programs"
  const isWorkshops = variant === "workshops"
  const isTrials = variant === "trials"
  const isSessionListing = isWorkshops || isTrials
  const demo = isDemoSession()
  const { store, patch, ready: storeReady } = useAdminStore()
  const mapCourse = (r: Record<string, unknown>): AdminCourse => ({
    id: String(r.id),
    name: String(r.name || ""),
    instructor: String(r.instructor || ""),
    start_time: asText(r.starts_at) || String(r.created_at || new Date().toISOString()),
    end_time: asText(r.ends_at) || String(r.updated_at || new Date().toISOString()),
    capacity: r.capacity == null || r.capacity === "" ? 10 : Number(r.capacity),
    enrolled_count: 0,
    status: String(r.publish_status || "draft") as AdminCourse["status"],
    location: String(r.location || ""),
    program_code: asText(r.program_code),
    intro: asText(r.intro),
    level: asText(r.level) || "entry",
    age_tag: asText(r.age_tag),
    age_min: r.age_min == null || r.age_min === "" ? null : Number(r.age_min),
    age_max: r.age_max == null || r.age_max === "" ? null : Number(r.age_max),
    weekday: r.weekday == null || r.weekday === "" ? null : Number(r.weekday),
    course_type: asText(r.course_type) || "regular",
    price: r.price == null || r.price === "" ? null : Number(r.price),
    trial_class_name: asText(r.trial_class_name),
    image_url: asText(r.image_url) || null,
    category: asText(r.category) || null,
    starts_at: asText(r.starts_at) || null,
    ends_at: asText(r.ends_at) || null,
    venue: asText(r.venue) || null,
    default_instructor_id: r.default_instructor_id == null || r.default_instructor_id === "" ? null : Number(r.default_instructor_id),
  })
  const { rows: apiRows, ready: apiReady, reload, error: apiError } = useCenterApiList("/courses", mapCourse)
  const { rows: classRows } = useCenterApiList("/classes", (r) => ({
    program_code: String(r.program_code || r.class_code || "").trim(),
    name: String(r.name || ""),
  }))
  const { rows: instructorRows } = useCenterApiList("/instructors", (r) => ({
    id: String(r.id),
    name: String(r.name || ""),
  }))
  const ready = demo ? storeReady : apiReady
  const courses = demo ? store?.courses : apiRows
  const instructors = demo ? (store?.instructors || []).map((i) => ({ id: i.id, name: i.name })) : instructorRows
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [editing, setEditing] = useState<AdminCourse | null>(null)
  const [form, setForm] = useState<CatalogForm>(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [centreProfile, setCentreProfile] = useState<{ district: string | null; address: string | null } | null>(null)

  useEffect(() => {
    if (demo || !isSessionListing) return
    apiGet<{ district: string | null; address: string | null }>("/profile")
      .then((p) => setCentreProfile({ district: p?.district || null, address: p?.address || null }))
      .catch(() => setCentreProfile(null))
  }, [demo, isSessionListing])

  useEffect(() => {
    if (!isSessionListing || modal !== "create" || !centreProfile) return
    const district = districtSlugFromCentre(centreProfile.district)
    const venue =
      (centreProfile.address || "").trim() ||
      districtLabel(centreProfile.district, zh ? "zh-TW" : "en") ||
      ""
    setForm((f) => ({
      ...f,
      location: f.location.trim() || district,
      venue: f.venue.trim() || venue,
    }))
  }, [centreProfile, modal, isSessionListing, zh])

  const sessionCodes = useMemo(() => {
    const seen = new Map<string, string>()
    for (const c of classRows) {
      if (c.program_code && !seen.has(c.program_code)) seen.set(c.program_code, c.name)
    }
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [classRows])

  const rows = useMemo(() => {
    if (!courses) return []
    const q = search.trim().toLowerCase()
    return courses.filter((c) => {
      if (isWorkshops && !isWorkshopCourseType(c.course_type)) return false
      if (isTrials && !isTrialCourseType(c.course_type)) return false
      if (isPrograms && !isRegularCourseType(c.course_type)) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        String(c.program_code || "").toLowerCase().includes(q)
      )
    })
  }, [courses, search, isPrograms, isWorkshops, isTrials])

  function courseToForm(c?: AdminCourse | null): CatalogForm {
    if (!c) return { ...EMPTY_FORM }
    let ageMin = c.age_min != null && !Number.isNaN(c.age_min) ? String(c.age_min) : ""
    let ageMax = c.age_max != null && !Number.isNaN(c.age_max) ? String(c.age_max) : ""
    if (!ageMin && !ageMax && c.age_tag) {
      const m = String(c.age_tag).match(/^(\d+)\s*[-–]\s*(\d+)$/)
      const plus = String(c.age_tag).match(/^(\d+)\s*\+$/)
      if (m) {
        ageMin = m[1]
        ageMax = m[2]
      } else if (plus) {
        ageMin = plus[1]
      }
    }
    return {
      name: c.name,
      program_code: c.program_code || "",
      intro: c.intro || "",
      instructor: c.instructor,
      trial_class_name: c.trial_class_name || "",
      location: c.location || "",
      weekday: c.weekday != null && c.weekday >= 0 ? String(c.weekday) : "6",
      course_type: c.course_type || "regular",
      category: c.category || "",
      level: c.level || "entry",
      price: c.price != null && !Number.isNaN(c.price) ? String(c.price) : "",
      age_min: ageMin,
      age_max: ageMax,
      image_url: c.image_url || "",
      starts_at: toDatetimeLocal(c.starts_at || (isSessionListingType(c.course_type) ? c.start_time : "")),
      ends_at: toDatetimeLocal(c.ends_at || (isSessionListingType(c.course_type) ? c.end_time : "")),
      capacity: c.capacity != null && !Number.isNaN(c.capacity) ? String(c.capacity) : "10",
      venue: c.venue || "",
      default_instructor_id:
        c.default_instructor_id != null
          ? String(c.default_instructor_id)
          : instructors.find((i) => i.name === c.instructor)?.id || "",
      status: c.status === "pending_approval" || c.status === "rejected" ? c.status : c.status === "published" ? "published" : "draft",
    }
  }

  function openCreate() {
    setEditing(null)
    const district = districtSlugFromCentre(centreProfile?.district)
    const venue =
      (centreProfile?.address || "").trim() ||
      districtLabel(centreProfile?.district, zh ? "zh-TW" : "en") ||
      ""
    setForm({
      ...EMPTY_FORM,
      location: isSessionListing ? district : "mong-kok",
      venue,
      course_type: isTrials ? "trial" : isWorkshops ? "short_term" : "regular",
      capacity: "10",
    })
    setModal("create")
  }

  function openEdit(c: AdminCourse) {
    setEditing(c)
    setForm(courseToForm(c))
    setModal("edit")
  }

  function catalogBody() {
    const listingType = isTrials
      ? "trial"
      : isWorkshops
        ? form.course_type === "summer"
          ? "summer"
          : "short_term"
        : isPrograms
          ? "regular"
          : form.course_type || "regular"
    const matchedTeacher = instructors.find((i) => i.id === form.default_instructor_id)
    const instructorName = matchedTeacher?.name || form.instructor.trim()
    const body: Record<string, unknown> = {
      name: form.name.trim(),
      intro: form.intro.trim() || null,
      instructor: instructorName,
      location: form.location.trim() || null,
      course_type: listingType,
      image_url: form.image_url.trim() || null,
    }
    if (!isSessionListing) {
      body.program_code = form.program_code.trim() || undefined
      body.trial_class_name = form.trial_class_name.trim() || null
      body.weekday = form.weekday === "" ? null : Number(form.weekday)
      body.category = form.category.trim() || null
      body.level = form.level || "entry"
      body.age_min = form.age_min !== "" ? Number(form.age_min) : null
      body.age_max = form.age_max !== "" ? Number(form.age_max) : null
      body.age_tag = composeAgeTag(form.age_min, form.age_max) || null
    } else {
      body.starts_at = form.starts_at.trim() || null
      body.ends_at = form.ends_at.trim() || null
      body.capacity = form.capacity !== "" ? Number(form.capacity) : 10
      body.venue = form.venue.trim() || null
      body.default_instructor_id = form.default_instructor_id ? Number(form.default_instructor_id) : null
      if (form.location.trim() === "" && centreProfile?.district) {
        body.location = districtSlugFromCentre(centreProfile.district)
      }
    }
    if (form.price !== "") body.price = Number(form.price)
    return body
  }

  async function save() {
    if (!form.name.trim()) {
      alert(
        isTrials
          ? zh
            ? "請填寫試堂名稱"
            : "Please enter a trial class name"
          : isWorkshops
            ? zh
              ? "請填寫工作坊名稱"
              : "Please enter a workshop name"
            : zh
              ? "請填寫課程名稱"
              : "Please enter a program name",
      )
      return
    }
    if (isSessionListing && !form.starts_at.trim()) {
      alert(zh ? "請填寫日期時間" : "Please enter the date and time")
      return
    }
    if (!demo) {
      setSaving(true)
      try {
        const body = catalogBody()
        if (modal === "create") {
          const created = await apiPost<{ id: number; publish_status?: string }>("/courses", body)
          if (form.status === "published" && created?.id) {
            await apiPost(`/courses/${created.id}/submit-for-approval`, {})
          }
        } else if (editing) {
          if (editing.status === "pending_approval") {
            alert(zh ? "待審批課程暫不能修改，請等平台審批完成。" : "Pending listings cannot be edited until they are approved or rejected.")
            return
          }
          if (editing.status === "published") {
            await apiPost(`/courses/${editing.id}/request-edit`, {})
          }
          await apiPatch(`/courses/${editing.id}`, body)
          if (form.status === "published") {
            await apiPost(`/courses/${editing.id}/submit-for-approval`, {})
          }
        }
        await reload()
        setModal(null)
      } catch (e) {
        alert(e instanceof Error ? e.message : "Save failed")
      } finally {
        setSaving(false)
      }
      return
    }
    if (!store) return
    const extra: Pick<AdminCourse, "program_code" | "intro" | "level" | "age_tag" | "age_min" | "age_max" | "weekday" | "course_type" | "price" | "trial_class_name" | "image_url" | "category" | "starts_at" | "ends_at" | "venue" | "default_instructor_id"> = {
      program_code: form.program_code.trim(),
      intro: form.intro.trim(),
      level: form.level,
      age_tag: composeAgeTag(form.age_min, form.age_max),
      age_min: form.age_min !== "" ? Number(form.age_min) : null,
      age_max: form.age_max !== "" ? Number(form.age_max) : null,
      weekday: form.weekday === "" ? null : Number(form.weekday),
      course_type: form.course_type,
      price: form.price !== "" ? Number(form.price) : null,
      trial_class_name: form.trial_class_name.trim(),
      image_url: form.image_url.trim() || null,
      category: form.category.trim() || null,
      starts_at: form.starts_at.trim() || null,
      ends_at: form.ends_at.trim() || null,
      venue: form.venue.trim() || null,
      default_instructor_id: form.default_instructor_id ? Number(form.default_instructor_id) : null,
    }
    if (modal === "create") {
      const c: AdminCourse = {
        id: newId(),
        name: form.name.trim(),
        instructor: form.instructor.trim(),
        start_time: form.starts_at || new Date().toISOString(),
        end_time: form.ends_at || new Date().toISOString(),
        capacity: form.capacity !== "" ? Number(form.capacity) : 10,
        enrolled_count: 0,
        status: form.status === "published" ? "published" : "draft",
        location: form.location.trim() || form.venue.trim(),
        ...extra,
      }
      patch((s) =>
        appendAudit({ ...s, courses: [...s.courses, c] }, { action: "create_course", target_type: "course", target_id: c.id, details: c.name })
      )
    } else if (editing) {
      patch((s) =>
        appendAudit(
          {
            ...s,
            courses: s.courses.map((x) =>
              x.id === editing.id
                    ? {
                    ...x,
                    name: form.name.trim(),
                    instructor: form.instructor.trim(),
                    start_time: form.starts_at || x.start_time,
                    end_time: form.ends_at || x.end_time,
                    capacity: form.capacity !== "" ? Number(form.capacity) : x.capacity,
                    status: form.status === "published" ? "published" : "draft",
                    location: form.location.trim() || form.venue.trim(),
                    ...extra,
                  }
                : x
            ),
          },
          { action: "update_course", target_type: "course", target_id: editing.id, details: form.name.trim() }
        )
      )
    }
    setModal(null)
  }

  async function onCoverChange(file: File | undefined) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert(zh ? "圖片須少於 5MB" : "Image must be under 5MB")
      return
    }
    if (!file.type.startsWith("image/")) {
      alert(zh ? "只接受圖片檔" : "Only image files are allowed")
      return
    }
    if (demo) {
      setForm((f) => ({ ...f, image_url: URL.createObjectURL(file) }))
      return
    }
    setUploading(true)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await apiPost<{ url?: string; absolute_url?: string }>("/uploads", { image: dataUrl })
      const url = res?.url || res?.absolute_url || ""
      if (!url) throw new Error("Upload failed")
      setForm((f) => ({ ...f, image_url: url }))
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  function remove(id: string) {
    if (!confirm(isTrials ? (zh ? "刪除此試堂？" : "Delete this trial class?") : isWorkshops ? (zh ? "刪除此工作坊？" : "Delete this workshop?") : zh ? "刪除此課程？" : "Delete this course?")) return
    patch((s) => appendAudit({ ...s, courses: s.courses.filter((c) => c.id !== id) }, { action: "delete_course", target_type: "course", target_id: id, details: "" }))
  }

  function statusLabel(s: string) {
    if (zh) {
      if (s === "published") return "已上架"
      if (s === "pending_approval") return "待審批"
      if (s === "rejected") return "已拒絕"
      return "草稿"
    }
    if (s === "published") return "Published"
    if (s === "pending_approval") return "Pending"
    if (s === "rejected") return "Rejected"
    return "Draft"
  }

  if (!ready || (demo && !store) || (!demo && !courses)) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  const listing = (
    <>
      <AdminCard>
        {apiError && !demo ? (
          <div className="mb-3 text-sm text-brand-coral bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] rounded-md px-3 py-2">{apiError}</div>
        ) : null}
        <AdminToolbar>
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400 pointer-events-none" />
            <AdminInput className="pl-9" placeholder={zh ? "搜尋…" : "Search…"} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <AdminPrimaryButton type="button" className="ml-auto" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {isTrials
              ? zh
                ? "新增試堂"
                : "Add trial class"
              : isWorkshops
                ? zh
                  ? "新增工作坊"
                  : "Add workshop"
                : isPrograms
                  ? zh
                    ? "新增課程"
                    : "Add program"
                  : zh
                    ? "新增課程"
                    : "Add course"}
          </AdminPrimaryButton>
        </AdminToolbar>
        <AdminTableShell>
          <AdminTable>
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">
                  {isTrials ? (zh ? "試堂" : "Trial") : isWorkshops ? (zh ? "工作坊" : "Workshop") : zh ? "課程" : "Course"}
                </th>
                {isSessionListing ? (
                  <>
                    <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "日期時間" : "Date"}</th>
                    <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "任教老師" : "Teacher"}</th>
                    <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "名額" : "Capacity"}</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "代碼" : "Code"}</th>
                    <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "年齡" : "Age"}</th>
                  </>
                )}
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "地點" : "Location"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "狀態" : "Status"}</th>
                <th className="px-3 py-3 text-right text-base font-semibold text-classz-600 uppercase">{zh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {rows.map((c) => (
                <tr key={c.id} className="bg-white">
                  <td className="px-3 py-2 text-classz-700 font-medium">{c.name}</td>
                  {isSessionListing ? (
                    <>
                      <td className="px-3 py-2 text-classz-600 whitespace-nowrap">{formatWorkshopWhen(c.starts_at)}</td>
                      <td className="px-3 py-2 text-classz-600">{c.instructor || "—"}</td>
                      <td className="px-3 py-2 text-classz-600">{c.capacity || "—"}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 text-classz-600 font-mono text-xs">{c.program_code || "—"}</td>
                      <td className="px-3 py-2 text-classz-600">{c.age_tag || "—"}</td>
                    </>
                  )}
                  <td className="px-3 py-2 text-classz-600">{c.venue || districtLabel(c.location, zh ? "zh-TW" : "en") || c.location || "—"}</td>
                  <td className="px-3 py-2 text-classz-600">{statusLabel(c.status)}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button type="button" className="p-1.5 text-classz-500 hover:bg-classz-50 rounded" onClick={() => openEdit(c)}>
                      <Edit className="h-4 w-4" />
                    </button>
                    {demo ? (
                      <button type="button" className="p-1.5 text-brand-coral hover:bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] rounded ml-1" onClick={() => remove(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminTableShell>
      </AdminCard>

      <AdminModal
        open={modal !== null}
        size="lg"
        title={
          modal === "create"
            ? isTrials
              ? zh
                ? "新增上架試堂"
                : "Add trial class"
              : isWorkshops
                ? zh
                  ? "新增上架工作坊"
                  : "Add workshop"
                : zh
                  ? "新增上架課程"
                  : "Add program"
            : isTrials
              ? zh
                ? "編輯上架試堂"
                : "Edit trial class"
              : isWorkshops
                ? zh
                  ? "編輯上架工作坊"
                  : "Edit workshop"
                : zh
                  ? "編輯上架課程"
                  : "Edit program"
        }
        onClose={() => setModal(null)}
        footer={
          <>
            <button type="button" className="px-4 py-2.5 text-base text-classz-700 hover:bg-classz-50 rounded-md border border-classz-200" onClick={() => setModal(null)}>
              {zh ? "取消" : "Cancel"}
            </button>
            <AdminPrimaryButton onClick={save} disabled={saving || uploading}>
              {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "儲存" : "Save"}
            </AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-classz-500">
            {isTrials
              ? zh
                ? "選擇「已上架」會送出平台審批；通過後出現在前台 /trials。地點預設為中心位置，可自行修改。"
                : "“Published” submits the listing for approval. After approval it appears on /trials. Venue defaults to the centre address and can be changed."
              : isWorkshops
                ? zh
                  ? "選擇「已上架」會送出平台審批；通過後出現在前台 /workshops。地點預設為中心位置，可自行修改。"
                  : "“Published” submits the listing for approval. After approval it appears on /workshops. Venue defaults to the centre address and can be changed."
                : zh
                  ? "選擇「已上架」會送出平台審批；通過後出現在前台 /programs。排程課堂的課程代碼需與此相同，詳情頁才會列出堂次。"
                  : "“Published” submits the listing for approval. After approval it appears on /programs. Schedule sessions must use the same program code to show as class options."}
          </p>
          <div>
            <AdminLabel>{zh ? "名稱" : "Name"}</AdminLabel>
            <AdminInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          {isSessionListing ? null : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <AdminLabel>{zh ? "課程代碼" : "Program code"}</AdminLabel>
              <AdminInput
                value={form.program_code}
                placeholder={zh ? "留空則自動產生" : "Leave blank to auto-generate"}
                onChange={(e) => setForm((f) => ({ ...f, program_code: e.target.value }))}
              />
            </div>
            <div>
              <AdminLabel>{zh ? "連結已有課堂" : "Link existing sessions"}</AdminLabel>
              <AdminSelect
                value=""
                onChange={(e) => {
                  const code = e.target.value
                  if (!code) return
                  const name = sessionCodes.find(([c]) => c === code)?.[1] || ""
                  setForm((f) => ({
                    ...f,
                    program_code: code,
                    name: f.name.trim() ? f.name : name,
                  }))
                }}
              >
                <option value="">{zh ? "選擇排程課堂代碼…" : "Pick a schedule code…"}</option>
                {sessionCodes.map(([code, name]) => (
                  <option key={code} value={code}>
                    {code} · {name}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </div>
          )}
          <div>
            <AdminLabel>{zh ? "簡介" : "Description"}</AdminLabel>
            <AdminTextarea
              className="min-h-[88px]"
              rows={3}
              value={form.intro}
              onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))}
              placeholder={
                isTrials
                  ? zh
                    ? "前台試堂詳情會顯示這段文字"
                    : "Shown on the public trial class detail page"
                  : isWorkshops
                    ? zh
                      ? "前台工作坊詳情會顯示這段文字"
                      : "Shown on the public workshop detail page"
                    : zh
                      ? "前台課程詳情會顯示這段文字"
                      : "Shown on the public program detail page"
              }
            />
          </div>
          <div>
            <AdminLabel>{zh ? "封面圖" : "Cover image"}</AdminLabel>
            <div className="flex items-start gap-3">
              {form.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveUploadUrl(form.image_url)} alt="" className="h-20 w-28 rounded-md object-cover border border-classz-100" />
              ) : (
                <div className="h-20 w-28 rounded-md border border-dashed border-classz-200 bg-classz-50" />
              )}
              <div className="space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ""
                    void onCoverChange(file)
                  }}
                />
                <p className="text-xs text-classz-500">{uploading ? (zh ? "上載中…" : "Uploading…") : zh ? "JPG / PNG，少於 5MB" : "JPG / PNG, under 5MB"}</p>
              </div>
            </div>
          </div>
          {isSessionListing ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <AdminLabel>{zh ? "開始日期時間" : "Start date & time"}</AdminLabel>
                  <AdminInput type="datetime-local" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} />
                </div>
                <div>
                  <AdminLabel>{zh ? "結束日期時間" : "End date & time"}</AdminLabel>
                  <AdminInput type="datetime-local" value={form.ends_at} onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <AdminLabel>{zh ? "最大收生人數" : "Max capacity"}</AdminLabel>
                  <AdminInput type="number" min={1} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
                </div>
                <div>
                  <AdminLabel>{zh ? "任教老師" : "Teacher"}</AdminLabel>
                  <AdminSelect
                    value={form.default_instructor_id}
                    onChange={(e) => {
                      const id = e.target.value
                      const name = instructors.find((i) => i.id === id)?.name || ""
                      setForm((f) => ({ ...f, default_instructor_id: id, instructor: name }))
                    }}
                  >
                    <option value="">{zh ? "選擇任教老師…" : "Select teacher…"}</option>
                    {instructors.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </AdminSelect>
                </div>
              </div>
              <div>
                <AdminLabel>{zh ? "地點" : "Location"}</AdminLabel>
                <AdminInput
                  value={form.venue}
                  placeholder={zh ? "預設中心位置" : "Defaults to centre address"}
                  onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                />
                <p className="mt-1 text-xs text-classz-500">
                  {zh ? "未填寫時會使用中心地址。" : "Leave blank to use the centre address."}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {isWorkshops ? (
                  <div>
                    <AdminLabel>{zh ? "類型" : "Type"}</AdminLabel>
                    <AdminSelect value={form.course_type} onChange={(e) => setForm((f) => ({ ...f, course_type: e.target.value }))}>
                      {COURSE_TYPES.filter((c) => c.value === "short_term" || c.value === "summer").map((c) => (
                        <option key={c.value} value={c.value}>
                          {zh ? c.zh : c.en}
                        </option>
                      ))}
                    </AdminSelect>
                  </div>
                ) : null}
                <div>
                  <AdminLabel>{zh ? "價錢" : "Price"}</AdminLabel>
                  <AdminInput inputMode="decimal" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                </div>
              </div>
            </>
          ) : (
            <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <AdminLabel>{zh ? "類別" : "Category"}</AdminLabel>
              <AdminSelect value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                <option value="">{zh ? "選擇類別" : "Select category"}</option>
                {CENTRE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {zh ? c.zh : c.en}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div>
              <AdminLabel>{zh ? "類型" : "Type"}</AdminLabel>
              <AdminSelect value={form.course_type} onChange={(e) => setForm((f) => ({ ...f, course_type: e.target.value }))}>
                {(isPrograms ? COURSE_TYPES.filter((c) => c.value === "regular") : COURSE_TYPES).map((c) => (
                  <option key={c.value} value={c.value}>
                    {zh ? c.zh : c.en}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <AdminLabel>{zh ? "地區" : "District"}</AdminLabel>
              <AdminSelect value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}>
                <option value="">{zh ? "選擇地區" : "Select district"}</option>
                <optgroup label={zh ? "香港島" : "Hong Kong Island"}>
                  {HK_ISLAND_DISTRICTS.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {zh ? d.zh : d.en}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={zh ? "九龍" : "Kowloon"}>
                  {KOWLOON_DISTRICTS.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {zh ? d.zh : d.en}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={zh ? "新界" : "New Territories"}>
                  {NEW_TERRITORIES_DISTRICTS.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {zh ? d.zh : d.en}
                    </option>
                  ))}
                </optgroup>
              </AdminSelect>
            </div>
            <div>
              <AdminLabel>{zh ? "每週上課日" : "Weekly weekday"}</AdminLabel>
              <AdminSelect value={form.weekday} onChange={(e) => setForm((f) => ({ ...f, weekday: e.target.value }))}>
                {WEEKDAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {zh ? d.zh : d.en}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <AdminLabel>{zh ? "價錢" : "Price"}</AdminLabel>
              <AdminInput inputMode="decimal" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "年齡下限" : "Age min"}</AdminLabel>
              <AdminInput inputMode="numeric" value={form.age_min} onChange={(e) => setForm((f) => ({ ...f, age_min: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "年齡上限" : "Age max"}</AdminLabel>
              <AdminInput inputMode="numeric" value={form.age_max} onChange={(e) => setForm((f) => ({ ...f, age_max: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "程度" : "Level"}</AdminLabel>
              <AdminSelect value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {zh ? l.zh : l.en}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <AdminLabel>{zh ? "導師" : "Instructor"}</AdminLabel>
              <AdminInput value={form.instructor} onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "試堂名稱" : "Trial class name"}</AdminLabel>
              <AdminInput value={form.trial_class_name} onChange={(e) => setForm((f) => ({ ...f, trial_class_name: e.target.value }))} />
            </div>
          </div>
            </>
          )}
          <div>
            <AdminLabel>{zh ? "狀態" : "Status"}</AdminLabel>
            <AdminSelect value={form.status === "published" ? "published" : "draft"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AdminCourse["status"] }))}>
              <option value="draft">{zh ? "草稿" : "Draft"}</option>
              <option value="published">{zh ? "已上架（送出審批）" : "Published (submit for approval)"}</option>
            </AdminSelect>
          </div>
        </div>
      </AdminModal>
    </>
  )

  if (embedded) return listing

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={
          isTrials
            ? zh
              ? "試堂"
              : "Trial classes"
            : isWorkshops
              ? zh
                ? "工作坊上架"
                : "Workshops"
              : isPrograms
                ? zh
                  ? "課程上架"
                  : "Programs"
                : zh
                  ? "課程管理"
                  : "Course management"
        }
        Icon={isTrials ? UserPlus : isWorkshops ? Sparkles : BookOpen}
        description={
          isTrials
            ? zh
              ? "填寫封面、簡介、日期時間、名額、任教老師及地點。無需連結現有課程代碼；通過審批後會顯示於 /trials。"
              : "Add a cover, description, date and time, capacity, teacher and venue. No existing program code is required; listings go live on /trials after approval."
            : isWorkshops
              ? zh
                ? "填寫封面、簡介、日期時間、名額、任教老師及地點。無需連結現有課程代碼；通過審批後會顯示於 /workshops。"
                : "Add a cover, description, date and time, capacity, teacher and venue. No existing program code is required; listings go live on /workshops after approval."
              : zh
                ? "填寫前台 Programs 所需資料。排程課堂請使用同一課程代碼，通過審批後會顯示於 /programs。"
                : "Fill the fields shown on the public Programs page. Use the same program code on schedule sessions; listings go live after approval."
        }
      />
      {listing}
    </AdminPageFrame>
  )
}
