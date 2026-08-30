const CENTER_CRM_SCOPE_KEY = "classz_center_crm_scope"

export function setCenterCrmScope(centerId: number) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(CENTER_CRM_SCOPE_KEY, String(centerId))
}

export function getCenterCrmScope(): number | null {
  if (typeof window === "undefined") return null

  const fromUrl =
    window.location.pathname.match(/\/admin\/center-crm\/(\d+)(?:\/|$)/) ||
    window.location.pathname.match(/\/admin\/center-profiles\/(\d+)(?:\/|$)/)
  if (fromUrl) {
    const n = Number(fromUrl[1])
    if (Number.isFinite(n) && n >= 1) return n
  }
  return null
}

export function isOnCenterCrmScopedPage(): boolean {
  return getCenterCrmScope() != null
}

export function clearCenterCrmScope() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(CENTER_CRM_SCOPE_KEY)
}

export function centerCrmBasePath(centerId: number): string {
  return `/admin/center-crm/${centerId}`
}

export type CenterCrmFlow = "programs" | "schedule" | "attendance"

export function centerCrmFlowPath(centerId: number, flow: CenterCrmFlow): string {
  return `${centerCrmBasePath(centerId)}/${flow}`
}

/** Schedule 點名 etc. Stay inside /admin/center-crm/:id when opened from CRM. */
export function adminFlowHref(
  pathname: string,
  flow: CenterCrmFlow,
  query?: Record<string, string>,
): string {
  const qs = query
    ? `?${new URLSearchParams(query).toString()}`
    : ""
  const crm = pathname.match(/\/admin\/center-crm\/(\d+)/)
  if (crm) return `${centerCrmFlowPath(Number(crm[1]), flow)}${qs}`
  return `/admin/${flow}${qs}`
}
