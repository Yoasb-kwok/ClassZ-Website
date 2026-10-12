import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { CALENDAR_COLOR_OPTIONS, COURSE_COLORS, HOLIDAY_COLOR, getCourseColor } from "./schedule-colors.ts"

test("public holidays use a fixed gray that courses cannot select", () => {
  assert.equal(HOLIDAY_COLOR, "#6B7280")
  assert.equal(
    COURSE_COLORS.some((color) => color.bar.toUpperCase() === HOLIDAY_COLOR),
    false,
  )
  assert.equal(
    CALENDAR_COLOR_OPTIONS.some((hex) => hex.toUpperCase() === HOLIDAY_COLOR),
    false,
  )
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8")
  assert.match(css, /--holiday:\s*#6B7280\s*;/)
})

test("classes keep their course color, including when holiday gray is stored", () => {
  const orange = getCourseColor({
    id: "12",
    name: "Piano basics",
    class_code: "PNO",
    calendar_color: "#FF8400",
  })
  assert.equal(orange.bar, "#FF8400")

  const rejected = getCourseColor({
    id: "12",
    name: "Piano basics",
    class_code: "PNO",
    calendar_color: "#6b7280",
  })
  assert.notEqual(rejected.bar.toUpperCase(), HOLIDAY_COLOR)
  assert.equal(
    COURSE_COLORS.some((color) => color.bar === rejected.bar),
    true,
  )
})
