/**
 * Hong Kong general holidays for calendar display on /schedule — rendered
 * as gray entries per the 0310 "Schedule" capture (mock "Memorial Day"
 * styled: small gray text under the date number).
 * 2025–2026 are gazetted; 2027 is not yet gazetted and is omitted.
 */
export type Holiday = { date: string; name: string };

export const HK_HOLIDAYS: Holiday[] = [
  // 2025
  { date: "2025-01-01", name: "New Year's Day" },
  { date: "2025-01-29", name: "Chinese New Year" },
  { date: "2025-01-30", name: "Chinese New Year" },
  { date: "2025-01-31", name: "Chinese New Year" },
  { date: "2025-04-04", name: "Ching Ming Festival" },
  { date: "2025-04-18", name: "Good Friday" },
  { date: "2025-04-19", name: "Holy Saturday" },
  { date: "2025-04-21", name: "Easter Monday" },
  { date: "2025-05-01", name: "Labour Day" },
  { date: "2025-05-05", name: "Buddha's Birthday" },
  { date: "2025-05-31", name: "Tuen Ng Festival" },
  { date: "2025-07-01", name: "HKSAR Establishment Day" },
  { date: "2025-10-07", name: "Day after Mid-Autumn" },
  { date: "2025-10-29", name: "Chung Yeung Festival" },
  { date: "2025-12-25", name: "Christmas Day" },
  { date: "2025-12-26", name: "Boxing Day" },
  // 2026
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-02-17", name: "Chinese New Year" },
  { date: "2026-02-18", name: "Chinese New Year" },
  { date: "2026-02-19", name: "Chinese New Year" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-04", name: "Holy Saturday" },
  { date: "2026-04-06", name: "Easter Monday" },
  { date: "2026-04-07", name: "Ching Ming Festival" },
  { date: "2026-05-01", name: "Labour Day" },
  { date: "2026-05-25", name: "Buddha's Birthday" },
  { date: "2026-06-19", name: "Tuen Ng Festival" },
  { date: "2026-07-01", name: "HKSAR Establishment Day" },
  { date: "2026-09-26", name: "Day after Mid-Autumn" },
  { date: "2026-10-01", name: "National Day" },
  { date: "2026-10-19", name: "Chung Yeung Festival" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-26", name: "Boxing Day" },
];

const BY_DATE = new Map(HK_HOLIDAYS.map((h) => [h.date, h.name]));

/** dateKey "YYYY-MM-DD" → holiday name, or null. */
export function holidayFor(dateKey: string): string | null {
  return BY_DATE.get(dateKey) ?? null;
}
