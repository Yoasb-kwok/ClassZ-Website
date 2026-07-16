/**
 * Origin of the ClassZ / merged API (no trailing slash, no `/api` suffix).
 * Matches precedence used in `app/api/auth/loginfordelete/route.ts`.
 */
export function getBackendOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_CLASSZ_API_URL?.replace(/\/api\/?$/, "") ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3003" : "https://api.classz.co")
  return raw.replace(/\/$/, "").replace(/\/api\/?$/, "")
}
