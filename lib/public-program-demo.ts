import type { PublicClass, PublicCourse } from "@/lib/public-courses"

/**
 * Fallback catalog when GET /api/courses is empty or the API is down.
 * Shape matches the public endpoints. Prefer live API rows when they exist.
 */
const DEMO_CENTER = 3

function upcoming(weekday: number, hour: number, weekOffset: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const delta = (weekday - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + delta + weekOffset * 7)
  d.setHours(hour, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

const DEMO_PROGRAMS: Array<{
  course: Omit<PublicCourse, "center_id">
  hour: number
  capacity: number
  lessons: number
}> = [
  {
    course: {
      id: 9101,
      name: "兒童結他",
      program_code: "DEMO-GUITAR",
      intro: "從撥弦與節奏開始，小班學習流行曲與基本樂理。",
      level: "entry",
      age_tag: "6-10",
      instructor: "周老師",
      trial_class_name: "兒童結他試堂",
      location: "mong-kok",
      weekday: 2,
      course_type: "regular",
      sort_order: 20,
      price: "880",
    },
    hour: 16,
    capacity: 8,
    lessons: 8,
  },
  {
    course: {
      id: 9102,
      name: "幼兒足球",
      program_code: "DEMO-FOOTBALL",
      intro: "帶球、傳球與小組比賽，建立體能與團隊意識。",
      level: "entry",
      age_tag: "4-7",
      instructor: "高教練",
      trial_class_name: "幼兒足球試堂",
      location: "kowloon-tong",
      weekday: 6,
      course_type: "regular",
      sort_order: 21,
      price: "720",
    },
    hour: 10,
    capacity: 14,
    lessons: 8,
  },
  {
    course: {
      id: 9103,
      name: "鋼琴入門",
      program_code: "DEMO-PIANO",
      intro: "認譜、指法與簡易曲子，適合零基礎學童。",
      level: "entry",
      age_tag: "5-9",
      instructor: "吳老師",
      trial_class_name: "鋼琴入門試堂",
      location: "sha-tin",
      weekday: 3,
      course_type: "regular",
      sort_order: 22,
      price: "960",
    },
    hour: 17,
    capacity: 6,
    lessons: 8,
  },
  {
    course: {
      id: 9104,
      name: "兒童編程",
      program_code: "DEMO-CODE",
      intro: "用積木式編程做小遊戲，練習邏輯與解難。",
      level: "intermediate",
      age_tag: "8-12",
      instructor: "鄭老師",
      trial_class_name: "兒童編程試堂",
      location: "kowloon-bay",
      weekday: 4,
      course_type: "regular",
      sort_order: 23,
      price: "1280",
    },
    hour: 16,
    capacity: 10,
    lessons: 8,
  },
  {
    course: {
      id: 9105,
      name: "水彩繪畫",
      program_code: "DEMO-ART",
      intro: "色彩混搭與靜物寫生，完成可帶回家的作品。",
      level: "entry",
      age_tag: "5-10",
      instructor: "何老師",
      trial_class_name: "水彩繪畫試堂",
      location: "causewaybay",
      weekday: 5,
      course_type: "regular",
      sort_order: 24,
      price: "640",
    },
    hour: 15,
    capacity: 12,
    lessons: 8,
  },
  {
    course: {
      id: 9106,
      name: "英語拼音",
      program_code: "DEMO-PHONICS",
      intro: "字母發音、拼讀與短篇故事，建立閱讀基礎。",
      level: "entry",
      age_tag: "4-8",
      instructor: "Ms. Lee",
      trial_class_name: "英語拼音試堂",
      location: "tsim-sha-tsui",
      weekday: 1,
      course_type: "regular",
      sort_order: 25,
      price: "780",
    },
    hour: 16,
    capacity: 10,
    lessons: 8,
  },
  {
    course: {
      id: 9107,
      name: "STEM 假期工作坊",
      program_code: "DEMO-STEMCAMP",
      intro: "四堂短期工作坊：機械、電路與動手實驗。",
      level: "intermediate",
      age_tag: "7-12",
      instructor: "黃老師",
      trial_class_name: "STEM 假期工作坊試堂",
      location: "sanpokong",
      weekday: 6,
      course_type: "short_term",
      sort_order: 26,
      price: "1480",
    },
    hour: 14,
    capacity: 16,
    lessons: 4,
  },
  {
    course: {
      id: 9108,
      name: "暑期舞蹈精修",
      program_code: "DEMO-SUMMERDANCE",
      intro: "暑期密集編舞與舞台表現，適合有基礎的學員。",
      level: "intermediate",
      age_tag: "9-14",
      instructor: "林老師",
      trial_class_name: "暑期舞蹈精修試堂",
      location: "causewaybay",
      weekday: 2,
      course_type: "summer",
      sort_order: 27,
      price: "1680",
    },
    hour: 18,
    capacity: 12,
    lessons: 6,
  },
]

export function demoPublicCourses(): PublicCourse[] {
  return DEMO_PROGRAMS.map((p) => ({ ...p.course, center_id: DEMO_CENTER }))
}

export function demoPublicCourse(id: number): PublicCourse | null {
  return demoPublicCourses().find((c) => c.id === id) ?? null
}

export function demoPublicClasses(): PublicClass[] {
  let n = 0
  const out: PublicClass[] = []
  for (const p of DEMO_PROGRAMS) {
    for (let i = 0; i < p.lessons; i += 1) {
      n += 1
      const start = upcoming(p.course.weekday ?? 1, p.hour, i)
      const endDate = new Date(start)
      endDate.setHours(endDate.getHours() + 1)
      const pad = (x: number) => String(x).padStart(2, "0")
      const end = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:00`
      out.push({
        id: 9200 + n,
        name: p.course.name,
        instructor: p.course.instructor,
        start_time: start,
        end_time: end,
        location: p.course.location,
        program_code: p.course.program_code,
        level: p.course.level,
        age_tag: p.course.age_tag,
        capacity: p.capacity,
        enrolled_count: Math.min(4 + (i % 5), p.capacity - 1),
        weekday: p.course.weekday,
        total_lessons: p.lessons,
        is_cancelled: 0,
        center_id: DEMO_CENTER,
      })
    }
  }
  return out
}

export function isTestCentreProgramCode(code: string | null | undefined) {
  return String(code || "").toUpperCase().startsWith("TEST-")
}
