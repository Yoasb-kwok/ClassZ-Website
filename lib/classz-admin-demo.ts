/** Demo dashboard payload when classz-api is offline (matches Yard admin dashboard shape). */

export type DemoStats = {
  totalRevenue: number
  totalUsers: number
  expiringStudents: number
  lowTokenStudents: number
}

export type DemoUpcomingClass = {
  id: string
  name: string
  program_code?: string
  instructor: string
  start_time: string
  enrolled_count: number
  capacity: number
  location?: string
}

export const DEMO_STATS: DemoStats = {
  totalRevenue: 12500,
  totalUsers: 3,
  expiringStudents: 1,
  lowTokenStudents: 1,
}

export const DEMO_UPCOMING: DemoUpcomingClass[] = (() => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0)
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)
  return [
    {
      id: "c1",
      name: "兒童芭蕾",
      program_code: "KB-A",
      instructor: "李老師",
      start_time: todayStart.toISOString(),
      enrolled_count: 8,
      capacity: 12,
      location: "sanpokong",
    },
    {
      id: "c2",
      name: "青少年街舞",
      program_code: "THH",
      instructor: "陳老師",
      start_time: tomorrowStart.toISOString(),
      enrolled_count: 10,
      capacity: 15,
      location: "causewaybay",
    },
  ]
})()

export function formatHKD(n: number) {
  return new Intl.NumberFormat("zh-HK", {
    style: "currency",
    currency: "HKD",
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatClassTime(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === "zh-TW" ? "zh-TW" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

const LOC: Record<string, string> = {
  sanpokong: "新蒲崗",
  causewaybay: "銅鑼灣",
  fotan: "火炭",
  sheungshui: "上水",
}

export function locationLabel(loc?: string) {
  if (!loc) return "—"
  return LOC[loc] || loc
}
