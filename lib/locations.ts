/**
 * District catalog for the Place filter (Block B).
 *
 * HK Island mirrors the expanded region in the "Programs" capture
 * (#1582:16181 → node 1973:20037, 16 pills). Kowloon (23) and New
 * Territories (23) mirror the "Region expands" component sets
 * #1977:20197 / #1977:20334 (expanded variants) — district names pulled
 * from the design file via MCP on 2026-08-21 (names are text content;
 * pill styling comes from the captured HK Island pills).
 *
 * The API stores `location` as a slug (e.g. `sanpokong`). Matching
 * ignores spaces/hyphens/case so `san-po-kong`, `sanpokong` and
 * `San Po Kong` all resolve. Slugs not listed here fall back to a
 * humanised label and appear in listings but have no pill.
 */

export type Region = "hk-island" | "kowloon" | "new-territories"

export interface District {
  slug: string
  en: string
  zh: string
}

export const HK_ISLAND_DISTRICTS: District[] = [
  { slug: "central", en: "Central", zh: "中環" },
  { slug: "admiralty", en: "Admiralty", zh: "金鐘" },
  { slug: "tai-koo", en: "Tai Koo", zh: "太古" },
  { slug: "sai-ying-pun", en: "Sai Ying Pun", zh: "西營盤" },
  { slug: "kennedy-town", en: "Kennedy Town", zh: "堅尼地城" },
  { slug: "causewaybay", en: "Causeway Bay", zh: "銅鑼灣" },
  { slug: "north-point", en: "North Point", zh: "北角" },
  { slug: "wong-chuk-hang", en: "Wong Chuk Hang", zh: "黃竹坑" },
  { slug: "quarry-bay", en: "Quarry Bay", zh: "鰂魚涌" },
  { slug: "chai-wan", en: "Chai Wan", zh: "柴灣" },
  { slug: "aberdeen", en: "Aberdeen", zh: "香港仔" },
  { slug: "stanley", en: "Stanley", zh: "赤柱" },
  { slug: "sheung-wan", en: "Sheung Wan", zh: "上環" },
  { slug: "repulse-bay", en: "Repulse Bay", zh: "淺水灣" },
  { slug: "tin-hau", en: "Tin Hau", zh: "天后" },
  { slug: "mid-levels", en: "Mid-Levels", zh: "半山區" },
]

export const KOWLOON_DISTRICTS: District[] = [
  { slug: "tsim-sha-tsui", en: "Tsim Sha Tsui", zh: "尖沙咀" },
  { slug: "yau-ma-tei", en: "Yau Ma Tei", zh: "油麻地" },
  { slug: "jordan", en: "Jordan", zh: "佐敦" },
  { slug: "prince-edward", en: "Prince Edward", zh: "太子" },
  { slug: "mong-kok", en: "Mong Kok", zh: "旺角" },
  { slug: "ho-man-tin", en: "Ho Man Tin", zh: "何文田" },
  { slug: "mei-foo", en: "Mei Foo", zh: "美孚" },
  { slug: "sanpokong", en: "San Po Kong", zh: "新蒲崗" },
  { slug: "kowloon-bay", en: "Kowloon Bay", zh: "九龍灣" },
  { slug: "sham-shui-po", en: "Sham Shui Po", zh: "深水埗" },
  { slug: "cheung-sha-wan", en: "Cheung Sha Wan", zh: "長沙灣" },
  { slug: "lai-chi-kok", en: "Lai Chi Kok", zh: "荔枝角" },
  { slug: "kowloon-tong", en: "Kowloon Tong", zh: "九龍塘" },
  { slug: "olympic", en: "Olympic", zh: "奧運" },
  { slug: "hung-hom", en: "Hung Hom", zh: "紅磡" },
  { slug: "to-kwa-wan", en: "To Kwa Wan", zh: "土瓜灣" },
  { slug: "kai-tak", en: "Kai Tak", zh: "啟德" },
  { slug: "diamond-hill", en: "Diamond Hill", zh: "鑽石山" },
  { slug: "lam-tin", en: "Lam Tin", zh: "藍田" },
  { slug: "kwun-tong", en: "Kwun Tong", zh: "觀塘" },
  { slug: "ngau-tau-kok", en: "Ngau Tau Kok", zh: "牛頭角" },
  { slug: "yau-tong", en: "Yau Tong", zh: "油塘" },
  { slug: "wong-tai-sin", en: "Wong Tai Sin", zh: "黃大仙" },
]

