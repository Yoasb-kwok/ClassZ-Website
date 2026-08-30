"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Pencil, Plus, Trash2, Upload, UserCog } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { getClasszSession } from "@/lib/classz-auth"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
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
} from "@/components/classz-admin-ui"

type Member = {
  id: number
  name: string
  role: string
  photo_url?: string | null
  user_id?: number | null
  sort_order?: number
}

type StaffAccount = {
  id: number
  email: string
  full_name?: string | null
  name?: string | null
  role?: string | null
}

const ROLE_PRESETS = [
  { value: "Centre Manager", zh: "中心經理", en: "Centre Manager" },
  { value: "Program Coach", zh: "課程教練", en: "Program Coach" },
  { value: "Teacher", zh: "導師", en: "Teacher" },
  { value: "Admin", zh: "管理員", en: "Admin" },
] as const

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function emptyForm() {
  return { name: "", role: "Centre Manager", customRole: "", photo_url: "", user_id: "", sort_order: "0" }
}

export function CentreMembersManager() {
  const pathname = usePathname() || ""
  const router = useRouter()
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const session = getClasszSession()
  const platformScoped = /\/admin\/center-profiles\/\d+/.test(pathname)
  const profileHref = platformScoped
    ? pathname.replace(/\/members\/?$/, "")
    : "/admin/centre-profile"

  const [rows, setRows] = useState<Member[]>([])
  const [staff, setStaff] = useState<StaffAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [editing, setEditing] = useState<Member | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (session?.user.role === "platform_admin" && !platformScoped) {
      router.replace("/admin/center-profiles")
    }
  }, [session?.user.role, platformScoped, router])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [members, coaches] = await Promise.all([
        apiGet<Member[]>("/profile-members"),
        apiGet<StaffAccount[]>("/coaches").catch(() => []),
      ])
      setRows(Array.isArray(members) ? members : [])
      setStaff(Array.isArray(coaches) ? coaches : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (demo) {
      setLoading(false)
      setError(zh ? "示範模式無法編輯人員" : "Demo mode cannot edit members")
      return
    }
    void load()
  }, [demo, load, zh])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setModal("create")
  }

  function openEdit(row: Member) {
    const preset = ROLE_PRESETS.some((r) => r.value === row.role)
    setEditing(row)
    setForm({
      name: row.name,
      role: preset ? row.role : "custom",
      customRole: preset ? "" : row.role,
      photo_url: row.photo_url || "",
      user_id: row.user_id != null ? String(row.user_id) : "",
      sort_order: String(row.sort_order ?? 0),
    })
    setModal("edit")
  }

  function applyStaff(id: string) {
    const person = staff.find((s) => String(s.id) === id)
    if (!person) {
      setForm((f) => ({ ...f, user_id: id }))
      return
    }
    const portal = String(person.role || "").toLowerCase()
    const defaultRole = portal === "center_admin" ? "Centre Manager" : "Program Coach"
    setForm((f) => ({
      ...f,
      user_id: id,
      name: f.name || person.full_name || person.name || person.email,
      role: ROLE_PRESETS.some((r) => r.value === f.role) ? defaultRole : f.role,
    }))
  }

  async function uploadPhoto(file: File) {
    if (file.size > MAX_IMAGE_BYTES) {
      alert(zh ? "圖片須少於 5MB" : "Image must be under 5MB")
      return
    }
    if (!file.type.startsWith("image/")) {
      alert(zh ? "只接受圖片檔" : "Only image files are allowed")
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
      setForm((f) => ({ ...f, photo_url: url }))
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  function resolvedRole() {
    return form.role === "custom" ? form.customRole.trim() : form.role
  }

  async function save() {
    const role = resolvedRole()
    if (!form.name.trim() || !role) {
      alert(zh ? "請填寫姓名與角色" : "Name and role are required")
      return
    }
    setSaving(true)
    try {
      const body = {
        name: form.name.trim(),
        role,
        photo_url: form.photo_url.trim() || null,
        user_id: form.user_id ? Number(form.user_id) : null,
        sort_order: Number(form.sort_order) || 0,
      }
      if (modal === "edit" && editing) {
        await apiPatch(`/profile-members/${editing.id}`, body)
      } else {
        await apiPost("/profile-members", body)
      }
      setModal(null)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function remove(row: Member) {
    if (!confirm(zh ? `刪除 ${row.name}？` : `Delete ${row.name}?`)) return
    try {
      await apiDelete(`/profile-members/${row.id}`)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed")
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
      <AdminPageHeader
        title={zh ? "人員管理" : "Members"}
        Icon={UserCog}
        description={
          zh
            ? "設定公開中心頁顯示的成員，並指派角色（中心經理／教練／導師等）。"
            : "People shown on the public centre page, with assignable roles."
        }
      />
      <AdminCard>
        {error ? (
          <div className="mb-3 text-sm text-brand-coral bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] rounded-md px-3 py-2">
            {error}
          </div>
        ) : null}
        <div className="mb-4 flex flex-wrap gap-2">
          <AdminPrimaryButton onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {zh ? "新增人員" : "Add member"}
          </AdminPrimaryButton>
          <Link href={profileHref}>
            <AdminGhostButton>{zh ? "返回中心資料" : "Back to profile"}</AdminGhostButton>
          </Link>
        </div>
        <AdminTableShell>
          <AdminTable>
            <thead>
              <tr className="border-b border-classz-100 text-left text-xs uppercase tracking-wide text-classz-500">
                <th className="px-3 py-2">{zh ? "照片" : "Photo"}</th>
                <th className="px-3 py-2">{zh ? "姓名" : "Name"}</th>
                <th className="px-3 py-2">{zh ? "角色" : "Role"}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-classz-500">
                    {zh ? "尚未加入人員" : "No members yet"}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-classz-50">
                    <td className="px-3 py-2">
                      {row.photo_url ? (
                        <img
                          src={resolveUploadUrl(row.photo_url)}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-classz-50 text-xs text-classz-400">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium">{row.name}</td>
                    <td className="px-3 py-2">{row.role}</td>
                    <td className="px-3 py-2 text-right">
                      <AdminGhostButton size="sm" onClick={() => openEdit(row)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </AdminGhostButton>
                      <AdminDangerButton size="sm" className="ml-1" onClick={() => void remove(row)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </AdminDangerButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </AdminTable>
        </AdminTableShell>
      </AdminCard>

      <AdminModal
        open={modal != null}
        title={modal === "edit" ? (zh ? "編輯人員" : "Edit member") : zh ? "新增人員" : "Add member"}
        onClose={() => setModal(null)}
        footer={
          <>
            <AdminGhostButton onClick={() => setModal(null)}>{zh ? "取消" : "Cancel"}</AdminGhostButton>
            <AdminPrimaryButton onClick={() => void save()} disabled={saving}>
              {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "儲存" : "Save"}
            </AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          {staff.length > 0 ? (
            <div>
              <AdminLabel>{zh ? "從現有帳戶帶入" : "Fill from existing staff"}</AdminLabel>
              <AdminSelect value={form.user_id} onChange={(e) => applyStaff(e.target.value)}>
                <option value="">{zh ? "不連結帳戶" : "Not linked"}</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.name || s.email} ({s.role || "staff"})
                  </option>
                ))}
              </AdminSelect>
            </div>
          ) : null}
          <div>
            <AdminLabel>{zh ? "姓名" : "Name"}</AdminLabel>
            <AdminInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "角色" : "Role"}</AdminLabel>
            <AdminSelect value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              {ROLE_PRESETS.map((r) => (
                <option key={r.value} value={r.value}>
                  {zh ? r.zh : r.en}
                </option>
              ))}
              <option value="custom">{zh ? "自訂" : "Custom"}</option>
            </AdminSelect>
          </div>
          {form.role === "custom" ? (
            <div>
              <AdminLabel>{zh ? "自訂角色" : "Custom role"}</AdminLabel>
              <AdminInput
                value={form.customRole}
                onChange={(e) => setForm((f) => ({ ...f, customRole: e.target.value }))}
              />
            </div>
          ) : null}
          <div>
            <AdminLabel>{zh ? "照片" : "Photo"}</AdminLabel>
            {form.photo_url ? (
              <img src={resolveUploadUrl(form.photo_url)} alt="" className="mb-2 h-20 w-20 rounded-md object-cover" />
            ) : null}
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-classz-700">
              <Upload className="h-4 w-4" />
              {uploading ? (zh ? "上傳中…" : "Uploading…") : zh ? "選擇圖片" : "Choose image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ""
                  if (file) void uploadPhoto(file)
                }}
              />
            </label>
          </div>
        </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
