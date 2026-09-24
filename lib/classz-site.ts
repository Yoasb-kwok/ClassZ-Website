export type ClasszSurface = "info" | "school";

export const CLASSZ_SURFACE_KEY = "classz_surface";
export const CLASSZ_SURFACE_EVENT = "classz-surface-changed";

/**
 * One home, one navbar (user decision 2026-09-24): `/` is the ClassZ School
 * marketplace home for every visitor, so the surface split is retired. The
 * surface type + helpers stay because shared routes still read the stored
 * value; they now resolve to the same links and home path everywhere.
 */
const SURFACE_NAV_LINKS: NavLink[] = [
  { key: "nav.home", href: "/" },
  { key: "nav.aboutUs", href: "/our-mission" },
  { key: "nav.workshops", href: "/workshops" },
  { key: "nav.trials", href: "/trials" },
  { key: "nav.centres", href: "/centres" },
  { key: "nav.programs", href: "/programs" },
  { key: "nav.zPassport", href: "/account" },
];

function matches(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

const SCHOOL_PATHS = ["/workshops", "/trials", "/centres", "/programs"];

/** Kept for compatibility: only distinguishes school content paths now. */
export function surfaceFromPath(pathname: string): ClasszSurface | null {
  const p = pathname || "/";
  if (p === "/" || SCHOOL_PATHS.some((base) => matches(p, base)))
    return "school";
  return null;
}

export function readStoredSurface(): ClasszSurface {
  if (typeof window === "undefined") return "school";
  return window.localStorage.getItem(CLASSZ_SURFACE_KEY) === "info"
    ? "info"
    : "school";
}

export function rememberSurface(surface: ClasszSurface) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLASSZ_SURFACE_KEY, surface);
  window.dispatchEvent(new Event(CLASSZ_SURFACE_EVENT));
}

export function resolveSurface(pathname: string): ClasszSurface {
  return surfaceFromPath(pathname) ?? readStoredSurface();
}

export function homePathForSurface(_surface?: ClasszSurface) {
  return "/";
}

export type NavLink = {
  key: string;
  href: string;
  match?: string[];
  cta?: boolean;
};

export function navLinksForSurface(_surface?: ClasszSurface): NavLink[] {
  return SURFACE_NAV_LINKS;
}
