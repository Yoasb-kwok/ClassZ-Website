/** Local demo persistence for ClassZ admin (no API). Key mirrors Yard-style entities. */

export const CLASSZ_ADMIN_STORAGE_KEY = "classz-admin-local-v2"

export type Id = string

export interface AdminUser {
  id: Id
  account_number: string
  full_name: string
  username: string
  email: string
  mobile: string
  role: "student" | "coach" | "center_admin"
  remaining_tokens: number
  token_expiry: string
  created_at: string
}

export interface AdminOrder {
  id: Id
  user_id: Id
  user_name: string
  total: number
  discount: number
  payment_status: "paid" | "pending" | "failed"
  payment_method: string
  package_name: string
  created_at: string
}

export interface AdminCourse {
  id: Id
  name: string
  instructor: string
  start_time: string
  end_time: string
  capacity: number
  enrolled_count: number
  status: "draft" | "published"
  location: string
}

export interface AdminInstructor {
  id: Id
  name: string
  email: string
  phone: string
  bio: string
  created_at: string
}

export interface AdminCoupon {
  id: Id
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_amount: number
  quantity: number
  used_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
}

export interface AuditEntry {
  id: Id
  actor: string
  action: string
  target_type: string
  target_id?: string
  details: string
  created_at: string
}

export interface ClassNotice {
  id: Id
  course_id: Id
  course_name: string
  message: string
  created_at: string
}

export interface NewsPost {
  id: Id
  title_zh_tw: string
  title_en: string
  content_zh_tw: string
  content_en: string
  published_at: string
  image_url: string | null
  show_as_popup: boolean
}

export interface CmsPageContent {
  title: string
  bodyHtml: string
}

export interface ClasszAdminStore {
  version: 1
  users: AdminUser[]
  orders: AdminOrder[]
  courses: AdminCourse[]
  instructors: AdminInstructor[]
  coupons: AdminCoupon[]
  auditLog: AuditEntry[]
  classNotices: ClassNotice[]
  newsPosts: NewsPost[]
  cms: Record<string, CmsPageContent>
}

