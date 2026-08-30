import { getBackendOrigin } from "@/lib/backend-origin"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import { findDistrict } from "@/lib/locations"
import {
  CENTRES,
  isCentreFeatureKey,
  type Centre,
  type CentreFeatureKey,
  type CentreStaff,
} from "@/lib/centre-data"

export type PublicCentreMember = {
  id: number
  name: string
  role: string
  photo_url?: string | null
  user_id?: number | null
  sort_order?: number
}

export type PublicCentre = {
  id: number
  center_name: string
  district?: string | null
  category?: string | null
  status?: string | null
  address?: string | null
  description?: string | null
  banner_url?: string | null
  avatar_url?: string | null
  features?: string[]
  members?: PublicCentreMember[]
}

const HK_DISTRICT_SLUG: Record<string, string> = {
  "central and western": "central",
  eastern: "north-point",
  southern: "aberdeen",
  "wan chai": "causewaybay",
  "kowloon city": "kowloon-tong",
  "kwun tong": "kwun-tong",
  "sham shui po": "sham-shui-po",
  "wong tai sin": "wong-tai-sin",
  "yau tsim mong": "tsim-sha-tsui",
  islands: "islands",
  "kwai tsing": "kwai-chung",
  north: "fanling",
  "sai kung": "sai-kung",
  "sha tin": "sha-tin",
  "tai po": "tai-po",
  "tsuen wan": "tsuen-wan",
  "tuen mun": "tuen-mun",
  "yuen long": "yuen-long",
}

function districtSlugFromApi(raw: string | null | undefined): string {
  if (!raw) return "central"
  const found = findDistrict(raw)
  if (found) return found.slug
  const mapped = HK_DISTRICT_SLUG[raw.trim().toLowerCase()]
  if (mapped) return mapped
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "central"
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${getBackendOrigin()}${path}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    const body = await res.json()
    return body?.success === true ? ((body.data ?? null) as T | null) : null
  } catch {
    return null
  }
}

function mapStaff(members: PublicCentreMember[] | undefined): CentreStaff[] {
  return (members || []).map((m) => ({
    name: m.name,
    role: m.role,
    photo: resolveUploadUrl(m.photo_url) || "/images/centres/staff-1.jpg",
  }))
}

function mapFeatures(raw: string[] | undefined): CentreFeatureKey[] {
  return (raw || []).filter(isCentreFeatureKey)
}

export function mapPublicCentre(row: PublicCentre, fallback?: Centre | null): Centre {
  const banner =
    resolveUploadUrl(row.banner_url) || fallback?.banner || "/images/centres/banner.jpg"
  const avatar =
    resolveUploadUrl(row.avatar_url) || fallback?.avatar || "/images/centres/avatar.jpg"
  return {
    id: Number(row.id),
    name: row.center_name || fallback?.name || "Centre",
    districtSlug: districtSlugFromApi(row.district) || fallback?.districtSlug || "central",
    address: row.address || fallback?.address || "",
    category: row.category || fallback?.category || null,
    ageTag: fallback?.ageTag || "",
    listingImage: banner || fallback?.listingImage || "/images/centres/listing.jpg",
    rating: fallback?.rating || "—",
    reviewCount: fallback?.reviewCount ?? 0,
    welcome: row.description || fallback?.welcome || "",
    avatar,
    banner,
    map: fallback?.map || "/images/centres/map.jpg",
    staff: mapStaff(row.members),
    features: mapFeatures(row.features),
    reviews: fallback?.reviews || [],
  }
}

export async function getPublicCentres(): Promise<Centre[]> {
  const rows = (await getJson<PublicCentre[]>("/api/centers")) ?? []
  if (rows.length) {
    return rows.map((row) => mapPublicCentre(row, CENTRES.find((c) => c.id === Number(row.id)) || null))
  }
  return CENTRES
}

export async function getPublicCentre(id: string | number): Promise<Centre | null> {
  const num = Number(id)
  if (!Number.isInteger(num) || num < 1) return null
  const live = await getJson<PublicCentre>(`/api/centers/${num}`)
  if (live) {
    return mapPublicCentre(live, CENTRES.find((c) => c.id === num) || null)
  }
  return CENTRES.find((c) => c.id === num) ?? null
}
