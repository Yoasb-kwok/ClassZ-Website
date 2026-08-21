/**
 * t() only supports plain string lookups; this interpolates {placeholders}
 * for the few parametrised strings in the Block B copy (e.g. "{count} lessons").
 */
export function formatTemplate(
  t: (key: string) => string,
  key: string,
  vars: Record<string, string | number>
): string {
  return t(key).replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] != null ? String(vars[name]) : `{${name}}`
  )
}
