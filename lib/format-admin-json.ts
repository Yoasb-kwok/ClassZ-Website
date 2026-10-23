/**
 * Pretty-print a dashboard payload for an admin debug panel.
 * `JSON.stringify(null)` is the string "null", which must not be shown as a metric.
 * Returns null when there is nothing to print so the caller can use the empty-data copy.
 */
export function formatAdminJson(value: unknown): string | null {
  if (value == null) return null
  const text = JSON.stringify(value, null, 2)
  if (text == null || text === "null") return null
  return text
}

/**
 * A conversion-funnel payload is meaningful only when some count, rate, or stage
 * value is non-zero. Channel names and stage labels are not metrics, and an
 * all-zero object is a valid empty API payload.
 */
export function funnelHasMetric(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value) && value !== 0
  if (Array.isArray(value)) return value.some(funnelHasMetric)
  if (value !== null && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(funnelHasMetric)
  }
  return false
}

/** Pretty-print a real funnel. Missing and all-zero payloads return null. */
export function formatSalesFunnel(value: unknown): string | null {
  if (!funnelHasMetric(value)) return null
  return formatAdminJson(value)
}
