/**
 * ClassZ centre subscription tiers (platform admin manages per-centre caps).
 */

export type PlanId = "free" | "standard" | "premium" | "enterprise"

export type SubscriptionPlan = {
  id: PlanId
  labelEn: string
  labelZh: string
  max_teachers: number | null
  max_students: number | null
  contactSales?: boolean
  featuresEn: string[]
  featuresZh: string[]
}

export const SUBSCRIPTION_PLANS: Record<PlanId, SubscriptionPlan> = {
  free: {
    id: "free",
    labelEn: "Free",
    labelZh: "免費版",
    max_teachers: 2,
    max_students: 30,
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
    featuresEn: [
      "Everything in Free",
      "Coach / teacher login portals",
      "Learning Companion AI reports + PDF",
      "Tasks, class feedback & CRM lite",
      "Coupons & basic reports",
      "CSV student import (Open Day)",
    ],
    featuresZh: [
      "包含免費版全部功能",
      "導師登入 portal",
      "Learning Companion AI 報告 + PDF",
      "任務、課堂回饋、CRM 基礎",
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
    featuresEn: [
      "Everything in Standard",
      "Higher AI report volume",
      "Marketing hub & advanced analytics",
      "Multi-programme / multi-site soft branding",
      "Priority support (business hours)",
      "Refund & finance workflows",
    ],
    featuresZh: [
      "包含標準版全部功能",
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

export function normalizePlanId(raw?: string | null): PlanId {
  const id = String(raw || "free").trim().toLowerCase()
  if (id === "enterprise_custom" || id === "scale") return "enterprise"
  if (id === "free" || id === "standard" || id === "premium" || id === "enterprise") return id
  return "free"
}

export function defaultsForPlan(planId?: string | null) {
  const plan = SUBSCRIPTION_PLANS[normalizePlanId(planId)]
  return {
    plan_tier: plan.id,
    max_teachers: plan.max_teachers,
    max_students: plan.max_students,
  }
}
