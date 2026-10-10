import { expect, test, type Page, type Route } from "@playwright/test"

test.use({ viewport: { width: 1440, height: 1100 } })

/**
 * Centre schedule QA E26–E29 against the ClassZ-api#1 contract.
 * Network is stubbed so the UI can be exercised without the API process.
 */

type Recorded = { method: string; path: string; body: unknown; headers: Record<string, string> }

async function seedSession(page: Page, locale: "en" | "zh-TW") {
  await page.addInitScript((nextLocale) => {
    localStorage.setItem(
      "classz_session",
      JSON.stringify({
        token: "centre-schedule-test-token",
        user: {
          email: "center@demo.com",
          name: "Centre Admin",
          role: "center_admin",
          roleLabel: "中心",
          center_id: 1,
        },
      })
    )
    localStorage.setItem("locale", nextLocale)
  }, locale)
}

function todayAt(hour: number) {
  const date = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour)}:00`
}

function classes() {
  return [
    {
      id: 12,
      name: "Piano basics",
      class_code: "PNO",
      instructor: "Ada Wong",
      instructor_id: 4,
      start_time: todayAt(10),
      end_time: todayAt(11),
      capacity: 8,
      enrolled_count: 3,
      location: "Room A",
    },
    {
      id: 13,
      name: "Art lab",
      class_code: "ART",
      instructor: "Ada Wong",
      instructor_id: 4,
      start_time: todayAt(14),
      end_time: todayAt(15),
      capacity: 8,
      enrolled_count: 2,
      location: "Room B",
    },
  ]
}

async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  })
}

async function installApi(page: Page, recorded: Recorded[]) {
  let conflictCalls = 0
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = `${url.pathname}${url.search}`
    let body: unknown = null
    if (request.method() !== "GET" && request.method() !== "HEAD") {
      try {
        body = request.postDataJSON()
      } catch {
        body = request.postData()
      }
    }
    recorded.push({
      method: request.method(),
      path,
      body,
      headers: request.headers(),
    })

    if (path.includes("/me/modules")) {
      await fulfill(route, {
        success: true,
        data: { modules: ["dashboard", "schedule", "students", "teachers", "attendance", "programs"] },
      })
      return
    }
    if (request.method() === "GET" && /\/classes(\?|$)/.test(path)) {
      await fulfill(route, { success: true, data: classes() })
      return
    }
    if (path.includes("/instructors")) {
      await fulfill(route, {
        success: true,
        data: [
          { id: 4, name: "Ada Wong" },
          { id: 8, name: "Bo Cheung" },
        ],
      })
      return
    }
    if (path.includes("/holidays") || path.includes("/courses") || path.includes("/enrollments")) {
      await fulfill(route, { success: true, data: [] })
      return
    }
    if (path.includes("/audit-log")) {
      await fulfill(route, {
        success: true,
        data: [
          {
            id: 4,
            created_at: "2026-10-09T04:00:00.000Z",
            actor_email: "center@demo.com",
            action: "class.substitute",
            class_id: 12,
            class_name: "Piano basics",
            message: "Instructor changed to Bo Cheung",
          },
        ],
      })
      return
    }
    if (path.includes("/schedule/conflicts")) {
      const slot = (body || {}) as {
        strict_holidays?: boolean
        instructor_id?: number
        exclude_class_id?: string
      }
      if (slot.instructor_id === 8) {
        await fulfill(route, {
          success: true,
          data: {
            blocks: [
              {
                class_id: slot.exclude_class_id || "",
                class_name: "Piano basics",
                type: "instructor",
                severity: "block",
                message: "Instructor overlap",
                message_zh: "導師時間重疊",
              },
            ],
            warnings: [],
          },
        })
        return
      }
      if (slot.exclude_class_id) {
        await fulfill(route, { success: true, data: { blocks: [], warnings: [] } })
        return
      }
      conflictCalls += 1
      if (conflictCalls === 1 || slot.strict_holidays) {
        await fulfill(route, {
          success: true,
          data: {
            blocks: [
              {
                type: "availability",
                severity: "block",
                message: "Outside instructor availability",
                message_zh: "不在導師空檔內",
              },
            ],
            warnings: [],
          },
        })
        return
      }
      await fulfill(route, {
        success: true,
        data: {
          blocks: [],
          warnings: [
            {
              type: "holiday",
              severity: "warn",
              message: "Chung Yeung Festival",
              message_zh: "重陽節",
            },
          ],
        },
      })
      return
    }
    if (path.includes("/bulk-reschedule")) {
      const payload = (body || {}) as { abort_all?: boolean; dry_run?: boolean }
      if (payload.abort_all) {
        await fulfill(
          route,
          {
            success: false,
            msg: "conflicts",
            data: {
              applied: [],
              blocks: [
                {
                  class_id: "12",
                  class_name: "Piano basics",
                  type: "room",
                  severity: "block",
                  message: "Room A is in use",
                  message_zh: "課室 A 使用中",
                },
              ],
            },
          },
          409
        )
        return
      }
      await fulfill(route, {
        success: true,
        data: {
          applied: [{ class_id: "13", name: "Art lab", start_time: todayAt(15) }],
          skipped: [{ class_id: "12", name: "Piano basics", reason: "instructor overlap" }],
          warnings: [{ class_id: "13", type: "holiday", severity: "warn", message: "Public holiday", message_zh: "公眾假期" }],
        },
      })
      return
    }
    if (path.includes("/substitute")) {
      await fulfill(route, { success: true, data: { id: 12, instructor_id: 8, instructor: "Bo Cheung" } })
      return
    }
    if (request.method() === "POST" && /\/classes(\?|$)/.test(path)) {
      await fulfill(route, { success: true, data: { id: 21, ...(body as object) } })
      return
    }
    await fulfill(route, { success: true, data: [] })
  })
}

async function openSchedule(page: Page, locale: "en" | "zh-TW") {
  await seedSession(page, locale)
  await page.goto("/admin/schedule")
  await expect(page.getByRole("heading", { name: locale === "zh-TW" ? "排程" : "Scheduling" })).toBeVisible()
}

test("E26 conflict preview blocks a save, then holiday warnings can be confirmed", async ({ page }) => {
  const recorded: Recorded[] = []
  await installApi(page, recorded)
  await openSchedule(page, "zh-TW")
  await page.getByTestId("schedule-add").click()
  await page.getByTestId("schedule-name").fill("Trial choir")
  await page.getByTestId("schedule-instructor").selectOption({ label: "Ada Wong" })
  await page.getByTestId("schedule-save").click()
  await expect(page.getByTestId("schedule-conflict-blocks")).toContainText("不在導師空檔內")
  await expect(page.getByTestId("schedule-save")).toBeDisabled()
  await page.getByTestId("schedule-conflict-blocks").scrollIntoViewIfNeeded()
  await page.screenshot({ path: "/opt/cursor/artifacts/screenshots/e26-conflict-blocks-zh.png" })

  const end = page.getByTestId("schedule-end")
  const current = await end.inputValue()
  await end.fill(current.slice(0, 14) + "30")
  await page.getByTestId("schedule-save").click()
  await expect(page.getByTestId("schedule-conflict-warnings")).toContainText("重陽節")
  await expect(page.getByTestId("schedule-save")).toBeEnabled()
  await page.getByTestId("schedule-conflict-warnings").scrollIntoViewIfNeeded()
  await page.screenshot({ path: "/opt/cursor/artifacts/screenshots/e26-holiday-warning-zh.png" })
  const getsBeforeSave = recorded.filter((entry) => entry.method === "GET" && /\/classes\?from=.*to=/.test(entry.path)).length
  await page.getByTestId("schedule-save").click()
  await expect
    .poll(() => recorded.filter((entry) => entry.method === "GET" && /\/classes\?from=.*to=/.test(entry.path)).length)
    .toBeGreaterThan(getsBeforeSave)

  const conflicts = recorded.filter((entry) => entry.path.includes("/schedule/conflicts"))
  const conflict = conflicts[0]
  expect(conflict?.body && typeof conflict.body === "object" && !("slots" in (conflict.body as object))).toBeTruthy()
  expect((conflict?.body as { instructor_id?: number }).instructor_id).toBe(4)
  expect(conflict?.headers["x-client-source"]).toBeUndefined()
  const postIndex = recorded.findIndex((entry) => entry.method === "POST" && /\/classes(\?|$)/.test(entry.path))
  expect(postIndex).toBeGreaterThan(-1)
  expect(
    recorded.slice(postIndex + 1).some((entry) => entry.method === "GET" && /\/classes\?from=.*to=/.test(entry.path))
  ).toBeTruthy()
})

test("E27 bulk reschedule previews skip-blocked and confirms the write", async ({ page }) => {
  const recorded: Recorded[] = []
  await installApi(page, recorded)
  await openSchedule(page, "en")
  await page.getByTestId("schedule-select-12").check()
  await page.getByTestId("schedule-select-13").check()
  await page.getByTestId("schedule-bulk-open").click()
  await expect(page.getByTestId("schedule-policy-skip")).toBeChecked()
  await page.getByTestId("schedule-new-start-12").fill(todayAt(16))
  await page.getByTestId("schedule-bulk-preview").click()
  await expect(page.getByTestId("schedule-would-update")).toContainText("Art lab")
  await expect(page.getByTestId("schedule-skipped")).toContainText("Piano basics")
  await expect(page.getByTestId("schedule-conflict-warnings")).toContainText("Public holiday")
  await page.getByTestId("schedule-would-update").scrollIntoViewIfNeeded()
  await page.screenshot({ path: "/opt/cursor/artifacts/screenshots/e27-bulk-skip-blocked-en.png" })
  await page.getByTestId("schedule-bulk-confirm").click()
  await expect(page.getByTestId("schedule-bulk-confirm")).toHaveCount(0)

  const previews = recorded.filter((entry) => entry.path.includes("/bulk-reschedule"))
  expect(previews).toHaveLength(2)
  const previewBody = previews[0].body as {
    dry_run: boolean
    skip_conflicts: boolean
    abort_all: boolean
    delta_minutes: number
    new_start_times: Record<string, string>
  }
  expect(previewBody.dry_run).toBe(true)
  expect(previewBody.skip_conflicts).toBe(true)
  expect(previewBody.abort_all).toBe(false)
  expect(previewBody.delta_minutes).toBe(60)
  expect(Object.keys(previewBody.new_start_times)).toEqual(["12"])
  expect(typeof Object.keys(previewBody.new_start_times)[0]).toBe("string")
  const applyBody = previews[1].body as { dry_run: boolean; skip_conflicts: boolean }
  expect(applyBody.dry_run).toBe(false)
  expect(applyBody.skip_conflicts).toBe(true)
  const classGets = recorded.filter((entry) => entry.method === "GET" && /\/classes\?from=/.test(entry.path))
  expect(classGets.length).toBeGreaterThan(1)
})

test("E28 abort-all preview returns 409 and shows nothing applied", async ({ page }) => {
  const recorded: Recorded[] = []
  await installApi(page, recorded)
  await openSchedule(page, "zh-TW")
  await page.getByTestId("schedule-select-all").check()
  await page.getByTestId("schedule-bulk-open").click()
  await page.getByTestId("schedule-policy-abort").check()
  await page.getByTestId("schedule-bulk-preview").click()
  await expect(page.getByTestId("schedule-nothing-applied")).toContainText("全唔改")
  await expect(page.getByTestId("schedule-conflict-blocks")).toContainText("課室 A 使用中")
  await expect(page.getByTestId("schedule-bulk-confirm")).toBeDisabled()
  await page.getByTestId("schedule-nothing-applied").scrollIntoViewIfNeeded()
  await page.screenshot({ path: "/opt/cursor/artifacts/screenshots/e28-abort-all-zh.png" })

  const preview = recorded.find((entry) => entry.path.includes("/bulk-reschedule"))
  const body = preview?.body as { abort_all: boolean; skip_conflicts: boolean; dry_run: boolean }
  expect(body.abort_all).toBe(true)
  expect(body.skip_conflicts).toBe(false)
  expect(body.dry_run).toBe(true)
  expect(recorded.filter((entry) => entry.path.includes("/bulk-reschedule"))).toHaveLength(1)
})

test("E29 substitute uses instructor id and sends notify only when opted in", async ({ page }) => {
  const recorded: Recorded[] = []
  await installApi(page, recorded)
  await openSchedule(page, "en")
  await page.getByTestId("schedule-substitute-12").click()
  await expect(page.getByTestId("schedule-notify")).not.toBeChecked()
  await page.getByTestId("schedule-substitute-instructor").selectOption({ label: "Bo Cheung" })
  await page.getByTestId("schedule-substitute-preview").click()
  await expect(page.getByTestId("schedule-conflict-blocks")).toContainText("Instructor overlap")
  await expect(page.getByTestId("schedule-substitute-confirm")).toBeDisabled()
  await page.getByTestId("schedule-conflict-blocks").scrollIntoViewIfNeeded()
  await page.screenshot({ path: "/opt/cursor/artifacts/screenshots/e29-substitute-block-en.png" })

  await page.getByTestId("schedule-substitute-instructor").selectOption({ label: "Ada Wong" })
  await page.getByTestId("schedule-substitute-preview").click()
  await expect(page.getByTestId("schedule-no-conflicts")).toBeVisible()
  await page.getByTestId("schedule-substitute-confirm").click()
  await expect(page.getByTestId("schedule-substitute-confirm")).toHaveCount(0)

  await page.getByTestId("schedule-substitute-12").click()
  await page.getByTestId("schedule-substitute-instructor").selectOption({ label: "Ada Wong" })
  await page.getByTestId("schedule-notify").check()
  await page.getByTestId("schedule-substitute-preview").click()
  await page.getByTestId("schedule-substitute-confirm").click()

  const conflictPreviews = recorded.filter((entry) => entry.path.includes("/schedule/conflicts"))
  const substitutePreview = conflictPreviews[0]?.body as { exclude_class_id?: string; class_id?: string }
  expect(substitutePreview.exclude_class_id).toBe("12")
  expect("class_id" in substitutePreview).toBe(false)

  const substituteCalls = recorded.filter((entry) => entry.path.includes("/substitute"))
  expect(substituteCalls).toHaveLength(2)
  const skippedNotify = substituteCalls[0].body as { instructor_id: number; instructor: string; notify?: boolean }
  expect(skippedNotify.instructor_id).toBe(4)
  expect(skippedNotify.instructor).toBe("Ada Wong")
  expect("notify" in skippedNotify).toBe(false)
  const optedIn = substituteCalls[1].body as { notify?: boolean }
  expect(optedIn.notify).toBe(true)
  expect(substituteCalls[0].path).toContain("/classes/12/substitute")
  const firstPost = recorded.findIndex((entry) => entry.path.includes("/substitute"))
  expect(
    recorded.slice(firstPost + 1).some((entry) => entry.method === "GET" && /\/classes\?from=.*to=/.test(entry.path))
  ).toBeTruthy()
})

test("edit conflict preview excludes the class being edited", async ({ page }) => {
  const recorded: Recorded[] = []
  await installApi(page, recorded)
  await openSchedule(page, "en")
  await page.getByTestId("schedule-edit-12").click()
  await page.getByTestId("schedule-save").click()
  await expect(page.getByTestId("schedule-no-conflicts")).toBeVisible()
  await expect(page.getByTestId("schedule-save")).toBeEnabled()
  await page.getByTestId("schedule-no-conflicts").scrollIntoViewIfNeeded()
  await page.screenshot({ path: "/opt/cursor/artifacts/screenshots/edit-exclude-class-id-en.png" })

  const preview = recorded.find((entry) => entry.path.includes("/schedule/conflicts"))
  const body = preview?.body as { exclude_class_id?: string; class_id?: string }
  expect(body.exclude_class_id).toBe("12")
  expect("class_id" in body).toBe(false)
  expect(preview?.path).toContain("/schedule/conflicts")
})

test("centre admin audit log lists scheduling rows from the centre API", async ({ page }) => {
  const recorded: Recorded[] = []
  await installApi(page, recorded)
  await openSchedule(page, "en")
  await expect(page.getByRole("link", { name: "Audit log" }).first()).toBeVisible()
  await page.getByTestId("schedule-audit-log").click()
  await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible()
  await expect(page.getByTestId("audit-row")).toContainText("class.substitute")
  await expect(page.getByTestId("audit-row")).toContainText("Piano basics")
  await expect(page.getByTestId("audit-row")).toContainText("Instructor changed to Bo Cheung")
  await page.getByTestId("audit-row").scrollIntoViewIfNeeded()
  await page.screenshot({ path: "/opt/cursor/artifacts/screenshots/centre-audit-log-en.png" })

  const loads = recorded.filter((entry) => entry.method === "GET" && entry.path.includes("/audit-log"))
  expect(loads.length).toBeGreaterThan(0)
  expect(loads[0].path).toContain("/center/audit-log")

  await page.getByTestId("audit-from").fill("2026-10-10")
  await expect(page.getByTestId("audit-empty")).toBeVisible()
  await expect
    .poll(() => recorded.filter((entry) => entry.method === "GET" && entry.path.includes("from=2026-10-10")).length)
    .toBeGreaterThan(0)
})
