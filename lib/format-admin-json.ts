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