export const NEW_TERRITORIES_DISTRICTS: District[] = [
  { slug: "tsuen-wan", en: "Tsuen Wan", zh: "荃灣" },
  { slug: "kwai-fong", en: "Kwai Fong", zh: "葵芳" },
  { slug: "tsing-yi", en: "Tsing Yi", zh: "青衣" },
  { slug: "tuen-mun", en: "Tuen Mun", zh: "屯門" },
  { slug: "tin-shui-wai", en: "Tin Shui Wai", zh: "天水圍" },
  { slug: "sheungshui", en: "Sheung Shui", zh: "上水" },
  { slug: "tai-po", en: "Tai Po", zh: "大埔" },
  { slug: "sha-tin", en: "Sha Tin", zh: "沙田" },
  { slug: "fotan", en: "Fo Tan", zh: "火炭" },
  { slug: "tai-wai", en: "Tai Wai", zh: "大圍" },
  { slug: "sai-kung", en: "Sai Kung", zh: "西貢" },
  { slug: "islands", en: "Islands", zh: "離島" },
  { slug: "hang-hau", en: "Hang Hau", zh: "坑口" },
  { slug: "po-lam", en: "Po Lam", zh: "寶琳" },
  { slug: "mui-wo", en: "Mui Wo", zh: "梅窩" },
  { slug: "tung-chung", en: "Tung Chung", zh: "東涌" },
  { slug: "tseung-kwan-o", en: "Tseung Kwan O", zh: "將軍澳" },
  { slug: "ma-on-shan", en: "Ma On Shan", zh: "馬鞍山" },
  { slug: "fanling", en: "Fanling", zh: "粉嶺" },
  { slug: "kwai-chung", en: "Kwai Chung", zh: "葵涌" },
  { slug: "yuen-long", en: "Yuen Long", zh: "元朗" },
  { slug: "lohas-park", en: "LOHAS Park", zh: "日出康城" },
  { slug: "discovery-bay", en: "Discovery Bay", zh: "愉景灣" },
]

const ALL_DISTRICTS: District[] = [
  ...HK_ISLAND_DISTRICTS,
  ...KOWLOON_DISTRICTS,
  ...NEW_TERRITORIES_DISTRICTS,
]

export { ALL_DISTRICTS }

const slugKey = (slug: string) => slug.trim().toLowerCase().replace(/[\s-]+/g, "")

export function findDistrict(slug: string | null | undefined): District | undefined {
  if (!slug) return undefined
  const key = slugKey(slug)
  return ALL_DISTRICTS.find(
    (d) => slugKey(d.slug) === key || slugKey(d.en) === key || slugKey(d.zh) === key,
  )
}

