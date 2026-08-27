"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CreditCard } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { getClasszSession } from "@/lib/classz-auth"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet, apiPost } from "@/lib/classz-api-client"
import { PlanPricingTable, type PricingTier } from "@/components/pricing/plan-pricing-table"
import { AdminPageFrame, AdminPageHeader } from "@/components/classz-admin-ui"
import type { BillingCycle } from "@/lib/subscription-plans"

type SubscriptionPayload = {
  plan_tier: string
  effective_plan: string
  plan_expires_at: string | null
  expired?: boolean
  basic_plan: string
  current?: PricingTier | null
  tiers: PricingTier[]
}

export function SubscriptionManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const session = getClasszSession()
  const searchParams = useSearchParams()
  const isPlatform = session?.user.role === "platform_admin"
  const [data, setData] = useState<SubscriptionPayload | null>(null)
  const [previewTiers, setPreviewTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [billing, setBilling] = useState<BillingCycle>("yearly")

  const load = useCallback(async () => {
    if (demo && !isPlatform) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      if (isPlatform) {
        const next = await apiGet<{ tiers?: PricingTier[] }>("/permissions/plans", "platform_admin")
        setPreviewTiers(Array.isArray(next?.tiers) ? next.tiers : [])
      } else {
        const next = await apiGet<SubscriptionPayload>("/subscription")
        setData(next)
      }
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
    } finally {
      setLoading(false)
    }
  }, [demo, isPlatform])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const sid = searchParams.get("session_id")
    if (!sid || demo || isPlatform) return
    let cancelled = false
    ;(async () => {
      try {
        const next = await apiGet<SubscriptionPayload>(
          `/subscription/checkout-status?session_id=${encodeURIComponent(sid)}`,
        )
        if (cancelled) return
        setData(next)
        setNotice(zh ? "付款成功，方案已更新。" : "Payment received. Plan updated.")
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Confirm failed")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [demo, isPlatform, searchParams, zh])

  useEffect(() => {
    if (searchParams.get("cancelled") === "1") {
      setNotice(zh ? "已取消付款，方案沒有更改。" : "Checkout cancelled. Plan unchanged.")
    }
  }, [searchParams, zh])

  async function choose(tier: PricingTier, cycle: BillingCycle) {
    if (demo || isPlatform) return
    setBusy(tier.slug)
    setNotice(null)
    try {
      const result = await apiPost<{ url?: string | null; applied?: boolean }>(
        "/subscription/checkout",
        { plan_tier: tier.slug, billing_cycle: cycle },
      )
      if (result?.url) {
        window.location.href = result.url
        return
      }
      await load()
      setNotice(zh ? "方案已更新。" : "Plan updated.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusy(null)
    }
  }

  async function keepBasic() {
    if (demo || isPlatform) return
    const ok = window.confirm(
      zh ? "確定改回基礎方案？付費功能會即時停用。" : "Switch back to Basic? Paid features stop immediately.",
    )
    if (!ok) return
    setBusy("free")
    setNotice(null)
    try {
      await apiPost("/subscription/checkout", { plan_tier: "free" })
      await load()
      setNotice(zh ? "已保留基礎方案。" : "Kept the basic plan.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusy(null)
    }
  }

  const current = data?.effective_plan || data?.plan_tier || "free"
  const stored = data?.plan_tier || "free"
  const basic = data?.basic_plan || "free"
  const onBasic = current === basic
  const tiers = isPlatform ? previewTiers : data?.tiers || []

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "訂閱方案" : "Subscription plan"}
        Icon={CreditCard}
        description={
          isPlatform
            ? zh
              ? "這是中心看到的方案卡。要指定某中心的方案與到期日，請到中心審核或中心帳戶。"
              : "This is the plan table centres see. Assign a centre’s plan and expiry on Centres or Centre accounts."
            : zh
              ? "可保留基礎方案，或升級後以 Stripe 付款。到期後會自動回到基礎方案。"
              : "Keep Basic, or upgrade and pay with Stripe. Expired paid plans fall back to Basic."
        }
      />
      {isPlatform ? (
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/admin/centers" className="font-medium text-brand-teal underline">
            {zh ? "中心審核" : "Centres"}
          </Link>
          <Link href="/admin/center-accounts" className="font-medium text-brand-teal underline">
            {zh ? "中心帳戶" : "Centre accounts"}
          </Link>
        </div>
      ) : null}
      {error ? <p className="text-sm text-brand-coral">{error}</p> : null}
      {notice ? <p className="text-sm text-brand-teal">{notice}</p> : null}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {!isPlatform ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
              <p className="text-sm text-classz-600">
                {zh ? "目前有效方案" : "Current plan"}{" "}
                <span className="font-semibold text-classz-800">
                  {data?.current ? (zh ? data.current.labelZh : data.current.labelEn) : current}
                </span>
                {data?.plan_expires_at ? (
                  <span className="text-classz-500">
                    {" "}
                    · {zh ? "到期" : "Expires"} {data.plan_expires_at}
                  </span>
                ) : stored === "free" ? (
                  <span className="text-classz-500"> · {zh ? "無到期日" : "No expiry"}</span>
                ) : null}
                {data?.expired ? (
                  <span className="text-brand-coral"> · {zh ? "已到期，已回到基礎方案" : "Expired, back on Basic"}</span>
                ) : null}
              </p>
              {!onBasic ? (
                <button
                  type="button"
                  disabled={Boolean(busy) || demo}
                  onClick={() => void keepBasic()}
                  className="text-sm font-medium text-classz-600 underline disabled:opacity-50"
                >
                  {busy === "free" ? (zh ? "處理中…" : "Working…") : zh ? "改回基礎方案" : "Switch to Basic"}
                </button>
              ) : null}
            </div>
          ) : null}
          <PlanPricingTable
            tiers={tiers}
            billing={billing}
            onBillingChange={setBilling}
            currentSlug={isPlatform ? null : current}
            busySlug={busy}
            interactive={!demo && !isPlatform}
            zh={zh}
            onChoose={(tier, cycle) => void choose(tier, cycle)}
          />
          {demo && !isPlatform ? (
            <p className="text-sm text-classz-500">{zh ? "請用中心帳號登入" : "Sign in with a centre account"}</p>
          ) : null}
        </div>
      )}
    </AdminPageFrame>
  )
}
