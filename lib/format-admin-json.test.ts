import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { formatAdminJson } from "./format-admin-json.ts"

const EMPTY_EN = "No data"
const EMPTY_ZH = "無數據"

function funnelBody(value: unknown, zh: boolean) {
  return formatAdminJson(value) ?? (zh ? EMPTY_ZH : EMPTY_EN)
}

test("a missing funnel is the existing empty copy, not the word null", () => {
  for (const missing of [null, undefined]) {
    assert.equal(formatAdminJson(missing), null)
    assert.equal(funnelBody(missing, false), EMPTY_EN)
    assert.equal(funnelBody(missing, true), EMPTY_ZH)
    assert.equal(funnelBody(missing, false).includes("null"), false)
    assert.equal(funnelBody(missing, true).includes("null"), false)
  }
})

test("a populated funnel still pretty-prints", () => {
  const payload = {
    trialToEnrollmentRate: 12.5,
    totalTrialCount: 8,
    newEnrollmentCount: 1,
    byChannel: [{ channel: "walk-in", conversionRate: 10 }],
  }
  const text = funnelBody(payload, false)
  assert.equal(text, JSON.stringify(payload, null, 2))
  assert.match(text, /"trialToEnrollmentRate": 12\.5/)
  assert.match(text, /"channel": "walk-in"/)
  assert.equal(text.includes("null"), false)
})

test("crm sales funnel renders through formatAdminJson", () => {
  const source = readFileSync(new URL("../components/admin/crm-manager.tsx", import.meta.url), "utf8")
  assert.match(source, /formatAdminJson\(funnel\)/)
  assert.doesNotMatch(source, /JSON\.stringify\(funnel/)
  assert.match(source, /無數據/)
  assert.match(source, /No data/)
})