export function districtLabel(slug: string | null | undefined, locale: "en" | "zh-TW"): string {
  const district = findDistrict(slug)
  if (district) return locale === "zh-TW" ? district.zh : district.en
  if (!slug) return ""
  return slug
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

/** Official 18 Hong Kong districts for listing cards. */
export const HK18_DISTRICTS: District[] = [
  { slug: "central-and-western", en: "Central and Western", zh: "中西區" },
  { slug: "wan-chai", en: "Wan Chai", zh: "灣仔區" },
  { slug: "eastern", en: "Eastern", zh: "東區" },
  { slug: "southern", en: "Southern", zh: "南區" },
  { slug: "yau-tsim-mong", en: "Yau Tsim Mong", zh: "油尖旺區" },
  { slug: "sham-shui-po", en: "Sham Shui Po", zh: "深水埗區" },
  { slug: "kowloon-city", en: "Kowloon City", zh: "九龍城區" },
  { slug: "wong-tai-sin", en: "Wong Tai Sin", zh: "黃大仙區" },
  { slug: "kwun-tong", en: "Kwun Tong", zh: "觀塘區" },
  { slug: "kwai-tsing", en: "Kwai Tsing", zh: "葵青區" },
  { slug: "tsuen-wan", en: "Tsuen Wan", zh: "荃灣區" },
  { slug: "tuen-mun", en: "Tuen Mun", zh: "屯門區" },
  { slug: "yuen-long", en: "Yuen Long", zh: "元朗區" },
  { slug: "north", en: "North", zh: "北區" },
  { slug: "tai-po", en: "Tai Po", zh: "大埔區" },
  { slug: "sha-tin", en: "Sha Tin", zh: "沙田區" },
  { slug: "sai-kung", en: "Sai Kung", zh: "西貢區" },
  { slug: "islands", en: "Islands", zh: "離島區" },
]

const SLUG_TO_HK18: Record<string, string> = {
  central: "central-and-western",
  admiralty: "central-and-western",
  "sai-ying-pun": "central-and-western",
  "kennedy-town": "central-and-western",
  "sheung-wan": "central-and-western",
  "mid-levels": "central-and-western",
  causewaybay: "wan-chai",
  "tin-hau": "wan-chai",
  "wan-chai": "wan-chai",
  "tai-koo": "eastern",
  "north-point": "eastern",
  "quarry-bay": "eastern",
  "chai-wan": "eastern",
  aberdeen: "southern",
  stanley: "southern",
  "wong-chuk-hang": "southern",
  "repulse-bay": "southern",
  "tsim-sha-tsui": "yau-tsim-mong",
  "yau-ma-tei": "yau-tsim-mong",
  jordan: "yau-tsim-mong",
  "prince-edward": "yau-tsim-mong",
  "mong-kok": "yau-tsim-mong",
  olympic: "yau-tsim-mong",
  "sham-shui-po": "sham-shui-po",
  "cheung-sha-wan": "sham-shui-po",
  "lai-chi-kok": "sham-shui-po",
  "mei-foo": "sham-shui-po",
  "ho-man-tin": "kowloon-city",
  "hung-hom": "kowloon-city",
  "to-kwa-wan": "kowloon-city",
  "kowloon-tong": "kowloon-city",
  "kai-tak": "kowloon-city",
  "wong-tai-sin": "wong-tai-sin",
  "diamond-hill": "wong-tai-sin",
  sanpokong: "wong-tai-sin",
  "kwun-tong": "kwun-tong",
  "kowloon-bay": "kwun-tong",
  "lam-tin": "kwun-tong",
  "ngau-tau-kok": "kwun-tong",
  "yau-tong": "kwun-tong",
  "kwai-fong": "kwai-tsing",
  "kwai-chung": "kwai-tsing",
  "tsing-yi": "kwai-tsing",
  "tsuen-wan": "tsuen-wan",
  "tuen-mun": "tuen-mun",
  "yuen-long": "yuen-long",
  "tin-shui-wai": "yuen-long",
  sheungshui: "north",
  fanling: "north",
  "tai-po": "tai-po",
  "sha-tin": "sha-tin",
  fotan: "sha-tin",
  "tai-wai": "sha-tin",
  "ma-on-shan": "sha-tin",
  "sai-kung": "sai-kung",
  "tseung-kwan-o": "sai-kung",
  "hang-hau": "sai-kung",
  "po-lam": "sai-kung",
  "lohas-park": "sai-kung",
  islands: "islands",
  "tung-chung": "islands",
  "mui-wo": "islands",
  "discovery-bay": "islands",
}

function districtKey(value: string): string {
  return slugKey(value)
    .replace(/district$/i, "")
    .replace(/區$/u, "")
}

export function officialDistrict(slug: string | null | undefined): District | undefined {
  if (!slug) return undefined
  const found = findDistrict(slug)
  const mapped = found ? SLUG_TO_HK18[found.slug] : undefined
  if (mapped) return HK18_DISTRICTS.find((d) => d.slug === mapped)

  const key = districtKey(slug)
  const exact = HK18_DISTRICTS.find(
    (d) =>
      districtKey(d.slug) === key ||
      districtKey(d.en) === key ||
      districtKey(d.zh) === key,
  )
  if (exact) return exact

  const haystack = slugKey(slug)
  const neighbourhood = ALL_DISTRICTS.find((d) => {
    const en = slugKey(d.en)
    const zh = slugKey(d.zh)
    return (
      (en.length >= 4 && haystack.includes(en)) ||
      (zh.length >= 2 && haystack.includes(zh))
    )
  })
  if (neighbourhood) {
    const officialSlug = SLUG_TO_HK18[neighbourhood.slug]
    if (officialSlug) return HK18_DISTRICTS.find((d) => d.slug === officialSlug)
  }
  return undefined
}

export function officialDistrictFrom(
  ...values: Array<string | null | undefined>
): District | undefined {
  for (const value of values) {
    const district = officialDistrict(value)
    if (district) return district
  }
  return undefined
}

export function officialDistrictLabel(
  slug: string | null | undefined,
  locale: "en" | "zh-TW",
): string {
  const district = officialDistrict(slug)
  if (!district) return ""
  return locale === "zh-TW" ? district.zh : district.en
}

export function officialDistrictLabelFrom(
  locale: "en" | "zh-TW",
  ...values: Array<string | null | undefined>
): string {
  const district = officialDistrictFrom(...values)
  if (!district) return ""
  return locale === "zh-TW" ? district.zh : district.en
}
