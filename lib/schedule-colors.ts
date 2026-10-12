/**
 * Course calendar swatches and the reserved public-holiday color.
 * Holidays are a separate GET /api/center/holidays resource with no color
 * field. #6B7280 is holiday-only and must not be added to COURSE_COLORS
 * or the course color picker.
 */
export const HOLIDAY_COLOR = "#6B7280"

/** Palette from system 5 tones + readable variants — same course always maps to same color */
export const COURSE_COLORS = [
  { bar: "#0ABAB5", bg: "#E7F8F7", border: "#8FDFDB", text: "#06706D" },
  { bar: "#BF07D0", bg: "#F9E8FB", border: "#E4A0ED", text: "#8A0596" },
  { bar: "#FF8400", bg: "#FFF3E6", border: "#FFC280", text: "#B85E00" },
  { bar: "#DB5461", bg: "#FCECEE", border: "#F0A8AF", text: "#A83A46" },
  { bar: "#525252", bg: "#F5F5F5", border: "#D4D4D4", text: "#292929" },
  { bar: "#089591", bg: "#E0F4F3", border: "#6CD6D3", text: "#044A48" },
  { bar: "#9B2DB0", bg: "#F5E6F8", border: "#D49BE0", text: "#6E1F7D" },
  { bar: "#E67A00", bg: "#FFF0DB", border: "#FFB84D", text: "#9A5200" },
  { bar: "#C93D4A", bg: "#FBE8EA", border: "#E88B94", text: "#8F2A35" },
  { bar: "#1A9BAA", bg: "#E4F5F7", border: "#7DCDD6", text: "#0F5C65" },
] as const

export type CourseColor = (typeof COURSE_COLORS)[number]

export const CALENDAR_COLOR_OPTIONS = COURSE_COLORS.map((c) => c.bar).filter(
  (hex) => hex.toUpperCase() !== HOLIDAY_COLOR,
)

export type CourseColorSource = {
  class_code?: string | null
  name?: string | null
  id?: string | null
  calendar_color?: string | null
}

function hashCourseKey(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Stable color for a course — prefer an explicit calendar_color, then class_code, then name. */
export function getCourseColor(ev: CourseColorSource): CourseColor {
  const chosen = String(ev.calendar_color || "").trim().toUpperCase()
  // A stored holiday gray is not a course swatch; fall through to the palette.
  if (chosen && chosen !== HOLIDAY_COLOR) {
    const match = COURSE_COLORS.find((c) => c.bar.toUpperCase() === chosen)
    if (match) return match
  }
  const key = (ev.class_code || ev.name || ev.id || "course").trim().toLowerCase()
  return COURSE_COLORS[hashCourseKey(key) % COURSE_COLORS.length]
}
