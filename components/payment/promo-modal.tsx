"use client";

import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import {
  claimPromoCode,
  couponLabel,
  fetchMyCoupons,
  type ParentCoupon,
} from "@/lib/reservations";

/**
 * "Promote Code" modal — capture 2511:25555 (Payment-promote_code, node
 * 2511:25555): 600w r24 pad32 white; close 35×35 r100 #EBEBEB; title
 * 32/590 #222 h48; input row 536×51 r8 #B0B0B0 stroke pad 16/12 with
 * "Promote code" 16/400 #717171 placeholder + "Redeem" 14/590 #222;
 * coupon cards 536 pad16 r12: "$60 OFF" 16/590 + "Until Mar 04, 2026"
 * 14/400 #5E5E5E, "Min. spend $300" / "Selected centres only" 14/400
 * #5E5E5E, "Terms of Use" 14/590 #5E5E5E expander + "Use" 14/590 white
 * on #222; terms body 12/400 #222 (capture boilerplate copy, node
 * 2511:25813 — 5 bullets, gap 5).
 */
const TERMS_COPY = [
  "The voucher can be applied to enrollment of $220 or more.",
  "ClassZ reserves the right to adjust, suspend, or cancel any vouchers, discounts, and promotion at its discretion without priror onset.",
  "Certain vouchers will be distributed at random, and the discount amount will be based on the amount shown on the voucher. ClassZ reserves the right to adjust, suspend, or cancel any vouchers, discounts, or promotions at its sole discretion without prior notice.",
  "This voucher can only be used at the designated centres specified in the promotions.",
  "Not applicable to orders with fixed price items.",
];

export function PromoModal({
  open,
  onClose,
  onUse,
}: {
  open: boolean;
  onClose: () => void;
  onUse: (coupon: ParentCoupon) => void;
}) {
  const { locale } = useLanguage();
  const zh = locale === "zh-TW";
  const [code, setCode] = useState("");
  const [available, setAvailable] = useState<ParentCoupon[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  // Filter to redeemable coupons at fetch time (Date.now stays out of render).
  const loadCoupons = useCallback(async () => {
    try {
      const rows = await fetchMyCoupons();
      const now = Date.now();
      const list = (Array.isArray(rows) ? rows : []).filter(
        (c) =>
          c.status === "available" &&
          (!c.valid_until || new Date(c.valid_until).getTime() > now),
      );
      setAvailable(list);
    } catch {
      setAvailable([]);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset error state when the dialog opens
    setError("");
    loadCoupons();
  }, [open, loadCoupons]);

  if (!open) return null;

  async function redeem() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setRedeeming(true);
    setError("");
    try {
      await claimPromoCode(trimmed);
      setCode("");
      await loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Redeem failed");
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#222222]/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={zh ? "推廣代碼" : "Promote Code"}
    >
      <div className="mt-[142px] w-[600px] max-w-full rounded-[24px] bg-white p-[32px]">
        {/* node 2916:19768 — close 35×35 r100 #EBEBEB, icon 16 #7A7A7A */}
        <div className="flex justify-end">
          <button
            type="button"
            aria-label={zh ? "關閉" : "Close"}
            onClick={onClose}
            className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#EBEBEB] text-[#7A7A7A] transition-colors hover:bg-[#E0E0E0]"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path
                d="M1 1l8 8M9 1L1 9"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {/* node 2511:25565 — title 32/590 #222 */}
        <h2 className="text-center text-[32px] font-[weight:590] leading-[48px] text-[#222222]">
          {zh ? "推廣代碼" : "Promote Code"}
        </h2>

        {/* node 2511:25567 — input row 51 r8 #B0B0B0, pad 16/12 */}
        <div className="mt-[20px] flex h-[51px] items-center justify-between rounded-[8px] border border-[#B0B0B0] px-[16px] py-[12px]">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") redeem();
            }}
            placeholder={zh ? "推廣代碼" : "Promote code"}
            className="min-w-0 flex-1 bg-transparent text-[16px] font-normal text-[#222222] outline-none placeholder:text-[#717171]"
          />
          <button
            type="button"
            onClick={redeem}
            disabled={redeeming}
            className="shrink-0 text-[14px] font-[weight:590] text-[#222222] underline underline-offset-2 disabled:opacity-50"
          >
            {zh ? "兌換" : "Redeem"}
          </button>
        </div>
        {error ? (
          <p className="mt-[8px] text-[12px] text-[#E16E65]">{error}</p>
        ) : null}

        {/* Coupon cards — node 2511:25574 / 2511:25595 */}
        {available.map((coupon) => {
          const isOpen = expanded === coupon.id;
          const centreSpecific = coupon.center_id != null;
          return (
            <div
              key={coupon.id}
              className="mt-[20px] rounded-[12px] bg-white p-[16px] shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-[weight:590] text-[#222222]">
                  {couponLabel(coupon)}
                </p>
                <p className="text-[14px] font-normal text-[#5E5E5E]">
                  {coupon.valid_until
                    ? `${zh ? "有效期至" : "Until"} ${new Date(coupon.valid_until).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`
                    : ""}
                </p>
              </div>
              <div className="mt-[8px] flex flex-col gap-[8px]">
                {Number(coupon.min_order_amount) > 0 ? (
                  <p className="text-[14px] font-normal text-[#5E5E5E]">
                    {zh
                      ? `最低消費 $${coupon.min_order_amount}`
                      : `Min. spend $${coupon.min_order_amount}`}
                  </p>
                ) : null}
                {centreSpecific ? (
                  <p className="text-[14px] font-normal text-[#5E5E5E]">
                    {zh ? "僅適用於指定中心" : "Selected centres only"}
                  </p>
                ) : null}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : coupon.id)}
                    aria-expanded={isOpen}
                    className="flex items-center gap-[4px] text-[14px] font-[weight:590] text-[#5E5E5E]"
                  >
                    {zh ? "使用條款" : "Terms of Use"}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      aria-hidden
                      className={`transition-transform ${isOpen ? "" : "rotate-180"}`}
                    >
                      <path
                        d="M2 4l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUse(coupon)}
                    className="flex h-[27px] items-center justify-center rounded-[6px] bg-[#222222] px-[16px] text-[14px] font-[weight:590] text-white transition-opacity hover:opacity-90"
                  >
                    {zh ? "使用" : "Use"}
                  </button>
                </div>
                {isOpen ? (
                  <ul className="mt-[5px] list-disc pl-[16px]">
                    {TERMS_COPY.map((line, i) => (
                      <li
                        key={i}
                        className="text-[12px] font-normal leading-[16px] text-[#222222]"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          );
        })}
        {!available.length ? (
          <p className="mt-[20px] text-center text-[14px] text-[#5E5E5E]">
            {zh ? "暫無可用的推廣代碼" : "No promotion codes available yet."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
