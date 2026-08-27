"use client"

import { Check } from "lucide-react"
import {
  SALES_EMAIL,
  SUBSCRIPTION_PLANS,
  YEARLY_SAVE_RATE,
  monthlyListPrice,
  yearlyMonthlyEquivalent,
  type BillingCycle,
} from "@/lib/subscription-plans"

export type PricingTier = {
  slug: string
  labelEn: string
  labelZh: string
  max_teachers: number | null
  max_students: number | null
  price_hkd: number
  price_monthly_hkd?: number
  price_monthly_equivalent_hkd?: number
  yearly_discount_pct?: number
  introEn?: string
  introZh?: string
  priceCaptionEn?: string
  priceCaptionZh?: string
  featuresEn?: string[]
  featuresZh?: string[]
  contact_sales?: boolean
}

type PlanPricingTableProps = {
  tiers: PricingTier[]
  billing: BillingCycle
  onBillingChange: (cycle: BillingCycle) => void
  currentSlug?: string | null
  busySlug?: string | null
  interactive?: boolean
  zh: boolean
  onChoose: (tier: PricingTier, billing: BillingCycle) => void
}

function catalog(slug: string) {
  return SUBSCRIPTION_PLANS[slug]
}

function featuresFor(tier: PricingTier, zh: boolean) {
  const fromApi = zh ? tier.featuresZh : tier.featuresEn
  if (fromApi && fromApi.length) return fromApi
  const plan = catalog(tier.slug)
  return plan ? (zh ? plan.featuresZh : plan.featuresEn) : []
}

function introFor(tier: PricingTier, zh: boolean) {
  const fromApi = zh ? tier.introZh : tier.introEn
  if (fromApi && fromApi.trim()) return fromApi
  const plan = catalog(tier.slug)
  if (plan) return zh ? plan.introZh : plan.introEn
  return zh ? "包含：" : "Includes:"
}

function captionFor(tier: PricingTier, zh: boolean, sales: boolean) {
  const fromApi = zh ? tier.priceCaptionZh : tier.priceCaptionEn
  if (fromApi && fromApi.trim()) return fromApi
  if (sales) return zh ? "按需要報價" : "Custom needs."
  return zh ? "每中心／每月" : "per centre / per month"
}

function discountRate(tier: PricingTier) {
  if (tier.yearly_discount_pct == null) return YEARLY_SAVE_RATE
  const n = Number(tier.yearly_discount_pct)
  if (!Number.isFinite(n) || n < 0) return YEARLY_SAVE_RATE
  return Math.min(90, n) / 100
}

function displayAmount(tier: PricingTier, billing: BillingCycle) {
  const yearly = Number(tier.price_hkd) || 0
  const rate = discountRate(tier)
  if (billing === "monthly") {
    return tier.price_monthly_hkd != null ? Number(tier.price_monthly_hkd) : monthlyListPrice(yearly, rate)
  }
  return tier.price_monthly_equivalent_hkd != null
    ? Number(tier.price_monthly_equivalent_hkd)
    : yearlyMonthlyEquivalent(yearly)
}

export function PlanPricingTable({
  tiers,
  billing,
  onBillingChange,
  currentSlug,
  busySlug,
  interactive = true,
  zh,
  onChoose,
}: PlanPricingTableProps) {
  const cards = tiers.filter((t) => t.slug !== "free")
  const savePcts = cards.map((t) => Math.round(discountRate(t) * 100)).filter((n) => n > 0)
  const savePct = savePcts.length ? Math.max(...savePcts) : Math.round(YEARLY_SAVE_RATE * 100)
  const yearlyOn = billing === "yearly"

  return (
    <div className="space-y-8 rounded-3xl bg-[#f6f6f7] px-4 py-8 sm:px-8">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 text-sm">
          <span className={yearlyOn ? "text-classz-500" : "font-semibold text-classz-800"}>
            {zh ? "月繳" : "Monthly"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={yearlyOn}
            aria-label={zh ? "年繳或月繳" : "Yearly or monthly billing"}
            onClick={() => onBillingChange(yearlyOn ? "monthly" : "yearly")}
            className="relative h-7 w-12 shrink-0 rounded-full bg-brand-teal"
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[left] ${
                yearlyOn ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
          <span className={yearlyOn ? "font-semibold text-classz-800" : "text-classz-500"}>
            {zh ? "年繳" : "Yearly"}
          </span>
        </div>
        <p className={`text-sm ${yearlyOn ? "text-brand-teal" : "invisible"}`}>
          {zh ? `年繳慳 ${savePct}%` : `Save ${savePct}% annually`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {cards.map((tier) => {
          const name = zh ? tier.labelZh : tier.labelEn
          const yearly = Number(tier.price_hkd) || 0
          const sales = Boolean(tier.contact_sales) || (tier.slug === "enterprise" && !(yearly > 0))
          const amount = displayAmount(tier, billing)
          const caption = captionFor(tier, zh, sales)
          const active = tier.slug === currentSlug
          const busy = busySlug === tier.slug
          const items = featuresFor(tier, zh)

          let cta = zh ? "選擇此方案" : "Choose plan"
          if (active) cta = zh ? "使用中" : "Current plan"
          else if (sales) cta = zh ? "預約了解" : "Get a demo"
          else if (busy) cta = zh ? "處理中…" : "Working…"

          let footnote = zh ? "隨時可傾" : "Always happy to chat"
          if (!sales) {
            footnote = yearlyOn
              ? zh
                ? "一次過年繳，有效 365 日"
                : "Billed once a year, 365 days"
              : zh
                ? "按月繳，每次有效 30 日"
                : "Billed monthly, 30 days at a time"
          }

          return (
            <article
              key={tier.slug}
              className={`flex h-full flex-col rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ${
                active ? "ring-2 ring-brand-teal" : ""
              }`}
            >
              <h2 className="text-2xl font-semibold tracking-tight text-classz-800">{name}</h2>
              <div className="mt-5 min-h-[4.5rem]">
                {sales || !(yearly > 0) ? (
                  <p className="text-3xl font-semibold tracking-tight text-classz-800">{caption}</p>
                ) : (
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-5xl font-semibold tracking-tight text-classz-800">
                      HK${amount.toLocaleString()}
                    </span>
                    <span className="text-sm text-classz-500">{caption}</span>
                  </p>
                )}
              </div>
              <p className="mt-6 text-sm text-classz-500">{introFor(tier, zh)}</p>
              <ul className="mt-4 flex-1 space-y-3">
                {items.map((line, i) => (
                  <li key={`${tier.slug}-${i}`} className="flex gap-3 text-sm text-classz-700">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={!interactive || active || busy}
                onClick={() => {
                  if (sales) {
                    window.location.href = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(
                      `ClassZ ${name} plan`,
                    )}`
                    return
                  }
                  onChoose(tier, billing)
                }}
                className="mt-8 w-full rounded-xl bg-brand-teal px-4 py-3 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
              >
                {cta}
              </button>
              <p className="mt-3 text-center text-xs text-classz-500">{footnote}</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
