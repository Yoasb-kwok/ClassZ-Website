export type ClasszSurface = "info" | "school"

export const CLASSZ_SURFACE_KEY = "classz_surface"
export const CLASSZ_SURFACE_EVENT = "classz-surface-changed"

const INFO_PATHS = ["/about", "/for-parents", "/for-learning-centres", "/zpassport"]
const SCHOOL_PATHS = ["/school", "/workshops", "/trials", "/centres", "/programs"]

function matches(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`)
}

/** Exclusive surfaces. Shared routes (account, contact…) return null. */
export function surfaceFromPath(pathname: string): ClasszSurface | null {
  const p = pathname || "/"
  if (p === "/") return "info"
  if (INFO_PATHS.some((base) => matches(p, base))) return "info"
  if (SCHOOL_PATHS.some((base) => matches(p, base))) return "school"
  return null
}

export function readStoredSurface(): ClasszSurface {
  if (typeof window === "undefined") return "info"
  return window.localStorage.getItem(CLASSZ_SURFACE_KEY) === "school" ? "school" : "info"
}

export function rememberSurface(surface: ClasszSurface) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CLASSZ_SURFACE_KEY, surface)
  window.dispatchEvent(new Event(CLASSZ_SURFACE_EVENT))
}

export function resolveSurface(pathname: string): ClasszSurface {
  return surfaceFromPath(pathname) ?? readStoredSurface()
}

export function homePathForSurface(surface: ClasszSurface) {
  return surface === "school" ? "/school" : "/"
}

export type NavLink = {
  key: string
  href: string
  match?: string[]
  cta?: boolean
}

export const INFO_NAV_LINKS: NavLink[] = [
  { key: "nav.home", href: "/" },
  { key: "nav.aboutUs", href: "/about" },
  { key: "nav.zPassport", href: "/zpassport" },
  { key: "nav.forParents", href: "/for-parents" },
  { key: "nav.forCentres", href: "/for-learning-centres" },
  { key: "nav.classzSchool", href: "/school", cta: true },
]

export const SCHOOL_NAV_LINKS: NavLink[] = [
  { key: "nav.home", href: "/school" },
  { key: "nav.aboutUs", href: "/our-mission" },
  { key: "nav.workshops", href: "/workshops" },
  { key: "nav.trials", href: "/trials" },
  { key: "nav.centres", href: "/centres" },
  { key: "nav.programs", href: "/programs" },
  { key: "nav.zPassport", href: "/account" },
]

export function navLinksForSurface(surface: ClasszSurface): NavLink[] {
  return surface === "school" ? SCHOOL_NAV_LINKS : INFO_NAV_LINKS
}
