const CENTER_CRM_SCOPE_KEY = "classz_center_crm_scope"

export function setCenterCrmScope(centerId: number) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(CENTER_CRM_SCOPE_KEY, String(centerId))
}

export function getCenterCrmScope(): number | null {
  if (typeof window === "undefined") return null

  // Scope only while on /admin/center-crm/:id/* — never leak to platform pages.
  const fromUrl = window.location.pathname.match(/\/admin\/center-crm\/(\d+)(?:\/|$)/)
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

export function centerCrmFlowPath(centerId: number, flow: "programs" | "schedule" | "attendance" | "feedback"): string {
  return `${centerCrmBasePath(centerId)}/${flow}`
}
