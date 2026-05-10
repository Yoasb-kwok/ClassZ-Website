/**
 * Origin of the ClassZ / merged API (no trailing slash, no `/api` suffix).
 * Matches precedence used in `app/api/auth/loginfordelete/route.ts`.
 */
export function getBackendOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.BACKEND_URL ||
    'https://api.classz.co'
  return raw.replace(/\/$/, '').replace(/\/api\/?$/, '')
}
