"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { GraduationCap, KeyRound, Pencil, Plus, Trash2, Upload } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/classz-api-client"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import {
  AdminCard,
  AdminDangerButton,
  AdminGhostButton,
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

type Instructor = {
  id: number
  name: string
  profile_image_url?: string | null
  avatar_url?: string | null
  intro?: string | null
  intro_zh_tw?: string | null
  intro_zh_cn?: string | null
  intro_en?: string | null
  awards?: string[] | string | null
  dance_school?: string | null
  background_image?: string | null
  years_dancing?: number
  teaching_experience?: number
}

type Slot = { weekday: number; start_time: string; end_time: string }
type Payroll = {
  id: number
  instructor_id: number
  instructor_name?: string
  period_start: string
  period_end: string
  classes_count: number
  amount: number
  status: string
}

type CoachAccount = {
  id: number
  email: string
  full_name?: string | null
  instructor_id?: number | null
  is_active?: boolean
  isActivated?: number
}

type FormState = {
  name: string
  profile_image_url: string
  intro: string
  awards: string
  dance_school: string
  background_image: string
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const EMPTY_FORM: FormState = {
  name: "",
  profile_image_url: "",
  intro: "",
  awards: "",
  dance_school: "",
  background_image: "",
}

const DEFAULT_COMPANION_COACH_ROSTER = [
  { name: "Karina", email: "karina@classz.co" },
  { name: "Jason", email: "jason@classz.co" },
  { name: "Jesse", email: "jesse@classz.co" },
  { name: "Stella", email: "stella@classz.co" },
  { name: "Avery", email: "avery@classz.co" },
  { name: "Lucas", email: "lucas@classz.co" },
  { name: "Wayne", email: "wayne@classz.co" },
  { name: "Marvalle", email: "marvalle@classz.co" },
] as const

function awardsText(awards?: string[] | string | null) {
  if (!awards) return ""
  if (Array.isArray(awards)) return awards.join("\n")
  return String(awards)
}

function awardsPreview(awards?: string[] | string | null, zh?: boolean) {
  const text = awardsText(awards).trim()
  if (!text) return "—"
  const parts = text.split(/[\n,，]+/).map((s) => s.trim()).filter(Boolean)
  if (!parts.length) return "—"
  if (parts.length <= 2) return parts.join(zh ? "、" : ", ")
  return `${parts.slice(0, 2).join(zh ? "、" : ", ")}…`
}

function introForLocale(i: Instructor, zh: boolean) {
  if (zh) return i.intro_zh_tw || i.intro || i.intro_zh_cn || i.intro_en || ""
  return i.intro_en || i.intro || i.intro_zh_tw || ""
}

function clip(text: string, max = 72) {
  const t = text.trim()
  if (!t) return "—"
  return t.length > max ? `${t.slice(0, max)}…` : t
}

function Thumb({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const resolved = resolveUploadUrl(src)
  if (!resolved) {
    return (
      <div
        className={`bg-classz-100 text-classz-400 flex items-center justify-center text-xs ${className || ""}`}
        aria-hidden
      >
        —
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resolved} alt={alt} className={`object-cover bg-classz-50 ${className || ""}`} />
  )
}

async function uploadImageFile(file: File, demo: boolean): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("File too large (max 5MB)")
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed")
  }
  if (demo) return URL.createObjectURL(file)

  const reader = new FileReader()
  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const res = await apiPost<{ url?: string; absolute_url?: string }>("/uploads", { image: dataUrl })
  const url = res?.url || res?.absolute_url || ""
  if (!url) throw new Error("Upload failed")
  return url
}

function ImageUploadField({
  label,
  value,
  onChange,
  zh,
  demo,
  round,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  zh: boolean
  demo: boolean
  round?: boolean
}) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setError(null)

    if (file.size > MAX_IMAGE_BYTES) {
      setError(zh ? "檔案須少於 5MB" : "File must be under 5MB")
      return
    }
    if (!file.type.startsWith("image/")) {
      setError(zh ? "只接受圖片檔" : "Only image files are allowed")
      return
    }

    setUploading(true)
    try {
      const url = await uploadImageFile(file, demo)
      onChange(url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed"
      setError(msg.includes("5MB") || msg.includes("too large") ? (zh ? "檔案須少於 5MB" : "File must be under 5MB") : msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <AdminLabel>{label}</AdminLabel>
      <div className="flex items-start gap-3">
        <Thumb
          src={value}
          alt=""
          className={`h-16 shrink-0 ${round ? "w-16 rounded-full" : "w-28 rounded-md"}`}
        />
        <div className="flex flex-col gap-2 min-w-0">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            className="sr-only"
            onChange={onFileChange}
          />
          <div className="flex flex-wrap gap-2">
            <AdminGhostButton
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? (zh ? "上傳中…" : "Uploading…") : zh ? "上傳圖片" : "Upload"}
            </AdminGhostButton>
            {value ? (
              <AdminGhostButton type="button" disabled={uploading} onClick={() => onChange("")}>
                {zh ? "清除" : "Clear"}
              </AdminGhostButton>
            ) : null}
          </div>
          <p className="text-xs text-classz-500">{zh ? "支援 JPG / PNG / WEBP，少於 5MB" : "JPG / PNG / WEBP, under 5MB"}</p>
          {error ? <p className="text-xs text-brand-coral">{error}</p> : null}
        </div>
      </div>
    </div>
  )
}

function ProfileFormFields({
  form,
  setForm,
  zh,
  demo,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  zh: boolean
  demo: boolean
}) {
  return (
    <div className="space-y-3">
      <div>
        <AdminLabel>{zh ? "姓名" : "Name"}</AdminLabel>
        <AdminInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </div>
      <ImageUploadField
        label={zh ? "頭像" : "Avatar"}
        value={form.profile_image_url}
        onChange={(url) => setForm((f) => ({ ...f, profile_image_url: url }))}
        zh={zh}
        demo={demo}
        round
      />
      <div>
        <AdminLabel>{zh ? "老師簡介" : "Intro"}</AdminLabel>
        <AdminTextarea
          className="min-h-[80px]"
          value={form.intro}
          onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))}
        />
      </div>
      <div>
        <AdminLabel>{zh ? "資歷（每行一項）" : "Credentials (one per line)"}</AdminLabel>
        <AdminTextarea
          className="min-h-[72px]"
          value={form.awards}
          onChange={(e) => setForm((f) => ({ ...f, awards: e.target.value }))}
        />
      </div>
      <div>
        <AdminLabel>{zh ? "畢業/就讀院校" : "School"}</AdminLabel>
        <AdminInput
          value={form.dance_school}
          onChange={(e) => setForm((f) => ({ ...f, dance_school: e.target.value }))}
        />
      </div>
      <ImageUploadField
        label={zh ? "背景圖" : "Background"}
        value={form.background_image}
        onChange={(url) => setForm((f) => ({ ...f, background_image: url }))}
        zh={zh}
        demo={demo}
      />
    </div>
  )
}

