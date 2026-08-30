/**
 * ClassZ centre subscription tiers (platform admin manages per-centre caps).
 */

export type PlanId = string

export type BillingCycle = "monthly" | "yearly"

export const YEARLY_SAVE_RATE = 0.2
export const SALES_EMAIL = "support@classz.co"

export type SubscriptionPlan = {
  id: PlanId
  labelEn: string
  labelZh: string
  max_teachers: number | null
  max_students: number | null
  contactSales?: boolean
  introEn: string
  introZh: string
  featuresEn: string[]
  featuresZh: string[]
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: "free",
    labelEn: "Free",
    labelZh: "免費版",
    max_teachers: 2,
    max_students: 30,
    introEn: "Everything you need to get started:",
    introZh: "開張所需：",
    featuresEn: [
      "1 centre admin login",
      "Schedule & attendance",
      "Student & teacher directory",
      "Learning Record forms (manual)",
      "Community / email support",
    ],
    featuresZh: [
      "1 個中心管理員帳號",
      "排程與點名",
      "學員／導師名冊",
      "Learning Record 手填",
      "社群／電郵支援",
    ],
  },
  standard: {
    id: "standard",
    labelEn: "Standard",
    labelZh: "標準版",
    max_teachers: 10,
    max_students: 150,
    introEn: "Everything in the Basic plan plus:",
    introZh: "包含基礎方案，另外：",
    featuresEn: [
      "Coach / teacher login portals",
      "Learning Companion AI reports + PDF",
      "Tasks & CRM lite",
      "Coupons & basic reports",
      "CSV student import (Open Day)",
    ],
    featuresZh: [
      "導師登入 portal",
      "Learning Companion AI 報告 + PDF",
      "任務、CRM 基礎",
      "優惠券與基礎報表",
      "學員 CSV 匯入（資訊日）",
    ],
  },
  premium: {
    id: "premium",
    labelEn: "Premium",
    labelZh: "進階版",
    max_teachers: 30,
    max_students: 500,
    introEn: "Everything in the Standard plan plus:",
    introZh: "包含標準方案，另外：",
    featuresEn: [
      "Higher AI report volume",
      "Marketing hub & advanced analytics",
      "Multi-programme / multi-site soft branding",
      "Priority support (business hours)",
      "Refund & finance workflows",
    ],
    featuresZh: [
      "更高 AI 報告用量",
      "行銷中心與進階數據",
      "多課程／多據點軟性品牌設定",
      "優先支援（辦公時間）",
      "退款與財務流程",
    ],
  },
  enterprise: {
    id: "enterprise",
    labelEn: "Enterprise / Scale",
    labelZh: "企業／擴充",
    max_teachers: null,
    max_students: null,
    contactSales: true,
    introEn: "Everything in the Premium plan plus:",
    introZh: "包含進階方案，另外：",
    featuresEn: [
      "Custom teacher & student caps",
      "SLA & dedicated onboarding",
      "White-label / custom domain (roadmap)",
      "API / webhooks & data export",
      "Security review & training",
    ],
    featuresZh: [
      "自訂導師／學員上限",
      "SLA 與專屬導入",
      "白牌／自訂網域（路線圖）",
      "API／Webhook 與資料匯出",
      "資安檢視與培訓",
    ],
  },
}

export const PLAN_OPTIONS = Object.values(SUBSCRIPTION_PLANS)

export function monthlyListPrice(yearlyHkd: number, saveRate = YEARLY_SAVE_RATE) {
  const y = Number(yearlyHkd) || 0
  if (!(y > 0)) return 0
  const r = Number.isFinite(Number(saveRate)) ? Number(saveRate) : YEARLY_SAVE_RATE
  const denom = 1 - r
  if (!(denom > 0)) return Math.round(y / 12)
  return Math.round(y / 12 / denom)
}

export function yearlyMonthlyEquivalent(yearlyHkd: number) {
  const y = Number(yearlyHkd) || 0
  if (!(y > 0)) return 0
  return Math.round(y / 12)
}

export function normalizePlanId(raw?: string | null): PlanId {
  const id = String(raw || "free").trim().toLowerCase()
  if (id === "enterprise_custom" || id === "scale") return "enterprise"
  if (/^[a-z][a-z0-9_]{1,31}$/.test(id)) return id
  return "free"
}

export function defaultsForPlan(planId?: string | null) {
  const id = normalizePlanId(planId)
  const plan = SUBSCRIPTION_PLANS[id]
  if (plan) {
    return {
      plan_tier: plan.id,
      max_teachers: plan.max_teachers,
      max_students: plan.max_students,
    }
  }
  return { plan_tier: id, max_teachers: 2, max_students: 30 }
}
