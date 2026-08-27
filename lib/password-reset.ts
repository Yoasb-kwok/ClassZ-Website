type ApiResult = {
  success?: boolean
  msg?: string
  message?: string
  errors?: { msg?: string }[]
}

async function parseApiResponse(res: Response): Promise<{ success: boolean; msg: string }> {
  const text = await res.text()
  let data: ApiResult
  try {
    data = JSON.parse(text) as ApiResult
  } catch {
    throw new Error(
      "Verification API is not available. For localhost, run ClassZ-api on port 3003 and point BACKEND_URL at http://localhost:3003.",
    )
  }
  const msg =
    data.msg || data.message || data.errors?.[0]?.msg || "Request failed"
  return { success: Boolean(data.success), msg }
}

export async function requestPasswordReset(email: string, language: "en" | "zh-TW" = "en") {
  const res = await fetch("/api/user/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, language }),
  })
  const data = await parseApiResponse(res)
  if (!res.ok || !data.success) throw new Error(data.msg)
  return data
}

export async function verifyPasswordResetOtp(email: string, otp: string) {
  const res = await fetch("/api/user/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  })
  const data = await parseApiResponse(res)
  if (!res.ok || !data.success) throw new Error(data.msg)
  return data
}

export async function resetPasswordWithOtp(
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string,
) {
  const res = await fetch("/api/user/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
  })
  const data = await parseApiResponse(res)
  if (!res.ok || !data.success) throw new Error(data.msg)
  return data
}