export function TeachersManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const [rows, setRows] = useState<Instructor[]>([])
  const [coaches, setCoaches] = useState<CoachAccount[]>([])
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<"create" | "edit" | "delete" | "manage" | "login" | null>(null)
  const [editing, setEditing] = useState<Instructor | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<"availability" | "payroll" | "performance">("availability")
  const [slots, setSlots] = useState<Slot[]>([])
  const [payroll, setPayroll] = useState<Payroll[]>([])
  const [perf, setPerf] = useState<unknown>(null)
  const [newSlot, setNewSlot] = useState<Slot>({ weekday: 1, start_time: "09:00", end_time: "12:00" })
  const [payForm, setPayForm] = useState({ period_start: "", period_end: "", classes_count: "0", amount: "0" })
  const [loginForm, setLoginForm] = useState({ email: "", password: "Classz2026" })
  const [createLoginEnabled, setCreateLoginEnabled] = useState(false)
  const [createLoginEmail, setCreateLoginEmail] = useState("")
  const [createLoginPassword, setCreateLoginPassword] = useState("Classz2026")
  const [bulkCreatingRoster, setBulkCreatingRoster] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [autoSyncAttempted, setAutoSyncAttempted] = useState(false)

  const load = useCallback(async () => {
    if (demo) {
      setRows([])
      setCoaches([])
      setLoadError(zh ? "請用中心帳號登入以載入導師" : "Sign in with a centre account to load teachers")
      return
    }
    try {
      setLoadError(null)
      const [data, coachData] = await Promise.all([
        apiGet<Instructor[]>("/instructors"),
        apiGet<CoachAccount[]>("/coaches?include_inactive=1").catch(() => [] as CoachAccount[]),
      ])
      setRows(Array.isArray(data) ? data : [])
      setCoaches(Array.isArray(coachData) ? coachData : [])
    } catch (e) {
      setRows([])
      setCoaches([])
      setLoadError(e instanceof Error ? e.message : zh ? "載入導師失敗" : "Failed to load teachers")
    }
  }, [demo, zh])

  useEffect(() => {
    void load()
  }, [load])

  // If ClassZ coach roster names are missing from the teachers table, sync once.
  useEffect(() => {
    if (demo || autoSyncAttempted || loadError || bulkCreatingRoster) return
    if (!rows.length && !coaches.length) return
    const names = new Set(rows.map((r) => r.name.trim().toLowerCase()))
    const missing = DEFAULT_COMPANION_COACH_ROSTER.some((c) => !names.has(c.name.toLowerCase()))
    if (!missing) return
    setAutoSyncAttempted(true)
    void (async () => {
      try {
        await apiPost("/coaches/sync-instructors", {})
        await load()
      } catch {
        // Keep table as-is; user can click Sync manually. Error already visible if load fails.
      }
    })()
  }, [demo, autoSyncAttempted, loadError, bulkCreatingRoster, rows, coaches.length, load])

  function coachForInstructor(instructorId: number, instructorName?: string) {
    const byId = coaches.find((c) => Number(c.instructor_id) === Number(instructorId))
    if (byId) return byId
    const key = String(instructorName || "")
      .trim()
      .toLowerCase()
    if (!key) return null
    return (
      coaches.find((c) => {
        const emailLocal = String(c.email || "")
          .split("@")[0]
          .trim()
          .toLowerCase()
        const full = String(c.full_name || "")
          .trim()
          .toLowerCase()
        return emailLocal === key || full === key
      }) || null
    )
  }

  const filtered = rows.filter((i) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      i.name.toLowerCase().includes(q) ||
      introForLocale(i, zh).toLowerCase().includes(q) ||
      awardsText(i.awards).toLowerCase().includes(q) ||
      String(i.dance_school || "")
        .toLowerCase()
        .includes(q)
    )
  })

  function toForm(i: Instructor): FormState {
    return {
      name: i.name || "",
      profile_image_url: i.profile_image_url || i.avatar_url || "",
      intro: introForLocale(i, zh),
      awards: awardsText(i.awards),
      dance_school: i.dance_school || "",
      background_image: i.background_image || "",
    }
  }

  function payloadFromForm(f: FormState) {
    return {
      name: f.name.trim(),
      profile_image_url: f.profile_image_url.trim() || null,
      intro: f.intro.trim() || null,
      intro_zh_tw: zh ? f.intro.trim() || null : undefined,
      intro_en: !zh ? f.intro.trim() || null : undefined,
      awards: f.awards,
      dance_school: f.dance_school.trim() || null,
      background_image: f.background_image.trim() || null,
    }
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setCreateLoginEnabled(false)
    setCreateLoginEmail("")
    setCreateLoginPassword("Classz2026")
    setModal("create")
  }

  function openEdit(i: Instructor) {
    setEditing(i)
    setForm(toForm(i))
    setModal("edit")
  }

  function openDelete(i: Instructor) {
    setEditing(i)
    setModal("delete")
  }

  async function openManage(i: Instructor) {
    setEditing(i)
    setTab("availability")
    setModal("manage")
    if (demo) return
    try {
      const [av, pay, pf] = await Promise.all([
        apiGet<Slot[]>(`/instructors/${i.id}/availability`).catch(() => []),
        apiGet<Payroll[]>("/payroll").catch(() => []),
        apiGet("/instructor-performance").catch(() => null),
      ])
      setSlots(Array.isArray(av) ? av : [])
      setPayroll((Array.isArray(pay) ? pay : []).filter((p) => p.instructor_id === i.id))
      setPerf(pf)
    } catch {
      /* ignore */
    }
  }

  function closeModal() {
    if (saving) return
    setModal(null)
    setEditing(null)
    setCreateLoginEnabled(false)
    setCreateLoginEmail("")
    setCreateLoginPassword("Classz2026")
  }

  function openLogin(i: Instructor) {
    const existing = coachForInstructor(i.id)
    setEditing(i)
    setLoginForm({
      email: existing?.email || "",
      password: "Classz2026",
    })
    setModal("login")
  }

  async function saveLogin() {
    if (demo || !editing) return
    const email = loginForm.email.trim().toLowerCase()
    if (!email || loginForm.password.length < 6) return
    setSaving(true)
    try {
      const existing = coachForInstructor(editing.id)
      if (existing) {
        await apiPatch(`/coaches/${existing.id}`, {
          email,
          password: loginForm.password,
          full_name: editing.name,
          instructor_id: editing.id,
          isActivated: 1,
        })
      } else {
        await apiPost("/coaches", {
          email,
          password: loginForm.password,
          full_name: editing.name,
          instructor_id: editing.id,
        })
      }
      setModal(null)
      setEditing(null)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    } finally {
      setSaving(false)
    }
  }

  async function deactivateLogin(coach: CoachAccount) {
    if (demo) return
    if (!confirm(zh ? "停用此登入帳號？" : "Deactivate this login?")) return
    try {
      await apiDelete(`/coaches/${coach.id}`)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  async function addDefaultCompanionCoachRoster() {
    if (demo || bulkCreatingRoster) return
    setBulkCreatingRoster(true)
    try {
      // Import existing ClassZ coach / centre-admin accounts into the teachers list
      // (creates instructor rows + links; does not invent new logins).
      const sync = await apiPost<{
        processed?: number
        created_instructors?: unknown[]
        linked?: unknown[]
        already_linked?: unknown[]
      }>("/coaches/sync-instructors", {})

      const latestInstructors = await apiGet<Instructor[]>("/instructors")
      const latestCoaches = await apiGet<CoachAccount[]>("/coaches?include_inactive=1").catch(
        () => [] as CoachAccount[],
      )
      const instructorByName = new Map(
        (Array.isArray(latestInstructors) ? latestInstructors : []).map((x) => [x.name.trim().toLowerCase(), x]),
      )
      const coachByEmail = new Map(
        (Array.isArray(latestCoaches) ? latestCoaches : []).map((x) => [String(x.email || "").trim().toLowerCase(), x]),
      )

      const warnings: string[] = []
      for (const item of DEFAULT_COMPANION_COACH_ROSTER) {
        const key = item.name.trim().toLowerCase()
        let instructor = instructorByName.get(key)
        if (!instructor) {
          instructor = await apiPost<Instructor>("/instructors", {
            name: item.name,
            profile_image_url: null,
            intro: null,
            awards: null,
            dance_school: null,
            background_image: null,
          })
          instructorByName.set(key, instructor)
        }

        // Jesse is centre_admin — keep instructor row only; do not force a coach login.
        if (item.email.toLowerCase() === "jesse@classz.co") continue

        const emailKey = item.email.toLowerCase()
        const existingCoach = coachByEmail.get(emailKey)
        if (existingCoach?.id) {
          try {
            await apiPatch(`/coaches/${existingCoach.id}`, {
              full_name: item.name,
              instructor_id: instructor?.id,
              isActivated: 1,
            })
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Link coach failed"
            warnings.push(`${item.name}: ${msg}`)
          }
        } else if (!coachByEmail.has(emailKey)) {
          warnings.push(
            zh
              ? `${item.name}: 尚無登入帳號（${item.email}），請用「設定登入」建立`
              : `${item.name}: no login yet (${item.email}); use Set login`,
          )
        }
      }

      await load()
      const created = Array.isArray(sync?.created_instructors) ? sync.created_instructors.length : 0
      const linked = Array.isArray(sync?.linked) ? sync.linked.length : 0
      const already = Array.isArray(sync?.already_linked) ? sync.already_linked.length : 0
      const summary = zh
        ? `已同步 ClassZ 導師：${already} 位已連結${created ? `、新建 ${created} 位` : ""}${linked ? `、補連結 ${linked} 位` : ""}`
        : `Synced ClassZ teachers: ${already} already linked${created ? `, created ${created}` : ""}${linked ? `, linked ${linked}` : ""}`
      if (warnings.length) {
        alert(`${summary}\n\n` + (zh ? "注意：\n" : "Notes:\n") + warnings.join("\n"))
      } else {
        alert(summary)
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    } finally {
      setBulkCreatingRoster(false)
    }
  }

  async function saveCreate() {
    if (demo || !form.name.trim()) return
    const loginEmail = createLoginEmail.trim().toLowerCase()
    const loginPassword = createLoginPassword
    if (createLoginEnabled) {
      if (!loginEmail || loginPassword.length < 6) {
        alert(zh ? "若同時建立登入，請填有效 Email 與至少 6 碼密碼" : "For login creation, provide valid email and password (min 6 chars).")
        return
      }
    }
    setSaving(true)
    try {
      const created = await apiPost<Instructor>("/instructors", payloadFromForm(form))
      if (createLoginEnabled) {
        if (!created?.id) {
          throw new Error(zh ? "導師建立成功，但未取得 instructor id，無法建立登入" : "Teacher created but missing instructor id for login creation")
        }
        await apiPost("/coaches", {
          email: loginEmail,
          password: loginPassword,
          full_name: form.name.trim(),
          instructor_id: Number(created?.id),
        })
      }
      setModal(null)
      setForm(EMPTY_FORM)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit() {
    if (!editing || demo || !form.name.trim()) return
    setSaving(true)
    try {
      await apiPut(`/instructors/${editing.id}`, payloadFromForm(form))
      setModal(null)
      setEditing(null)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!editing || demo) return
    setSaving(true)
    try {
      await apiDelete(`/instructors/${editing.id}`)
      setModal(null)
      setEditing(null)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    } finally {
      setSaving(false)
    }
  }

  async function saveAvailability() {
    if (!editing || demo) return
    try {
      await apiPut(`/instructors/${editing.id}/availability`, { slots })
      alert(zh ? "已儲存空檔" : "Availability saved")
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  async function createPayroll() {
    if (!editing || demo) return
    try {
      await apiPost("/payroll", {
        instructor_id: editing.id,
        period_start: payForm.period_start,
        period_end: payForm.period_end,
        classes_count: Number(payForm.classes_count),
        amount: Number(payForm.amount),
      })
      const pay = await apiGet<Payroll[]>("/payroll")
      setPayroll((Array.isArray(pay) ? pay : []).filter((p) => p.instructor_id === editing.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "導師" : "Teachers"}
        Icon={GraduationCap}
        description={zh ? "頭像、簡介、資歷、院校與背景圖" : "Avatar, bio, credentials, school, background"}
      />

      <AdminCard>
        <AdminToolbar>
          <AdminInput
            className="w-full lg:max-w-sm"
            placeholder={zh ? "搜尋姓名、簡介、資歷、院校…" : "Search name, bio, credentials, school…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <AdminGhostButton
            type="button"
            className="w-full sm:w-auto justify-center"
            onClick={() => void addDefaultCompanionCoachRoster()}
            disabled={demo || bulkCreatingRoster}
          >
            <KeyRound className="h-4 w-4" />
            {bulkCreatingRoster
              ? zh
                ? "同步中…"
                : "Syncing…"
              : zh
                ? "同步 ClassZ 導師帳號"
                : "Sync ClassZ coach accounts"}
          </AdminGhostButton>
          <AdminPrimaryButton type="button" className="w-full sm:w-auto justify-center lg:ml-auto" onClick={openCreate} disabled={demo}>
            <Plus className="h-4 w-4" />
            {zh ? "新增導師" : "Add teacher"}
          </AdminPrimaryButton>
        </AdminToolbar>

        <AdminTableShell>
          <AdminTable className="min-w-[74rem]">
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-2 text-left">{zh ? "頭像" : "Avatar"}</th>
                <th className="px-3 py-2 text-left">{zh ? "姓名" : "Name"}</th>
                <th className="px-3 py-2 text-left min-w-[10rem]">{zh ? "老師簡介" : "Intro"}</th>
                <th className="px-3 py-2 text-left">{zh ? "資歷" : "Credentials"}</th>
                <th className="px-3 py-2 text-left">{zh ? "畢業/就讀院校" : "School"}</th>
                <th className="px-3 py-2 text-left">{zh ? "背景圖" : "Background"}</th>
                <th className="px-3 py-2 text-left">{zh ? "登入帳號" : "Login"}</th>
                <th className="px-3 py-2 text-right">{zh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {loadError ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-brand-coral">
                    {loadError}
                  </td>
                </tr>
              ) : null}
              {!loadError &&
                filtered.map((i) => {
                const coach = coachForInstructor(i.id, i.name)
                const active = coach ? coach.is_active !== false && Number(coach.isActivated) !== 0 : false
                return (
                <tr key={i.id} className="bg-white">
                  <td className="px-3 py-2">
                    <Thumb src={i.profile_image_url || i.avatar_url} alt={i.name} className="h-12 w-12 rounded-full" />
                  </td>
                  <td className="px-3 py-2 font-medium text-classz-800 whitespace-nowrap">{i.name}</td>
                  <td className="px-3 py-2 text-sm text-classz-600 min-w-[14rem] max-w-[16rem]">{clip(introForLocale(i, zh))}</td>
                  <td className="px-3 py-2 text-sm text-classz-600 min-w-[10rem] max-w-[12rem]">{awardsPreview(i.awards, zh)}</td>
                  <td className="px-3 py-2 text-sm min-w-[10rem]">{i.dance_school || "—"}</td>
                  <td className="px-3 py-2">
                    <Thumb src={i.background_image} alt="" className="h-10 w-16 rounded-md" />
                  </td>
                  <td className="px-3 py-2 text-sm min-w-[12rem]">
                    {coach ? (
                      <div className="space-y-0.5">
                        <div className="text-classz-800">{coach.email}</div>
                        <div className={active ? "text-brand-teal" : "text-classz-400"}>
                          {active ? (zh ? "啟用" : "Active") : zh ? "已停用" : "Inactive"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-classz-400">{zh ? "尚未建立" : "None"}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap justify-end gap-1.5 min-w-[15rem]">
                    <AdminGhostButton type="button" className="text-sm py-1 px-2" onClick={() => openLogin(i)} disabled={demo}>
                      <KeyRound className="h-3.5 w-3.5" />
                      {coach ? (zh ? "帳號" : "Login") : zh ? "建立登入" : "Create login"}
                    </AdminGhostButton>
                    <AdminGhostButton type="button" className="text-sm py-1 px-2" onClick={() => openEdit(i)}>
                      <Pencil className="h-3.5 w-3.5" />
                      {zh ? "編輯" : "Edit"}
                    </AdminGhostButton>
                    <AdminGhostButton type="button" className="text-sm py-1 px-2" onClick={() => openManage(i)}>
                      {zh ? "管理" : "Manage"}
                    </AdminGhostButton>
                    <button
                      type="button"
                      className="inline-flex items-center p-1.5 text-brand-coral hover:bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] rounded"
                      onClick={() => openDelete(i)}
                      aria-label={zh ? "刪除" : "Delete"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    </div>
                  </td>
                </tr>
              )})}
              {!loadError && !filtered.length ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-classz-500">
                    {demo ? (zh ? "請用中心帳號登入" : "Sign in with centre account") : zh ? "暫無導師" : "No teachers"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </AdminTable>
        </AdminTableShell>
      </AdminCard>

      {/* Create */}
      <AdminModal
        open={modal === "create"}
        title={zh ? "新增導師" : "Add teacher"}
        onClose={closeModal}
        footer={
          <>
            <AdminGhostButton type="button" onClick={closeModal} disabled={saving}>
              {zh ? "取消" : "Cancel"}
            </AdminGhostButton>
            <AdminPrimaryButton type="button" disabled={saving || !form.name.trim()} onClick={saveCreate}>
              {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "新增" : "Create"}
            </AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <ProfileFormFields form={form} setForm={setForm} zh={zh} demo={demo} />
          <div className="rounded-lg border border-classz-100 p-3">
            <label className="inline-flex items-center gap-2 text-sm text-classz-700">
              <input
                type="checkbox"
                checked={createLoginEnabled}
                onChange={(e) => setCreateLoginEnabled(e.target.checked)}
              />
              {zh ? "同時建立登入帳號" : "Create login account at the same time"}
            </label>
            {createLoginEnabled ? (
              <div className="mt-3 space-y-2">
                <div>
                  <AdminLabel>Email</AdminLabel>
                  <AdminInput
                    type="email"
                    value={createLoginEmail}
                    onChange={(e) => setCreateLoginEmail(e.target.value)}
                    placeholder="teacher@classz.co"
                  />
                </div>
                <div>
                  <AdminLabel>{zh ? "密碼（至少 6 碼）" : "Password (min 6)"}</AdminLabel>
                  <AdminInput
                    type="text"
                    value={createLoginPassword}
                    onChange={(e) => setCreateLoginPassword(e.target.value)}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </AdminModal>

      {/* Update */}
      <AdminModal
        open={modal === "edit"}
        title={zh ? "編輯導師" : "Edit teacher"}
        onClose={closeModal}
        footer={
          <>
            <AdminGhostButton type="button" onClick={closeModal} disabled={saving}>
              {zh ? "取消" : "Cancel"}
            </AdminGhostButton>
            <AdminPrimaryButton type="button" disabled={saving || !form.name.trim()} onClick={saveEdit}>
              {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "儲存" : "Save"}
            </AdminPrimaryButton>
          </>
        }
      >
        <ProfileFormFields form={form} setForm={setForm} zh={zh} demo={demo} />
      </AdminModal>

      {/* Delete */}
      <AdminModal
        open={modal === "delete"}
        title={zh ? "刪除導師" : "Delete teacher"}
        onClose={closeModal}
        footer={
          <>
            <AdminGhostButton type="button" onClick={closeModal} disabled={saving}>
              {zh ? "取消" : "Cancel"}
            </AdminGhostButton>
            <AdminDangerButton type="button" disabled={saving} onClick={confirmDelete}>
              {saving ? (zh ? "刪除中…" : "Deleting…") : zh ? "確認刪除" : "Delete"}
            </AdminDangerButton>
          </>
        }
      >
        <p className="text-sm text-classz-700">
          {zh
            ? `確定刪除「${editing?.name || ""}」？此操作無法復原。`
            : `Delete “${editing?.name || ""}”? This cannot be undone.`}
        </p>
      </AdminModal>

      {/* Login account */}
      <AdminModal
        open={modal === "login"}
        title={
          editing
            ? `${zh ? "登入帳號" : "Login"} · ${editing.name}`
            : zh
              ? "登入帳號"
              : "Login"
        }
        onClose={closeModal}
        footer={
          <>
            {editing && coachForInstructor(editing.id) ? (
              <AdminDangerButton
                type="button"
                disabled={saving}
                onClick={() => {
                  const c = coachForInstructor(editing.id)
                  if (c) void deactivateLogin(c)
                }}
              >
                {zh ? "停用" : "Deactivate"}
              </AdminDangerButton>
            ) : null}
            <AdminGhostButton type="button" onClick={closeModal} disabled={saving}>
              {zh ? "取消" : "Cancel"}
            </AdminGhostButton>
            <AdminPrimaryButton
              type="button"
              disabled={saving || !loginForm.email.trim() || loginForm.password.length < 6}
              onClick={saveLogin}
            >
              {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "儲存" : "Save"}
            </AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-classz-600">
            {zh
              ? "建立後導師可用此電郵登入，查看中心指派的任務。"
              : "Teachers can sign in with this email to see assigned tasks."}
          </p>
          <div>
            <AdminLabel>Email</AdminLabel>
            <AdminInput
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <AdminLabel>{zh ? "密碼（至少 6 碼）" : "Password (min 6)"}</AdminLabel>
            <AdminInput
              type="text"
              value={loginForm.password}
              onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
        </div>
      </AdminModal>

      {/* Manage (availability / payroll / performance) */}
      <AdminModal
        open={modal === "manage"}
        title={editing ? `${zh ? "管理" : "Manage"} · ${editing.name}` : zh ? "管理" : "Manage"}
        onClose={closeModal}
        footer={
          <AdminGhostButton type="button" onClick={closeModal}>
            {zh ? "關閉" : "Close"}
          </AdminGhostButton>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {(
              [
                ["availability", zh ? "空檔" : "Availability"],
                ["payroll", zh ? "薪資" : "Payroll"],
                ["performance", zh ? "表現" : "Performance"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`px-3 py-1.5 text-xs rounded-md border ${
                  tab === k ? "bg-classz-100 border-classz-400" : "border-classz-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "availability" ? (
            <div className="space-y-3">
              <ul className="text-sm space-y-1">
                {slots.map((s, idx) => (
                  <li key={idx} className="flex justify-between border-b border-classz-100 py-1">
                    <span>
                      {WEEKDAYS[s.weekday]} {s.start_time}–{s.end_time}
                    </span>
                    <button
                      type="button"
                      className="text-brand-coral text-xs"
                      onClick={() => setSlots(slots.filter((_, j) => j !== idx))}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-3 gap-2">
                <AdminSelect
                  value={String(newSlot.weekday)}
                  onChange={(e) => setNewSlot({ ...newSlot, weekday: Number(e.target.value) })}
                >
                  {WEEKDAYS.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </AdminSelect>
                <AdminInput
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                />
                <AdminInput
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <AdminGhostButton type="button" onClick={() => setSlots([...slots, newSlot])}>
                  {zh ? "加入時段" : "Add slot"}
                </AdminGhostButton>
                <AdminPrimaryButton type="button" onClick={saveAvailability}>
                  {zh ? "儲存" : "Save"}
                </AdminPrimaryButton>
              </div>
            </div>
          ) : null}

          {tab === "payroll" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <AdminLabel>Start</AdminLabel>
                  <AdminInput
                    type="date"
                    value={payForm.period_start}
                    onChange={(e) => setPayForm({ ...payForm, period_start: e.target.value })}
                  />
                </div>
                <div>
                  <AdminLabel>End</AdminLabel>
                  <AdminInput
                    type="date"
                    value={payForm.period_end}
                    onChange={(e) => setPayForm({ ...payForm, period_end: e.target.value })}
                  />
                </div>
                <div>
                  <AdminLabel>Classes</AdminLabel>
                  <AdminInput
                    value={payForm.classes_count}
                    onChange={(e) => setPayForm({ ...payForm, classes_count: e.target.value })}
                  />
                </div>
                <div>
                  <AdminLabel>Amount</AdminLabel>
                  <AdminInput
                    value={payForm.amount}
                    onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  />
                </div>
              </div>
              <AdminPrimaryButton type="button" onClick={createPayroll}>
                {zh ? "建立薪資單" : "Create payroll"}
              </AdminPrimaryButton>
              <ul className="text-sm space-y-1">
                {payroll.map((p) => (
                  <li key={p.id} className="border-b border-classz-100 py-1 flex justify-between">
                    <span>
                      {p.period_start} → {p.period_end}
                    </span>
                    <span>
                      HK${Number(p.amount).toLocaleString()} ({p.status})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {tab === "performance" ? (
            <pre className="text-xs bg-classz-50 p-3 rounded-md max-h-60 overflow-auto">
              {JSON.stringify(perf, null, 2)}
            </pre>
          ) : null}
        </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
