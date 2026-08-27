export type VerifyChannel = "email" | "mobile"

async function parseVerifyResponse(res: Response): Promise<{ success: boolean; msg: string }> {
  const text = await res.text()
  let data: { success?: boolean; msg?: string; message?: string }
  try {
    data = JSON.parse(text) as { success?: boolean; msg?: string; message?: string }
  } catch {
    throw new Error(
      "Verification API is not available. For localhost, run ClassZ-api on port 3003 and point BACKEND_URL at http://localhost:3003.",
    )
  }
  return {
    success: Boolean(data.success),
    msg: data.msg || data.message || "Request failed",
  }
}

export async function sendRegistrationOtp(
  channel: VerifyChannel,
  target: string,
  language: "en" | "zh-TW" = "en",
) {
  const res = await fetch("/api/public/verify/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel, target, language }),
  })
  const data = await parseVerifyResponse(res)
  if (!res.ok || !data.success) throw new Error(data.msg)
  return data
}

export async function checkRegistrationOtp(channel: VerifyChannel, target: string, otp: string) {
  const res = await fetch("/api/public/verify/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel, target, otp }),
  })
  const data = await parseVerifyResponse(res)
  if (!res.ok || !data.success) throw new Error(data.msg)
  return data
}
