export const CENTRE_CATEGORY_VALUES = [
  "academic",
  "music",
  "art",
  "dance",
  "sports",
  "stem",
  "language",
  "parentChild",
  "others",
] as const

export type CentreCategoryValue = (typeof CENTRE_CATEGORY_VALUES)[number]

export const CENTRE_CATEGORIES: ReadonlyArray<{
  value: CentreCategoryValue
  en: string
  zh: string
}> = [
  { value: "academic", en: "Academic", zh: "學術" },
  { value: "music", en: "Music", zh: "音樂" },
  { value: "art", en: "Art", zh: "藝術" },
  { value: "dance", en: "Dance", zh: "舞蹈" },
  { value: "sports", en: "Sports", zh: "運動" },
  { value: "stem", en: "STEM", zh: "STEM" },
  { value: "language", en: "Language", zh: "語言" },
  { value: "parentChild", en: "Parent Child", zh: "親子" },
  { value: "others", en: "Others", zh: "其他" },
]

export const PHONE_REGION_IDS = ["HK", "MO", "CN"] as const
export type PhoneRegionId = (typeof PHONE_REGION_IDS)[number]

export const PHONE_REGIONS: ReadonlyArray<{
  id: PhoneRegionId
  callingCode: string
  en: string
  zh: string
  placeholder: string
}> = [
  { id: "HK", callingCode: "852", en: "HK +852", zh: "香港 +852", placeholder: "9123 4567" },
  { id: "MO", callingCode: "853", en: "MO +853", zh: "澳門 +853", placeholder: "6612 3456" },
  { id: "CN", callingCode: "86", en: "CN +86", zh: "中國 +86", placeholder: "138 0013 8000" },
]

export function isCentreCategoryValue(value: string): value is CentreCategoryValue {
  return (CENTRE_CATEGORY_VALUES as readonly string[]).includes(value)
}

export function isPhoneRegionId(value: string): value is PhoneRegionId {
  return (PHONE_REGION_IDS as readonly string[]).includes(value)
}

export function isValidEmail(email: string): boolean {
  const s = email.trim()
  if (!s || s.length > 254 || s.includes("..")) return false
  return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(s)
}

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "")
}

export function localPhoneDigits(region: PhoneRegionId, raw: string): string {
  let digits = digitsOnly(raw)
  if (region === "HK" && digits.startsWith("852") && digits.length === 11) {
    digits = digits.slice(3)
  } else if (region === "MO" && digits.startsWith("853") && digits.length === 11) {
    digits = digits.slice(3)
  } else if (region === "CN" && digits.startsWith("86") && digits.length === 13) {
    digits = digits.slice(2)
  }
  return digits
}

export function isValidRegionalPhone(region: PhoneRegionId, raw: string): boolean {
  const digits = localPhoneDigits(region, raw)
  if (region === "HK") return /^[2-9]\d{7}$/.test(digits)
  if (region === "MO") return /^(6\d{7}|28\d{6})$/.test(digits)
  return /^1[3-9]\d{9}$/.test(digits)
}

export function formatInternationalPhone(region: PhoneRegionId, raw: string): string {
  const regionMeta = PHONE_REGIONS.find((item) => item.id === region)
  const digits = localPhoneDigits(region, raw)
  return regionMeta ? `+${regionMeta.callingCode}${digits}` : digits
}

export const HK_CENTRE_DISTRICTS = [
  "Central and Western",
  "Eastern",
  "Southern",
  "Wan Chai",
  "Kowloon City",
  "Kwun Tong",
  "Sham Shui Po",
  "Wong Tai Sin",
  "Yau Tsim Mong",
  "Islands",
  "Kwai Tsing",
  "North",
  "Sai Kung",
  "Sha Tin",
  "Tai Po",
  "Tsuen Wan",
  "Tuen Mun",
  "Yuen Long",
] as const

export type PasswordChecks = {
  hasLen: boolean
  hasNumber: boolean
  hasUpper: boolean
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    hasLen: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasUpper: /[A-Z]/.test(password),
  }
}

export function isStrongPassword(password: string): boolean {
  const checks = getPasswordChecks(password)
  return checks.hasLen && checks.hasNumber && checks.hasUpper
}

export type PasswordStrength = "empty" | "weak" | "medium" | "strong"

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "empty"
  const checks = getPasswordChecks(password)
  const met = [checks.hasLen, checks.hasNumber, checks.hasUpper].filter(Boolean).length
  const hasLower = /[a-z]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  if (!checks.hasLen || met <= 1) return "weak"
  if (met === 2) return "medium"
  if ((hasLower && hasSpecial) || password.length >= 12) return "strong"
  return "medium"
}
