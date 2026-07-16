import { getClasszSession, isDemoTokenSession, type ClasszPortalRole } from "@/lib/classz-auth"
import { getCenterCrmScope, isOnCenterCrmScopedPage } from "@/lib/center-crm-scope"

export type ApiResult<T> = { success: boolean; data?: T; msg?: string }

function apiBase(): string {
  if (typeof window !== "undefined") return "/api"
  const origin =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_CLASSZ_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:3003"
  return `${origin.replace(/\/$/, "").replace(/\/api\/?$/, "")}/api`
}

export function getApiPrefix(role: ClasszPortalRole): string {
  return role === "platform_admin" ? "/admin" : "/center"
}

function appendQueryParam(path: string, key: string, value: string | number): string {
  const [base, qs] = path.split("?")
  const params = new URLSearchParams(qs || "")
  params.set(key, String(value))
  const s = params.toString()
  return s ? `${base}?${s}` : base
}

/** Platform admin on /admin/center-crm/:id/* uses /center/* + center_id. */
function resolveRequest(path: string, role?: ClasszPortalRole) {
  const session = getClasszSession()
  const userRole = role || session?.user.role || "center_admin"
  const scopeId = getCenterCrmScope()
  const useCenterScope =
    role !== "platform_admin" &&
    userRole === "platform_admin" &&
    scopeId != null &&
    isOnCenterCrmScopedPage()

  if (useCenterScope) {
    return {
      prefix: "/center",
      path: appendQueryParam(path, "center_id", scopeId),
      scopeId,
    }
  }

  return {
    prefix: getApiPrefix(userRole),
    path,
    scopeId: null as number | null,
  }
}

function authHeaders(scopeId: number | null): HeadersInit {
  const session = getClasszSession()
  const h: Record<string, string> = { "Content-Type": "application/json" }
  if (session?.token && session.token !== "demo-classz-token") {
    h.Authorization = `Bearer ${session.token}`
  }
  if (scopeId) {
    h["X-Center-Id"] = String(scopeId)
  }
  return h
}

async function parseJson<T>(res: Response): Promise<ApiResult<T>> {
  const body = (await res.json().catch(() => ({}))) as ApiResult<T> & { message?: string }
  if (!res.ok) {
    const msg = body.msg || body.message || `HTTP ${res.status}`
    if (res.status === 422 && /provide token/i.test(msg) && isDemoTokenSession()) {
      throw new Error("Session has no API token. Log out, ensure classz-api is running, then sign in again.")
    }
    throw new Error(msg)
  }
  return body
}

export async function apiGet<T>(path: string, role?: ClasszPortalRole): Promise<T> {
  const { prefix, path: scopedPath, scopeId } = resolveRequest(path, role)
  const res = await fetch(`${apiBase()}${prefix}${scopedPath}`, { headers: authHeaders(scopeId) })
  const json = await parseJson<T>(res)
  return json.data as T
}

export async function apiPost<T>(path: string, body: unknown, role?: ClasszPortalRole): Promise<T> {
  const { prefix, path: scopedPath, scopeId } = resolveRequest(path, role)
  const res = await fetch(`${apiBase()}${prefix}${scopedPath}`, {
    method: "POST",
    headers: authHeaders(scopeId),
    body: JSON.stringify(body),
  })
  const json = await parseJson<T>(res)
  return json.data as T
}

export async function apiPatch<T>(path: string, body: unknown, role?: ClasszPortalRole): Promise<T> {
  const { prefix, path: scopedPath, scopeId } = resolveRequest(path, role)
  const res = await fetch(`${apiBase()}${prefix}${scopedPath}`, {
    method: "PATCH",
    headers: authHeaders(scopeId),
    body: JSON.stringify(body),
  })
  const json = await parseJson<T>(res)
  return json.data as T
}

export async function apiPut<T>(path: string, body: unknown, role?: ClasszPortalRole): Promise<T> {
  const { prefix, path: scopedPath, scopeId } = resolveRequest(path, role)
  const res = await fetch(`${apiBase()}${prefix}${scopedPath}`, {
    method: "PUT",
    headers: authHeaders(scopeId),
    body: JSON.stringify(body),
  })
  const json = await parseJson<T>(res)
  return json.data as T
}

export async function apiDelete<T>(path: string, role?: ClasszPortalRole): Promise<T> {
  const { prefix, path: scopedPath, scopeId } = resolveRequest(path, role)
  const res = await fetch(`${apiBase()}${prefix}${scopedPath}`, {
    method: "DELETE",
    headers: authHeaders(scopeId),
  })
  const json = await parseJson<T>(res)
  return json.data as T
}