export function newId(): Id {
  return `cz_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function iso(d = new Date()) {
  return d.toISOString()
}

/** Minimum rows each list-style admin screen should show (demo). */
export const MIN_DEMO_LIST_ROWS = 10

/** Seed a few extra rows above the minimum. */
const DEMO_COUNT = 12

const LOCATIONS = ["旺角", "銅鑼灣", "荃灣", "沙田", "將軍澳", "中環"] as const
const INSTRUCTOR_NAMES = [
  "李老師",
  "張老師",
  "王導師",
  "陳老師",
  "劉老師",
  "黃導師",
  "周老師",
  "吳導師",
  "鄭老師",
  "何導師",
  "許老師",
  "羅導師",
] as const

const COURSE_TITLES = [
  "兒童創意舞 · L01",
  "爵士初階 · L03",
  "街舞入門 · H01",
  "芭蕾基礎 · B02",
  "K-Pop 翻跳 · K05",
  "現代舞肢體 · M04",
  "拉丁初階 · L02",
  "親子律動 · P01",
  "成人伸展 · S03",
  "鎖舞基礎 · LK01",
  "House 入門 · HS02",
  "Breaking 初階 · BR01",
] as const

function seed(): ClasszAdminStore {
  const t0 = new Date()

  const users: AdminUser[] = Array.from({ length: DEMO_COUNT }, (_, i) => {
    const n = i + 1
    const zhNames = [
      "陳大文",
      "黃美玲",
      "林志明",
      "何穎詩",
      "吳家俊",
      "鄭曉彤",
      "劉子軒",
      "周芷晴",
      "梁俊傑",
      "謝心怡",
      "馮浩然",
      "葉嘉欣",
    ]
    const enNames = [
      "Mary Wong",
      "Jason Lee",
      "Amy Chan",
      "Kevin Ho",
      "Grace Ng",
      "Tom Cheng",
      "Emily Lau",
      "Daniel Chow",
      "Sophie Leung",
      "Chris Tse",
      "Kelly Fung",
      "Jack Yip",
    ]
    const name = i % 2 === 0 ? zhNames[i]! : enNames[i]!
    const tokenDays = [5, 12, 20, 45, 60, 90, 7, 14, 30, 55, 25, 18][i] ?? 30
    return {
      id: `u_seed_${n}`,
      account_number: `CZ-${10000 + n}`,
      full_name: name,
      username: `user${n}`,
      email: `demo.user${n}@classz.demo`,
      mobile: `${90000000 + n * 1111}`.slice(0, 8),
      role: (i === 10 ? "coach" : i === 11 ? "center_admin" : "student") as AdminUser["role"],
      remaining_tokens: (i % 5) + 1,
      token_expiry: new Date(t0.getTime() + tokenDays * 86400000).toISOString().slice(0, 10),
      created_at: iso(new Date(t0.getTime() - (40 - i * 3) * 86400000)),
    }
  })

  const instructors: AdminInstructor[] = Array.from({ length: DEMO_COUNT }, (_, i) => {
    const name = INSTRUCTOR_NAMES[i]!
    return {
      id: `ins_seed_${i + 1}`,
      name,
      email: `instructor.${i + 1}@classz.demo`,
      phone: `${91000000 + i * 101}`.slice(0, 8),
      bio: `示範導師 ${i + 1}：律動、舞台與小班教學經驗。`,
      created_at: iso(new Date(t0.getTime() - (120 - i * 7) * 86400000)),
    }
  })

  const courses: AdminCourse[] = Array.from({ length: DEMO_COUNT }, (_, i) => {
    const dayOffset = i + 1
    const start = new Date(t0.getTime() + dayOffset * 86400000 + i * 3600000)
    const end = new Date(start.getTime() + (i % 2 === 0 ? 3600000 : 5400000))
    return {
      id: `crs_seed_${i + 1}`,
      name: COURSE_TITLES[i]!,
      instructor: INSTRUCTOR_NAMES[i % INSTRUCTOR_NAMES.length]!,
      start_time: iso(start),
      end_time: iso(end),
      capacity: 8 + (i % 8),
      enrolled_count: Math.min(3 + i, 8 + (i % 8)),
      status: (i % 4 === 0 ? "draft" : "published") as AdminCourse["status"],
      location: LOCATIONS[i % LOCATIONS.length]!,
    }
  })

  const orders: AdminOrder[] = Array.from({ length: DEMO_COUNT }, (_, i) => {
    const u = users[i % users.length]!
    const statuses: AdminOrder["payment_status"][] = ["paid", "paid", "paid", "pending", "failed", "paid"]
    const methods = ["fps", "card", "payme", "alipayhk", "wechatpay"]
    const packages = ["10 堂套票", "20 堂套票", "單堂體驗", "暑期密集", "親子套票", "進階月票"]
    const total = 480 + i * 120
    const discount = i % 3 === 0 ? Math.round(total * 0.1) : 0
    return {
      id: `ord_seed_${i + 1}`,
      user_id: u.id,
      user_name: u.full_name,
      total,
      discount,
      payment_status: statuses[i % statuses.length]!,
      payment_method: methods[i % methods.length]!,
      package_name: packages[i % packages.length]!,
      created_at: iso(new Date(t0.getTime() - (20 - i) * 86400000)),
    }
  })

  const coupons: AdminCoupon[] = Array.from({ length: DEMO_COUNT }, (_, i) => {
    const pct = i % 2 === 0
    return {
      id: `cp_seed_${i + 1}`,
      code: pct ? `SAVE${(i + 1) * 5}` : `HKD${50 + i * 25}`,
      discount_type: pct ? "percentage" : "fixed",
      discount_value: pct ? 5 + (i % 6) * 5 : 50 + i * 25,
      min_order_amount: i % 2 === 0 ? 0 : 300,
      quantity: 50 + i * 10,
      used_count: i * 2,
      valid_from: new Date(t0.getTime() - (30 - i) * 86400000).toISOString().slice(0, 10),
      valid_until: new Date(t0.getTime() + (60 + i * 5) * 86400000).toISOString().slice(0, 10),
      is_active: i !== 9,
      created_at: iso(new Date(t0.getTime() - (15 - i) * 86400000)),
    }
  })

  const auditLog: AuditEntry[] = Array.from({ length: DEMO_COUNT }, (_, i) => {
    const actions = ["create", "update", "delete", "export", "login", "publish"]
    const targets = ["user", "order", "course", "coupon", "news", "instructor"]
    return {
      id: `aud_seed_${i + 1}`,
      actor: i % 3 === 0 ? "Center Admin" : "Coach",
      action: actions[i % actions.length]!,
      target_type: targets[i % targets.length]!,
      target_id: `cz_tgt_${i + 1}`,
      details: `示範審計項目 #${i + 1}：${targets[i % targets.length]} 已記錄。`,
      created_at: iso(new Date(t0.getTime() - (i + 1) * 3600000)),
    }
  })

  const classNotices: ClassNotice[] = Array.from({ length: DEMO_COUNT }, (_, i) => {
    const c = courses[i % courses.length]!
    return {
      id: `cn_seed_${i + 1}`,
      course_id: c.id,
      course_name: c.name,
      message: [
        "本週請穿運動服與室內舞鞋。",
        "教室改至 3 樓 B 室。",
        "請提早 10 分鐘到場熱身。",
        "因公眾假期順延一週。",
        "請自備飲用水。",
        "家長觀摩日改期，詳情見電郵。",
        "期末匯演彩排時間已更新。",
        "請於前台簽到。",
        "惡劣天氣安排：黑色暴雨課堂取消。",
        "請完成線上健康申報。",
        "攝影日：可選擇不參與拍攝。",
        "聖誕特別課程報名連結已發送。",
      ][i]!,
      created_at: iso(new Date(t0.getTime() - (DEMO_COUNT - i) * 43200000)),
    }
  })

  const newsPosts: NewsPost[] = Array.from({ length: DEMO_COUNT }, (_, i) => ({
    id: `n_seed_${i + 1}`,
    title_zh_tw: [
      "春季班開放報名",
      "暑期密集課程早鳥優惠",
      "新導師加入 ClassZ",
      "匯演門票公開發售",
      "親子律動體驗日",
      "街舞聯賽報名中",
      "芭蕾考級預備班",
      "成人伸展週末班",
      "K-Pop 新歌工作坊",
      "教室消毒與防疫安排",
      "會員積分計劃上線",
      "年終感謝祭折扣",
    ][i]!,
    title_en: [
      "Spring enrollment open",
      "Summer intensive early bird",
      "New instructors joined",
      "Recital tickets on sale",
      "Family rhythm trial day",
      "Street dance contest signup",
      "Ballet exam prep",
      "Weekend stretch for adults",
      "K-Pop new release workshop",
      "Cleaning & safety notice",
      "Loyalty points live",
      "Year-end thank-you sale",
    ][i]!,
    content_zh_tw: `<p>示範消息內容 #${i + 1}（HTML）。</p>`,
    content_en: `<p>Demo news body #${i + 1} (HTML).</p>`,
    published_at: new Date(t0.getTime() - (DEMO_COUNT - i) * 86400000).toISOString().slice(0, 10),
    image_url: null,
    show_as_popup: i === 0,
  }))

  const cms: ClasszAdminStore["cms"] = {
    "course-intro": {
      title: "課程介紹",
      bodyHtml:
        "<p>編輯課程與級別介紹（示範）。</p><ul>" +
        Array.from({ length: DEMO_COUNT }, (_, i) => `<li>示範課程條目 ${i + 1}：級別、堂數與收費說明</li>`).join("") +
        "</ul>",
    },
    about: {
      title: "關於我們",
      bodyHtml:
        "<p>ClassZ 示範內容。</p><ol>" +
        Array.from({ length: DEMO_COUNT }, (_, i) => `<li>里程碑 ${i + 1}：團隊與理念介紹</li>`).join("") +
        "</ol>",
    },
    contact: {
      title: "聯絡我們",
      bodyHtml:
        "<p>電郵：hello@classz.demo</p>" +
        Array.from({ length: DEMO_COUNT }, (_, i) => `<p>辦事處 ${i + 1}：示範地址與辦公時間</p>`).join(""),
    },
    faq: {
      title: "常見問題",
      bodyHtml:
        Array.from({ length: DEMO_COUNT }, (_, i) => `<p><strong>問 ${i + 1}</strong>：示範答案段落。</p>`).join(""),
    },
    terms: {
      title: "條款細則",
      bodyHtml:
        "<p>條款示範文字。</p>" +
        Array.from({ length: DEMO_COUNT }, (_, i) => `<p>第 ${i + 1} 條：示範條文內容（demo）。</p>`).join(""),
    },
    privacy: {
      title: "私隱政策",
      bodyHtml:
        "<p>私隱政策示範。</p>" +
        Array.from({ length: DEMO_COUNT }, (_, i) => `<p>章節 ${i + 1}：資料用途與保存（demo）。</p>`).join(""),
    },
  }

  return {
    version: 1,
    users,
    orders,
    courses,
    instructors,
    coupons,
    auditLog,
    classNotices,
    newsPosts,
    cms,
  }
}

