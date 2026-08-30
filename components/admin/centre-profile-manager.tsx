"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Building2, ExternalLink, Upload, UserCog } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { getClasszSession } from "@/lib/classz-auth"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import { CENTRE_CATEGORIES, HK_CENTRE_DISTRICTS } from "@/lib/register-center-validation"
import { ALL_CENTRE_FEATURES, type CentreFeatureKey } from "@/lib/centre-data"
import {
  AdminCard,
  AdminGhostButton,
  AdminInput,
  AdminLabel,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminTextarea,
} from "@/components/classz-admin-ui"

type Profile = {
  id: number
  center_name: string
  district: string | null
  category: string | null
  address: string | null
  description: string | null
  banner_url: string | null
  avatar_url: string | null
  features: CentreFeatureKey[]
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function CentreProfileManager() {
  const pathname = usePathname() || ""
  const router = useRouter()
  const { locale, t } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const session = getClasszSession()
  const platformScoped = /\/admin\/center-profiles\/\d+/.test(pathname)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState("")
  const [district, setDistrict] = useState("")
  const [category, setCategory] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [features, setFeatures] = useState<Set<CentreFeatureKey>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<"banner" | "avatar" | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user.role === "platform_admin" && !platformScoped) {
      router.replace("/admin/center-profiles")
    }
  }, [session?.user.role, platformScoped, router])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<Profile>("/profile")
      setProfile(data)
      setName(data.center_name || "")
      setDistrict(data.district || "")
      setCategory(data.category || "")
      setAddress(data.address || "")
      setDescription(data.description || "")
      setBannerUrl(data.banner_url || "")
      setAvatarUrl(data.avatar_url || "")
      setFeatures(new Set((data.features || []).filter(Boolean)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (demo) {
      setLoading(false)
      setError(zh ? "示範模式無法編輯中心資料" : "Demo mode cannot edit centre profile")
      return
    }
    void load()
  }, [demo, load, zh])

  async function upload(file: File, kind: "banner" | "avatar") {
    if (file.size > MAX_IMAGE_BYTES) {
      alert(zh ? "圖片須少於 5MB" : "Image must be under 5MB")
      return
    }
    if (!file.type.startsWith("image/")) {
      alert(zh ? "只接受圖片檔" : "Only image files are allowed")
      return
    }
    setUploading(kind)
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
      if (kind === "banner") setBannerUrl(url)
      else setAvatarUrl(url)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(null)
    }
  }

  function toggleFeature(key: CentreFeatureKey) {
    setFeatures((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const data = await apiPatch<Profile>("/profile", {
        center_name: name.trim(),
        district,
        category,
        address: address.trim(),
        description,
        banner_url: bannerUrl.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        features: [...features],
      })
      setProfile(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const membersHref = platformScoped && profile
    ? `/admin/center-profiles/${profile.id}/members`
    : "/admin/members"

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
        title={zh ? "中心資料" : "Centre profile"}
        Icon={Building2}
        description={
          zh
            ? "名稱、地址、簡介與服務標籤會同步到公開中心頁 /centres。"
            : "Name, address, description and service tags sync to the public /centres page."
        }
      />
      <AdminCard>
        {error ? (
          <div className="mb-3 text-sm text-brand-coral bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] rounded-md px-3 py-2">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <AdminLabel>{zh ? "中心名稱" : "Centre name"}</AdminLabel>
            <AdminInput value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <AdminLabel>{zh ? "地區" : "District"}</AdminLabel>
            <AdminSelect value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">{zh ? "選擇地區" : "Select district"}</option>
              {district && !(HK_CENTRE_DISTRICTS as readonly string[]).includes(district) ? (
                <option value={district}>{district}</option>
              ) : null}
              {HK_CENTRE_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div>
            <AdminLabel>{zh ? "教授類別" : "Teaching category"}</AdminLabel>
            <AdminSelect value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">{zh ? "選擇類別" : "Select category"}</option>
              {category && !CENTRE_CATEGORIES.some((c) => c.value === category) ? (
                <option value={category}>{category}</option>
              ) : null}
              {CENTRE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {zh ? c.zh : c.en}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div className="md:col-span-2">
            <AdminLabel>{zh ? "地址" : "Address"}</AdminLabel>
            <AdminInput value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <AdminLabel>{zh ? "簡介" : "Description"}</AdminLabel>
            <AdminTextarea
              className="min-h-[120px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <AdminLabel>{zh ? "Banner 圖" : "Banner image"}</AdminLabel>
            <div className="overflow-hidden rounded-lg border border-classz-100 bg-classz-50">
              {bannerUrl ? (
                <img src={resolveUploadUrl(bannerUrl)} alt="" className="h-36 w-full object-cover" />
              ) : (
                <div className="flex h-36 items-center justify-center text-sm text-classz-500">
                  {zh ? "尚未選擇" : "No image"}
                </div>
              )}
            </div>
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-classz-700">
              <Upload className="h-4 w-4" />
              {uploading === "banner" ? (zh ? "上傳中…" : "Uploading…") : zh ? "選擇圖片" : "Choose image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!!uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ""
                  if (file) void upload(file, "banner")
                }}
              />
            </label>
          </div>
          <div>
            <AdminLabel>{zh ? "頭像" : "Avatar"}</AdminLabel>
            <div className="overflow-hidden rounded-lg border border-classz-100 bg-classz-50">
              {avatarUrl ? (
                <img src={resolveUploadUrl(avatarUrl)} alt="" className="h-36 w-full object-cover" />
              ) : (
                <div className="flex h-36 items-center justify-center text-sm text-classz-500">
                  {zh ? "尚未選擇" : "No image"}
                </div>
              )}
            </div>
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-classz-700">
              <Upload className="h-4 w-4" />
              {uploading === "avatar" ? (zh ? "上傳中…" : "Uploading…") : zh ? "選擇圖片" : "Choose image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!!uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ""
                  if (file) void upload(file, "avatar")
                }}
              />
            </label>
          </div>
        </div>

        <div className="mt-5">
          <AdminLabel>{zh ? "服務標籤" : "Service tags"}</AdminLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {ALL_CENTRE_FEATURES.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-classz-100 px-3 py-2 hover:bg-classz-50"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={features.has(key)}
                  onChange={() => toggleFeature(key)}
                />
                <span>
                  <span className="block text-sm font-medium text-classz-700">
                    {t(`programs.serviceTags.${key}`)}
                  </span>
                  <span className="block text-xs text-classz-500">{t(`centres.featureDesc.${key}`)}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <AdminPrimaryButton onClick={() => void save()} disabled={saving || !name.trim()}>
            {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "儲存" : "Save"}
          </AdminPrimaryButton>
          <Link href={membersHref}>
            <AdminGhostButton>
              <UserCog className="h-4 w-4" />
              {zh ? "人員管理" : "Members"}
            </AdminGhostButton>
          </Link>
          {profile ? (
            <Link href={`/centres/${profile.id}`} target="_blank">
              <AdminGhostButton>
                <ExternalLink className="h-4 w-4" />
                {zh ? "預覽公開頁" : "View public page"}
              </AdminGhostButton>
            </Link>
          ) : null}
        </div>
      </AdminCard>
    </AdminPageFrame>
  )
}
