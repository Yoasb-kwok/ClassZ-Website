import { apiGet, apiPost } from "@/lib/classz-api-client";

/**
 * ADR-005 — lesson reservations (parent pays → centre approves).
 * Client helpers for the /payment flow and the parent bookings feed.
 */

export type ReservationStatus =
  "pending" | "rejected" | "fulfilled" | "expired";

export type ReservationLesson = {
  id: number;
  name: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
};

export type Reservation = {
  id: string;
  status: ReservationStatus;
  student: { id: number | null; name: string };
  course: { id: number | null; name: string };
  centre: { id: number | null; name: string };
  lesson_count: number;
  amount_hkd: number | null;
  paid: boolean;
  refunded: boolean;
  rejection_reason: string | null;
  expires_at: string | null;
  first_lesson_start: string | null;
  created_at: string | null;
  fulfilled_at: string | null;
  lessons: ReservationLesson[];
};

export type ChildProfile = {
  id: number;
  full_name: string;
  photo_url?: string | null;
};

export type ParentCoupon = {
  id: number;
  code: string;
  status: string;
  discount_type: string;
  discount_value: number | null;
  min_order_amount: number | null;
  valid_until: string | null;
  center_id: number | null;
  center_name: string | null;
  claimed_at?: string | null;
  used_at?: string | null;
};

export type CreateReservationResponse = {
  request: {
    id: string | null;
    status: "pending";
    amount_hkd: number;
    expires_at: string;
    lesson_class_ids: number[];
  };
  checkout_url: string;
  session_id: string;
};

export function createReservation(body: {
  class_ids: number[];
  profile_id?: number | null;
  coupon_id?: number | null;
  course_id?: number | null;
}) {
  return apiPost<CreateReservationResponse>(
    "/enrollment-requests",
    body,
    "student",
  );
}

export function fetchMyReservations() {
  return apiGet<Reservation[]>("/enrollment-requests", "student");
}

export function fetchMyChildren() {
  return apiGet<ChildProfile[]>("/children", "student");
}

export function fetchMyCoupons() {
  return apiGet<ParentCoupon[]>("/coupons", "student");
}

export function claimPromoCode(code: string) {
  return apiPost<{ coupon_id?: number; code?: string }>(
    "/coupons/claim",
    { code },
    "student",
  );
}

/** POST /api/student/payment-methods/setup → Stripe URL (ADR-006). */
export async function createPaymentMethodSetup(): Promise<string | null> {
  try {
    const data = await apiPost<{ url?: string }>(
      "/payment-methods/setup",
      {},
      "student",
    );
    return data?.url ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Coupon math — mirrors helpers/reservationMath.js on the API (ADR-005 D3:
// the discounted amount is what gets snapshotted onto the request).
// ---------------------------------------------------------------------------

export type CouponVerdict =
  | { ok: true; discount: number }
  | { ok: false; code: string; minSpend?: number };

export function evaluateCouponClient(
  coupon: Pick<
    ParentCoupon,
    | "status"
    | "discount_type"
    | "discount_value"
    | "min_order_amount"
    | "valid_until"
    | "center_id"
  >,
  subtotal: number,
  centerId: number | null,
): CouponVerdict {
  if (coupon.status !== "available")
    return { ok: false, code: "COUPON_UNAVAILABLE" };
  if (
    coupon.valid_until &&
    new Date(coupon.valid_until).getTime() < Date.now()
  ) {
    return { ok: false, code: "COUPON_EXPIRED" };
  }
  if (
    coupon.center_id != null &&
    centerId != null &&
    Number(coupon.center_id) !== Number(centerId)
  ) {
    return { ok: false, code: "COUPON_CENTRE_MISMATCH" };
  }
  const min = Number(coupon.min_order_amount) || 0;
  if (min > 0 && subtotal < min)
    return { ok: false, code: "COUPON_MIN_SPEND", minSpend: min };
  const value = Number(coupon.discount_value) || 0;
  const discount =
    coupon.discount_type === "percentage"
      ? Math.round(subtotal * Math.min(value, 100)) / 100
      : Math.min(value, subtotal);
  return { ok: true, discount };
}

export function couponLabel(coupon: ParentCoupon): string {
  const value = Number(coupon.discount_value) || 0;
  return coupon.discount_type === "percentage"
    ? `${value}% OFF`
    : `$${value} OFF`;
}