function mergeDefaults(parsed: unknown): ClasszAdminStore {
  const base = seed()
  if (!parsed || typeof parsed !== "object") return base
  const p = parsed as Partial<ClasszAdminStore>
  return {
    version: 1,
    users: Array.isArray(p.users) ? p.users : base.users,
    orders: Array.isArray(p.orders) ? p.orders : base.orders,
    courses: Array.isArray(p.courses) ? p.courses : base.courses,
    instructors: Array.isArray(p.instructors) ? p.instructors : base.instructors,
    coupons: Array.isArray(p.coupons) ? p.coupons : base.coupons,
    auditLog: Array.isArray(p.auditLog) ? p.auditLog : base.auditLog,
    classNotices: Array.isArray(p.classNotices) ? p.classNotices : base.classNotices,
    newsPosts: Array.isArray(p.newsPosts) ? p.newsPosts : base.newsPosts,
    cms: p.cms && typeof p.cms === "object" ? { ...base.cms, ...p.cms } : base.cms,
  }
}

/** Old localStorage often kept 1–2 seed rows; replace list data from fresh seed so every admin list shows ≥10 rows. CMS edits are kept. */
function ensureMinimumDemoLists(s: ClasszAdminStore): ClasszAdminStore {
  const min = MIN_DEMO_LIST_ROWS
  const ok =
    s.users.length >= min &&
    s.orders.length >= min &&
    s.courses.length >= min &&
    s.instructors.length >= min &&
    s.coupons.length >= min &&
    s.auditLog.length >= min &&
    s.classNotices.length >= min &&
    s.newsPosts.length >= min
  if (ok) return s
  const base = seed()
  return {
    ...s,
    users: base.users,
    orders: base.orders,
    courses: base.courses,
    instructors: base.instructors,
    coupons: base.coupons,
    auditLog: base.auditLog,
    classNotices: base.classNotices,
    newsPosts: base.newsPosts,
    cms: { ...base.cms, ...s.cms },
  }
}

