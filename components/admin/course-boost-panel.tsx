"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { useLanguage } from "@/components/language-provider"
import { apiGet, apiPost } from "@/lib/classz-api-client"
import {
  AdminCard,
  AdminPrimaryButton,
} from "@/components/classz-admin-ui"

type BoostPackage = {
  plan_days: number
  amount: number
  label_en: string
  label_zh: string
}

type BoostCourse = {
  id: number
  name: string
  publish_status: string
  course_type?: string | null
  listing?: "course" | "workshop" | string | null
  boosted: boolean
  boost_paid_at: string | null
  boost_expires_at: string | null
  queue_position: number | null
}

type BoostRow = {
  id: number
  course_id: number
  course_name: string | null
  listing?: "course" | "workshop" | string | null
  plan_days: number
  amount: number
  payment_status: string
  paid_at: string | null
  expires_at: string | null
  active: boolean
  queue_position: number | null
}

type BoostPayload = {
  packages: BoostPackage[]
  courses: BoostCourse[]
  active: BoostRow[]
  history: BoostRow[]
}

function formatWhen(raw: string | null, zh: boolean) {
  if (!raw) return "—"
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return String(raw)
  return d.toLocaleString(zh ? "zh-HK" : "en-HK", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function isWorkshopListing(courseType?: string | null, listing?: string | null) {
  if (listing === "workshop" || listing === "course" || listing === "trial") return listing === "workshop"
  const t = String(courseType || "").trim().toLowerCase()
  return t === "short_term" || t === "summer"
}

function matchesBoostTab(courseType?: string | null, listing?: string | null, tab?: "course" | "workshop") {
  const kind =
    listing === "workshop" || listing === "course" || listing === "trial"
      ? listing
      : isWorkshopListing(courseType)
        ? "workshop"
        : String(courseType || "").trim().toLowerCase() === "trial"
          ? "trial"
          : "course"
  return kind === tab
}

export function CourseBoostPanel({ listing = "course" }: { listing?: "course" | "workshop" }) {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const searchParams = useSearchParams()
  const [data, setData] = useState<BoostPayload | null>(null)
  const [loading, setLoading] = useState(!demo)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [planDays, setPlanDays] = useState<7 | 14>(7)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (demo) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const next = await apiGet<BoostPayload>("/marketing/boosts")
      setData(next)
      setError(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Load failed"
      setError(
        /404|not found/i.test(msg)
          ? zh
            ? "置頂 API 未載入，請重新整理頁面。若仍失敗，請確認 API 已重啟。"
            : "Pin API is not loaded yet. Refresh the page. If it persists, restart the API."
          : msg,
      )
    } finally {
      setLoading(false)
    }
  }, [demo])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const sid = searchParams.get("session_id")
    if (!sid || demo) return
    let cancelled = false
    ;(async () => {
      try {
        const next = await apiGet<BoostPayload>(
          `/marketing/boosts/checkout-status?session_id=${encodeURIComponent(sid)}`,
        )
        if (cancelled) return
        setData(next)
        setNotice(
          listing === "workshop"
            ? zh
              ? "付款成功，工作坊已置頂到前台列表。"
              : "Payment received. Your workshops are pinned to the top."
            : zh
              ? "付款成功，課程已置頂到前台列表。"
              : "Payment received. Your courses are pinned to the top.",
        )
        setSelected(new Set())
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Confirm failed")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [demo, searchParams, zh, listing])

  useEffect(() => {
    if (searchParams.get("cancelled") === "1") {
      setNotice(zh ? "已取消付款，沒有置頂。" : "Checkout cancelled. No boost applied.")
    }
  }, [searchParams, zh])

  useEffect(() => {
    setSelected(new Set())
  }, [listing])

  const packages = [
    {
      plan_days: 7 as const,
      amount: 199,
      label_en: listing === "workshop" ? "7-day workshop boost" : "7-day listing boost",
      label_zh: listing === "workshop" ? "7 日工作坊置頂" : "7 日課程置頂",
    },
    {
      plan_days: 14 as const,
      amount: 359,
      label_en: listing === "workshop" ? "14-day workshop boost" : "14-day listing boost",
      label_zh: listing === "workshop" ? "14 日工作坊置頂" : "14 日課程置頂",
    },
  ]
  const pkg = packages.find((p) => p.plan_days === planDays) || packages[0]
  const inPanel = (c: { listing?: string | null; course_type?: string | null }) =>
    matchesBoostTab(c.course_type, c.listing, listing)
  const published = useMemo(
    () => (data?.courses || []).filter((c) => c.publish_status === "published" && inPanel(c)),
    [data, listing],
  )
  const drafts = useMemo(
    () => (data?.courses || []).filter((c) => c.publish_status !== "published" && inPanel(c)),
    [data, listing],
  )
  const active = useMemo(
    () => (data?.active || []).filter((b) => inPanel(b)),
    [data, listing],
  )
  const total = (pkg?.amount || 0) * selected.size

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function pay() {
    if (demo || busy || !selected.size) return
    setBusy(true)
    setNotice(null)
    try {
      const result = await apiPost<{ url?: string | null }>("/marketing/boosts/checkout", {
        course_ids: Array.from(selected),
        plan_days: pkg.plan_days,
        listing,
      })
      if (result?.url) {
        window.location.href = result.url
        return
      }
      setError(zh ? "未能開啟付款頁。" : "Could not open checkout.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <AdminCard>
        <p className="text-sm text-classz-600 leading-relaxed">
          {listing === "workshop"
            ? zh
              ? "把已上架工作坊置頂到前台工作坊列表。先付款者排最前；有效期內續費會延長置頂、保留原來的排隊位置。"
              : "Pin published workshops to the top of the public workshop list. Whoever pays first stays on top. Renewing while still active extends the pin and keeps your queue slot."
            : zh
              ? "把已上架課程置頂到前台課程列表。先付款者排最前；有效期內續費會延長置頂、保留原來的排隊位置。"
              : "Pin published courses to the top of the public course list. Whoever pays first stays on top. Renewing while still active extends the pin and keeps your queue slot."}
        </p>
      </AdminCard>

      {notice ? (
        <p className="rounded-md border border-classz-200 bg-classz-50 px-3 py-2 text-sm text-classz-700">{notice}</p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      {demo ? (
        <p className="rounded-md border border-classz-200 bg-classz-50 px-3 py-2 text-sm text-classz-600">
          {zh ? "示範模式無法付款。請用中心帳號登入。" : "Demo session cannot pay. Sign in with a centre account."}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {packages.map((p) => {
          const on = p.plan_days === planDays
          return (
            <button
              key={p.plan_days}
              type="button"
              onClick={() => setPlanDays(p.plan_days === 14 ? 14 : 7)}
              className={`rounded-xl border p-4 text-left transition ${
                on ? "border-classz-400 bg-classz-50" : "border-classz-100 bg-white hover:border-classz-300"
              }`}
            >
              <p className="text-sm font-medium text-classz-500">{zh ? p.label_zh : p.label_en}</p>
              <p className="mt-1 text-2xl font-semibold text-classz-700">HK${p.amount}</p>
              <p className="mt-1 text-xs text-classz-500">
                {zh
                  ? listing === "workshop"
                    ? `每場工作坊 · ${p.plan_days} 日`
                    : `每堂課程 · ${p.plan_days} 日`
                  : listing === "workshop"
                    ? `per workshop · ${p.plan_days} days`
                    : `per course · ${p.plan_days} days`}
              </p>
            </button>
          )
        })}
      </div>

      <AdminCard>
        <h2 className="mb-3 text-base font-semibold text-classz-700">
          {listing === "workshop"
            ? zh
              ? "選擇要置頂的工作坊"
              : "Choose workshops to pin"
            : zh
              ? "選擇要置頂的課程"
              : "Choose courses to pin"}
        </h2>
        {loading ? (
          <p className="py-6 text-center text-classz-500">{zh ? "載入中…" : "Loading…"}</p>
        ) : (
          <ul className="divide-y divide-classz-100 text-sm">
            {published.map((c) => (
              <li key={c.id} className="flex items-start gap-3 py-2.5">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selected.has(c.id)}
                  onChange={() => toggle(c.id)}
                  disabled={demo}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-classz-700">{c.name}</p>
                  {c.boosted ? (
                    <p className="text-xs text-classz-500">
                      {zh ? `置頂中 · 排隊 #${c.queue_position ?? "—"} · 至 ` : `Pinned · queue #${c.queue_position ?? "—"} · until `}
                      {formatWhen(c.boost_expires_at, zh)}
                    </p>
                  ) : (
                    <p className="text-xs text-classz-400">{zh ? "已上架" : "Published"}</p>
                  )}
                </div>
              </li>
            ))}
            {!published.length ? (
              <li className="py-6 text-center text-classz-500">
                {zh
                  ? listing === "workshop"
                    ? "沒有已上架工作坊。請先到營運 → 工作坊發佈。"
                    : "沒有已上架課程。請先到課程上架發佈。"
                  : listing === "workshop"
                    ? "No published workshops. Publish a short-term or summer workshop first."
                    : "No published courses. Publish a course first."}
              </li>
            ) : null}
          </ul>
        )}
        {drafts.length ? (
          <p className="mt-3 text-xs text-classz-400">
            {zh
              ? listing === "workshop"
                ? `${drafts.length} 場未上架工作坊無法置頂。`
                : `${drafts.length} 堂未上架課程無法置頂。`
              : listing === "workshop"
                ? `${drafts.length} unpublished workshop(s) cannot be pinned.`
                : `${drafts.length} unpublished course(s) cannot be pinned.`}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-classz-100 pt-4">
          <p className="text-sm text-classz-600">
            {zh
              ? listing === "workshop"
                ? `已選 ${selected.size} 場 · 合計 `
                : `已選 ${selected.size} 堂 · 合計 `
              : `${selected.size} selected · total `}
            <strong className="text-classz-700">HK${total}</strong>
          </p>
          <AdminPrimaryButton type="button" onClick={() => void pay()} disabled={demo || busy || selected.size === 0}>
            {busy ? (zh ? "前往付款…" : "Opening checkout…") : zh ? "前往付款" : "Pay to pin"}
          </AdminPrimaryButton>
        </div>
      </AdminCard>

      <AdminCard>
        <h2 className="mb-3 text-base font-semibold text-classz-700">{zh ? "目前置頂" : "Active pins"}</h2>
        <ul className="divide-y divide-classz-100 text-sm">
          {active.map((b) => (
            <li key={b.id} className="flex flex-wrap justify-between gap-2 py-2">
              <span>
                <strong>#{b.queue_position ?? "—"}</strong> {b.course_name || `#${b.course_id}`}
                <span className="text-classz-400"> · {b.plan_days}d</span>
              </span>
              <span className="text-classz-500">
                {zh ? "至 " : "until "}
                {formatWhen(b.expires_at, zh)}
              </span>
            </li>
          ))}
          {!active.length ? (
            <li className="py-6 text-center text-classz-500">
              {zh
                ? listing === "workshop"
                  ? "尚未有置頂工作坊"
                  : "尚未有置頂課程"
                : listing === "workshop"
                  ? "No active workshop pins"
                  : "No active pins"}
            </li>
          ) : null}
        </ul>
      </AdminCard>
    </div>
  )
}
