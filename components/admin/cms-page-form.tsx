"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { appendAudit } from "@/lib/classz-admin-store"
import { useAdminStore } from "@/components/admin/use-admin-store"
import {
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminTextarea,
} from "@/components/classz-admin-ui"

const TITLES: Record<string, { zh: string; en: string }> = {
  "course-intro": { zh: "課程介紹", en: "Course intro" },
  about: { zh: "關於我們", en: "About us" },
  contact: { zh: "聯絡我們", en: "Contact" },
  faq: { zh: "常見問題", en: "FAQ" },
  terms: { zh: "條款細則", en: "Terms" },
  privacy: { zh: "私隱政策", en: "Privacy policy" },
}

export function CmsPageForm({ pageKey }: { pageKey: string }) {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const { store, patch, ready } = useAdminStore()
  const [title, setTitle] = useState("")
  const [bodyHtml, setBodyHtml] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!store) return
    const c = store.cms[pageKey] ?? { title: "", bodyHtml: "" }
    setTitle(c.title)
    setBodyHtml(c.bodyHtml)
  }, [store, pageKey])

  function save() {
    if (!store) return
    patch((s) =>
      appendAudit(
        {
          ...s,
          cms: { ...s.cms, [pageKey]: { title: title.trim(), bodyHtml } },
        },
        { action: "save_cms", target_type: "cms", target_id: pageKey, details: title.trim() }
      )
    )
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const head = TITLES[pageKey] ?? { zh: pageKey, en: pageKey }

  if (!ready || !store) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader title={zh ? head.zh : head.en} />
      {saved ? <p className="text-base text-classz-600 border border-classz-200 bg-classz-50 px-3 py-2 rounded-md">{zh ? "已儲存到本機" : "Saved locally"}</p> : null}
      <AdminCard>
        <div className="space-y-4">
          <div>
            <AdminLabel>{zh ? "頁面標題" : "Page title"}</AdminLabel>
            <AdminInput value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <AdminLabel>HTML</AdminLabel>
            <AdminTextarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} />
          </div>
          <AdminPrimaryButton type="button" onClick={save}>
            <Save className="h-4 w-4" />
            {zh ? "儲存" : "Save"}
          </AdminPrimaryButton>
        </div>
      </AdminCard>
    </AdminPageFrame>
  )
}
