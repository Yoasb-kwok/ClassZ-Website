"use client"

import { useState } from "react"
import { Edit, Newspaper, Plus, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { appendAudit, newId, type NewsPost } from "@/lib/classz-admin-store"
import { useAdminStore } from "@/components/admin/use-admin-store"
import {
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminModal,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminTextarea,
} from "@/components/classz-admin-ui"

export function NewsManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const { store, patch, ready } = useAdminStore()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<NewsPost | null>(null)
  const [form, setForm] = useState({
    title_zh_tw: "",
    title_en: "",
    content_zh_tw: "",
    content_en: "",
    published_at: "",
    image_url: "",
    show_as_popup: false,
  })

  function openCreate() {
    setEditing(null)
    setForm({
      title_zh_tw: "",
      title_en: "",
      content_zh_tw: "<p></p>",
      content_en: "<p></p>",
      published_at: new Date().toISOString().slice(0, 10),
      image_url: "",
      show_as_popup: false,
    })
    setModal(true)
  }

  function openEdit(p: NewsPost) {
    setEditing(p)
    setForm({
      title_zh_tw: p.title_zh_tw,
      title_en: p.title_en,
      content_zh_tw: p.content_zh_tw,
      content_en: p.content_en,
      published_at: p.published_at.slice(0, 10),
      image_url: p.image_url ?? "",
      show_as_popup: p.show_as_popup,
    })
    setModal(true)
  }

  function save() {
    if (!store) return
    const post: NewsPost = {
      id: editing?.id ?? newId(),
      title_zh_tw: form.title_zh_tw.trim(),
      title_en: form.title_en.trim(),
      content_zh_tw: form.content_zh_tw,
      content_en: form.content_en,
      published_at: form.published_at,
      image_url: form.image_url.trim() || null,
      show_as_popup: form.show_as_popup,
    }
    if (editing) {
      patch((s) =>
        appendAudit(
          { ...s, newsPosts: s.newsPosts.map((x) => (x.id === editing.id ? post : x)) },
          { action: "update_news", target_type: "news", target_id: post.id, details: post.title_zh_tw }
        )
      )
    } else {
      patch((s) => appendAudit({ ...s, newsPosts: [post, ...s.newsPosts] }, { action: "create_news", target_type: "news", target_id: post.id, details: post.title_zh_tw }))
    }
    setModal(false)
  }

  function remove(id: string) {
    if (!confirm(zh ? "刪除此消息？" : "Delete this post?")) return
    patch((s) => appendAudit({ ...s, newsPosts: s.newsPosts.filter((x) => x.id !== id) }, { action: "delete_news", target_type: "news", target_id: id, details: "" }))
  }

  if (!ready || !store) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader title={zh ? "最新消息" : "News"} Icon={Newspaper} />
      <div className="flex justify-end">
        <AdminPrimaryButton type="button" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {zh ? "新增" : "Add post"}
        </AdminPrimaryButton>
      </div>
      <AdminCard>
        <ul className="divide-y divide-classz-100">
          {store.newsPosts.map((p) => (
            <li key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-semibold text-classz-700">{p.title_zh_tw}</p>
                <p className="text-base text-classz-600">{p.title_en}</p>
                <p className="text-base text-classz-500 mt-1">{p.published_at}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="p-2 text-classz-500 hover:bg-classz-50 rounded" onClick={() => openEdit(p)}>
                  <Edit className="h-4 w-4" />
                </button>
                <button type="button" className="p-2 text-brand-coral hover:bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] rounded" onClick={() => remove(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </AdminCard>

      <AdminModal
        open={modal}
        title={editing ? (zh ? "編輯消息" : "Edit post") : zh ? "新增消息" : "New post"}
        onClose={() => setModal(false)}
        footer={
          <>
            <button type="button" className="px-4 py-2.5 text-base text-classz-700 border border-classz-200 rounded-md hover:bg-classz-50" onClick={() => setModal(false)}>
              {zh ? "取消" : "Cancel"}
            </button>
            <AdminPrimaryButton onClick={save}>{zh ? "儲存" : "Save"}</AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <AdminLabel>標題 (ZH)</AdminLabel>
            <AdminInput value={form.title_zh_tw} onChange={(e) => setForm((f) => ({ ...f, title_zh_tw: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>Title (EN)</AdminLabel>
            <AdminInput value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "發布日" : "Published"}</AdminLabel>
            <AdminInput type="date" value={form.published_at} onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>Image URL</AdminLabel>
            <AdminInput value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
          </div>
          <label className="flex items-center gap-2 text-base text-classz-700">
            <input type="checkbox" checked={form.show_as_popup} onChange={(e) => setForm((f) => ({ ...f, show_as_popup: e.target.checked }))} />
            {zh ? "首頁彈窗" : "Show as popup"}
          </label>
          <div>
            <AdminLabel>Content (ZH) HTML</AdminLabel>
            <AdminTextarea value={form.content_zh_tw} onChange={(e) => setForm((f) => ({ ...f, content_zh_tw: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>Content (EN) HTML</AdminLabel>
            <AdminTextarea value={form.content_en} onChange={(e) => setForm((f) => ({ ...f, content_en: e.target.value }))} />
          </div>
        </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
