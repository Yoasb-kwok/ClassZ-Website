import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { formatAdminJson, formatSalesFunnel } from "./format-admin-json.ts"

const EMPTY_EN = "No data"
const EMPTY_ZH = "無數據"

function funnelBody(value: unknown, zh: boolean) {
  return formatSalesFunnel(value) ?? (zh ? EMPTY_ZH : EMPTY_EN)
}

/** Prod demo shape: a real payload whose counts, rates, and stages are all zero. */
const zeroFunnel = {
  byChannel: [
    {
      channel: "Website",
      channelKey: "website",
      trialCount: 0,
      enrollmentCount: 0,
      conversionRate: 0,
      revenue: 0,
      leadCount: 0,
      convertedCount: 0,
    },
  ],
  funnelStages: [
    { nameKey: "trial", value: 0 },
    { nameKey: "enrolled", value: 0 },
  ],
  trialToEnrollmentRate: 0,
  totalTrialCount: 0,
  newEnrollmentCount: 0,
  relatedRevenue: 0,
  adLeadCount: 0,
  adConvertedCount: 0,
  adConversionRate: 0,
}

test("a missing funnel is the existing empty copy, not the word null", () => {
  for (const missing of [null, undefined]) {
    assert.equal(formatAdminJson(missing), null)
    assert.equal(formatSalesFunnel(missing), null)
    assert.equal(funnelBody(missing, false), EMPTY_EN)
    assert.equal(funnelBody(missing, true), EMPTY_ZH)
    assert.equal(funnelBody(missing, false).includes("null"), false)
    assert.equal(funnelBody(missing, true).includes("null"), false)
  }
})

test("an all-zero funnel, including named channels and zero stages, is empty", () => {
  assert.equal(formatSalesFunnel(zeroFunnel), null)
  assert.equal(funnelBody(zeroFunnel, false), EMPTY_EN)
  assert.equal(funnelBody(zeroFunnel, true), EMPTY_ZH)
  assert.equal(funnelBody(zeroFunnel, false).includes("null"), false)
  assert.equal(funnelBody(zeroFunnel, false).includes("Website"), false)

  assert.equal(formatSalesFunnel({}), null)
  assert.equal(formatSalesFunnel({ byChannel: [], funnelStages: [] }), null)
  assert.equal(formatSalesFunnel({ byChannel: null, funnelStages: null, totalTrialCount: 0 }), null)
  assert.equal(formatSalesFunnel([]), null)
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

test("a zero funnel with one real count or stage still pretty-prints", () => {
  const withCount = { ...zeroFunnel, totalTrialCount: 2 }
  assert.equal(formatSalesFunnel(withCount), JSON.stringify(withCount, null, 2))

  const withStage = {
    ...zeroFunnel,
    funnelStages: [
      { nameKey: "trial", value: 0 },
      { nameKey: "enrolled", value: 1 },
    ],
  }
  assert.equal(formatSalesFunnel(withStage), JSON.stringify(withStage, null, 2))
  assert.match(formatSalesFunnel(withStage) ?? "", /"nameKey": "enrolled"/)
})

test("crm sales funnel renders through formatSalesFunnel", () => {
  const source = readFileSync(new URL("../components/admin/crm-manager.tsx", import.meta.url), "utf8")
  assert.match(source, /formatSalesFunnel\(funnel\)/)
  assert.doesNotMatch(source, /JSON\.stringify\(funnel/)
  assert.match(source, /無數據/)
  assert.match(source, /No data/)
})