export function loadAdminStore(): ClasszAdminStore {
  if (typeof window === "undefined") return seed()
  try {
    const raw = window.localStorage.getItem(CLASSZ_ADMIN_STORAGE_KEY)
    if (!raw) {
      const s = seed()
      saveAdminStore(s)
      return s
    }
    const merged = mergeDefaults(JSON.parse(raw) as unknown)
    const next = ensureMinimumDemoLists(merged)
    if (
      next.users !== merged.users ||
      next.orders !== merged.orders ||
      next.courses !== merged.courses ||
      next.instructors !== merged.instructors ||
      next.coupons !== merged.coupons ||
      next.auditLog !== merged.auditLog ||
      next.classNotices !== merged.classNotices ||
      next.newsPosts !== merged.newsPosts
    ) {
      saveAdminStore(next)
    }
    return next
  } catch {
    return seed()
  }
}

export function saveAdminStore(s: ClasszAdminStore) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CLASSZ_ADMIN_STORAGE_KEY, JSON.stringify(s))
}

export function resetAdminStore() {
  const s = seed()
  saveAdminStore(s)
  return s
}

export function appendAudit(
  s: ClasszAdminStore,
  partial: Omit<AuditEntry, "id" | "created_at"> & { actor?: string }
): ClasszAdminStore {
  const entry: AuditEntry = {
    id: newId(),
    created_at: iso(),
    actor: partial.actor ?? "Admin",
    action: partial.action,
    target_type: partial.target_type,
    target_id: partial.target_id,
    details: partial.details,
  }
  return { ...s, auditLog: [entry, ...s.auditLog].slice(0, 400) }
}
