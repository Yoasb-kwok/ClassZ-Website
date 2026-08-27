import { jwtDecode } from "jwt-decode"

export const CLASSZ_SESSION_KEY = "classz_session"

export type ClasszPortalRole = "platform_admin" | "center_admin" | "coach"

export type ClasszSession = {
  token: string
  user: {
    email: string
    name: string
    role: ClasszPortalRole
    roleLabel: string
    center_id?: number | null
  }
}

const USE_DEMO = process.env.NEXT_PUBLIC_CLASSZ_USE_DEMO === "1"

const DEMO_USERS: Record<
  string,
  { password: string; name: string; role: ClasszPortalRole; roleLabel: string }
> = {}

export function roleLabelFor(role: ClasszPortalRole): string {
  if (role === "platform_admin") return "平台"
  if (role === "center_admin") return "中心"
  return "導師"
}

export function getClasszSession(): ClasszSession | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(CLASSZ_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ClasszSession
  } catch {
    return null
  }
}

export function setClasszSession(session: ClasszSession) {
  localStorage.setItem(CLASSZ_SESSION_KEY, JSON.stringify(session))
}

export function clearClasszSession() {
  localStorage.removeItem(CLASSZ_SESSION_KEY)
}

function mapJwtRole(payload: {
  role?: string
  portal?: string
  is_admin?: number
}): ClasszPortalRole {
  if (Number(payload.is_admin) === 1) return "platform_admin"
  const p = String(payload.portal || "").toLowerCase()
  if (p === "platform_admin") return "platform_admin"
  if (p === "coach") return "coach"
  if (p === "center_admin") return "center_admin"
  const r = String(payload.role || "").toLowerCase()
  if (r === "admin" || r === "platform_admin") return "platform_admin"
  if (r === "coach") return "coach"
  if (r === "center_admin") return "center_admin"
  return "center_admin"
}

async function loginViaProxy(loginIdentifier: string, password: string) {
  const res = await fetch("/api/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      loginIdentifier: loginIdentifier.trim(),
      password,
      rememberMe: true,
    }),
  })
  const data = (await res.json()) as {
    success?: boolean
    msg?: string
    message?: string
    token?: string
    user?: { email?: string; name?: string; ID?: number; id?: number }
  }
  if (!res.ok || !data.success || !data.token) {
    const err = new Error(data.msg || data.message || "Login failed") as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return data
}

export function isDemoTokenSession(): boolean {
  const s = getClasszSession()
  return !s?.token || s.token === "demo-classz-token"
}

export async function classzSignIn(loginIdentifier: string, password: string): Promise<void> {
  const id = loginIdentifier.trim().toLowerCase()

  if (!USE_DEMO) {
    try {
      const data = await loginViaProxy(loginIdentifier, password)
      const payload = jwtDecode<{
        role?: string
        portal?: string
        role_label?: string
        is_admin?: number
        email?: string
        name?: string
        center_id?: number
      }>(data.token!)
      const role = mapJwtRole(payload)
      const email = data.user?.email || payload.email || loginIdentifier.trim()
      const name =
        data.user?.name ||
        payload.name ||
        (data.user as { username?: string })?.username ||
        email
      setClasszSession({
        token: data.token!,
        user: {
          email,
          name,
          role,
          roleLabel: payload.role_label || roleLabelFor(role),
          center_id: payload.center_id ?? null,
        },
      })
      return
    } catch (e) {
      const status = (e as Error & { status?: number }).status
      // Do not fall back to demo session when API is down (503) — that breaks /api/admin/* JWT auth.
      if (status && status !== 401) throw e
      const demo = DEMO_USERS[id]
      if (!demo) throw e
    }
  }

  const u = DEMO_USERS[id]
  if (!u || u.password !== password) {
    throw new Error("Invalid email or password")
  }
  setClasszSession({
    token: "demo-classz-token",
    user: {
      email: loginIdentifier.trim(),
      name: u.name,
      role: u.role,
      roleLabel: u.roleLabel,
    },
  })
}

export async function classzRegisterCenterAndSignIn(body: {
  center_name: string
  district: string
  category: string
  email: string
  password: string
  full_name: string
  mobile: string
}): Promise<void> {
  const res = await fetch("/api/public/centers/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = (await res.json()) as {
    success?: boolean
    msg?: string
    message?: string
    token?: string
    user?: { email: string; name: string; role: string; center_id: number }
  }
  if (!res.ok || !data.success || !data.token) {
    throw new Error(data.msg || data.message || "Registration failed")
  }
  const payload = jwtDecode<{ role?: string; center_id?: number; email?: string; name?: string }>(data.token)
  setClasszSession({
    token: data.token,
    user: {
      email: data.user?.email || payload.email || body.email,
      name: data.user?.name || payload.name || body.full_name,
      role: "center_admin",
      roleLabel: roleLabelFor("center_admin"),
      center_id: data.user?.center_id ?? payload.center_id ?? null,
    },
  })
}
