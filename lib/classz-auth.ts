import { jwtDecode } from "jwt-decode"

export const CLASSZ_SESSION_KEY = "classz_session"

export type ClasszPortalRole = "center_admin" | "coach"

export type ClasszSession = {
  token: string
  user: {
    email: string
    name: string
    role: ClasszPortalRole
    roleLabel: string
  }
}

const DEMO_PASSWORD = "demo1234"

const DEMO_USERS: Record<
  string,
  { password: string; name: string; role: ClasszPortalRole; roleLabel: string }
> = {
  "center@classz.demo": {
    password: DEMO_PASSWORD,
    name: "ClassZ 中心示範",
    role: "center_admin",
    roleLabel: "中心",
  },
  "coach@classz.demo": {
    password: DEMO_PASSWORD,
    name: "ClassZ 導師示範",
    role: "coach",
    roleLabel: "導師",
  },
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
  is_admin?: number
}): ClasszPortalRole {
  if (Number(payload.is_admin) === 1) return "center_admin"
  const r = String(payload.role || "").toLowerCase()
  if (r === "center_admin" || r === "admin") return "center_admin"
  if (r === "coach") return "coach"
  return "center_admin"
}

export async function classzSignIn(loginIdentifier: string, password: string): Promise<void> {
  const id = loginIdentifier.trim().toLowerCase()
  const base = process.env.NEXT_PUBLIC_CLASSZ_API_URL?.replace(/\/$/, "")

  if (base) {
    try {
      const res = await fetch(`${base}/api/user/login`, {
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
        token?: string
        user?: { email?: string; name?: string; ID?: number; id?: number }
      }
      if (!res.ok || !data.success || !data.token) {
        throw new Error(data.msg || "Login failed")
      }
      const payload = jwtDecode<{
        role?: string
        is_admin?: number
        email?: string
        name?: string
      }>(data.token)
      const role = mapJwtRole(payload)
      const email = data.user?.email || payload.email || loginIdentifier.trim()
      const name =
        data.user?.name ||
        payload.name ||
        (data.user as { username?: string })?.username ||
        email
      setClasszSession({
        token: data.token,
        user: {
          email,
          name,
          role,
          roleLabel: role === "center_admin" ? "中心" : "導師",
        },
      })
      return
    } catch {
      /* fall through to demo */
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
