/** Catalog listing kinds stored on `courses.course_type`. */

export function isWorkshopCourseType(courseType?: string | null) {
  const t = String(courseType || "").trim().toLowerCase()
  return t === "short_term" || t === "summer"
}

export function isTrialCourseType(courseType?: string | null) {
  return String(courseType || "").trim().toLowerCase() === "trial"
}

export function isRegularCourseType(courseType?: string | null) {
  return !isWorkshopCourseType(courseType) && !isTrialCourseType(courseType)
}
