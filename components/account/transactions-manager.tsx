"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatTemplate } from "@/components/programs/format";
import { apiDelete, apiGet, apiPost } from "@/lib/classz-api-client";
import { ProfileShell } from "./profile-shell";

/**
 * ADR-006 — "Profile-Transaction" per the Profile-add_payment_method
 * capture (the transaction page sits behind that modal): an "Add payment
 * method +" text link · saved-card mini cards (border r8, pad 12: card
 * mark + •••• last4 14/400, Expiry 12/400, Default 10/400 #5E5E5E) ·
 * search input (h30 r8 12px + 10px search icon) and status pill (r24 h22
 * 12px + chevron) · ONE white r12 shadowed history card (pad 16, rows
 * split by #EBEBEB hairlines) where each row is: date 12/400 #717171 →
 * child 14/510 #222 + status as plain text right (teal when successful) →
 * program 12/510 + amount 14/510 right → "n lessons · period" 12/400 →
 * note 10/400 #5E5E5E + "by coach" 10/400 right. Promocodes (user
 * addition, D7) stay as a collapsible section below.
 */

type PaymentMethod = {
  id: number;
  brand: string | null;
  last4: string | null;
  exp_month: number | null;
  exp_year: number | null;
  is_default: boolean;
};

type Transaction = {
  id: number;
  child_name: string | null;
  amount: number;
  status: "pending" | "successful" | "refunded" | "failed";
  program_name: string | null;
  centre_name: string | null;
  coach_name: string | null;
  lessons_count: number | null;
  period_start: string | null;
  period_end: string | null;
  note: string | null;
  paid_at: string | null;
};

type MyCoupon = {
  id: number;
  code: string;
  status: "available" | "used" | "expired";
  discount_type: string;
  discount_value: number | null;
  center_name: string | null;
  valid_until: string | null;
};

const STATUS_OPTIONS = [
  "all",
  "pending",
  "successful",
  "refunded",
  "failed",
] as const;

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtPeriod(start: string | null, end: string | null): string {
  if (!start && !end) return "";
  return `${start ? fmtDate(start) : "?"} – ${end ? fmtDate(end) : "?"}`;
}

const STATUS_TEXT_COLOR: Record<Transaction["status"], string> = {
  pending: "text-[#717171]",
  successful: "text-[#0ABAB5]",
  refunded: "text-[#5E5E5E]",
  failed: "text-[#D64545]",
};

function CardMark({ brand }: { brand: string | null }) {
  const b = (brand || "").toLowerCase();
  if (b.includes("master")) {
    return (
      <svg
        width="23"
        height="16"
        viewBox="0 0 23 16"
        aria-hidden
        className="shrink-0"
      >
        <rect width="23" height="16" rx="2.5" fill="#FFFFFF" stroke="#EBEBEB" />
        <circle cx="9.2" cy="8" r="4.95" fill="#ED0006" />
        <circle cx="13.8" cy="8" r="4.95" fill="#F9A000" fillOpacity="0.92" />
      </svg>
    );
  }
  return (
    <span className="flex h-4 w-[23px] shrink-0 items-center justify-center rounded-[2.5px] border border-[#EBEBEB] text-[8px] font-[weight:590] uppercase text-[#5E5E5E]">
      {(brand || "card").slice(0, 4)}
    </span>
  );
}

export function TransactionsPage() {
  const { t } = useLanguage();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [coupons, setCoupons] = useState<MyCoupon[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  function reload() {
    Promise.all([
      apiGet<PaymentMethod[]>("/payment-methods", "student").catch(() => []),
      apiGet<Transaction[]>("/transactions", "student").catch(() => []),
      apiGet<MyCoupon[]>("/coupons", "student").catch(() => []),
    ]).then(([m, tx, c]) => {
      setMethods(m || []);
      setTransactions(tx || []);
      setCoupons(c || []);
      setLoading(false);
    });
  }

  useEffect(reload, []);

  const q = search.trim().toLowerCase();
  const visibleTransactions = transactions.filter((row) => {
    if (status !== "all" && row.status !== status) return false;
    if (!q) return true;
    return [row.child_name, row.centre_name, row.program_name, row.coach_name]
      .filter((v): v is string => Boolean(v))
      .some((v) => v.toLowerCase().includes(q));
  });

  async function addPaymentMethod() {
    setAdding(true);
    try {
      const res = await apiPost<{ url: string }>(
        "/payment-methods/setup",
        {},
        "student",
      );
      if (res?.url) window.location.href = res.url;
    } finally {
      setAdding(false);
    }
  }

  async function removePaymentMethod(id: number) {
    try {
      await apiDelete(`/payment-methods/${id}`, "student");
      setMethods((list) => list.filter((m) => m.id !== id));
    } catch {
      reload();
    }
  }

  async function claim() {
    if (!claimCode.trim()) return;
    setClaimMsg(null);
    try {
      await apiPost("/coupons/claim", { code: claimCode.trim() }, "student");
      setClaimCode("");
      setClaimMsg(t("account.transactions.promoClaimed"));
      apiGet<MyCoupon[]>("/coupons", "student")
        .then(setCoupons)
        .catch(() => undefined);
    } catch (e) {
      setClaimMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <ProfileShell active="transactions">
      <h1 className="sr-only">{t("account.sidebar.transactions")}</h1>

      {/* Capture header: "Add payment method +" text link (14/510 #5E5E5E) */}
      <div className="px-3">
        <button
          type="button"
          disabled={adding}
          onClick={() => void addPaymentMethod()}
          className="flex items-center gap-1.5 text-[14px] font-[weight:510] leading-[21px] text-[#5E5E5E] transition-colors hover:text-[#222222] disabled:opacity-50"
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={1.5} />
          )}
          {t("account.transactions.addMethod")}
        </button>
      </div>

      {/* Promocodes — user addition (D7), placed at the top so it is
          immediately viewable even though it is not in the capture */}
      <section className="mx-3 mt-6 rounded-[12px] border border-[#EBEBEB]">
        <button
          type="button"
          aria-expanded={promoOpen}
          onClick={() => setPromoOpen((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4"
        >
          <span className="text-[16px] font-[weight:590]">
            {t("account.transactions.promocodes")}
          </span>
          <span className="text-[13px] text-[#5E5E5E]">
            {promoOpen ? "−" : "+"}{" "}
            {coupons.filter((c) => c.status === "available").length}
          </span>
        </button>
        {promoOpen ? (
          <div className="flex flex-col gap-3 border-t border-[#EBEBEB] px-5 py-4">
            <div className="flex gap-2">
              <input
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                placeholder={t("account.transactions.promoPlaceholder")}
                className="h-10 flex-1 rounded-[8px] border border-[#EFF1F3] px-4 text-sm focus:border-classz-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void claim()}
                className="h-10 rounded-[8px] bg-[#222222] px-4 text-[13px] font-[weight:590] text-white transition-colors hover:bg-black"
              >
                {t("account.transactions.promoClaim")}
              </button>
            </div>
            {claimMsg ? (
              <p className="text-[13px] text-[#5E5E5E]">{claimMsg}</p>
            ) : null}
            {coupons.length === 0 ? (
              <p className="text-[13px] text-[#717171]">
                {t("account.transactions.noPromos")}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {coupons.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-[8px] border border-[#EBEBEB] px-4 py-3"
                  >
                    <div>
                      <p className="text-[14px] font-[weight:590]">{c.code}</p>
                      <p className="text-[12px] text-[#717171]">
                        {c.center_name || "—"}
                        {c.valid_until
                          ? ` · ${t("account.transactions.validUntil")} ${fmtDate(c.valid_until)}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-[weight:590]">
                        {c.discount_type === "percentage"
                          ? `${c.discount_value}%`
                          : `HKD ${c.discount_value}`}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-[weight:590] ${
                          c.status === "available"
                            ? "bg-[#D7F4F3] text-[#0ABAB5]"
                            : c.status === "used"
                              ? "bg-[#F5F5F5] text-[#5E5E5E]"
                              : "bg-[#FFE5E5] text-[#D64545]"
                        }`}
                      >
                        {t(`account.transactions.promoStatus.${c.status}`)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </section>

      {/* Saved cards — bordered r8 mini cards (capture Frame 2147237525).
          No empty-state text: the capture only shows a card once saved */}
      <div className="mt-6 px-3">
        {methods.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {methods.map((m) => (
              <div
                key={m.id}
                className="w-[244px] rounded-[8px] border border-[#EBEBEB] p-3"
              >
                <div className="flex items-center gap-2">
                  <CardMark brand={m.brand} />
                  <p className="flex-1 truncate text-[14px] text-[#222222]">
                    •••• {m.last4}
                  </p>
                  <button
                    type="button"
                    aria-label={t("account.transactions.removeMethod")}
                    onClick={() => void removePaymentMethod(m.id)}
                    className="rounded p-1 text-[#717171] transition-colors hover:bg-[#F5F5F5] hover:text-brand-coral"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-2.5 text-[12px] text-[#222222]">
                  {t("account.transactions.expiry")}{" "}
                  {m.exp_month != null
                    ? `${String(m.exp_month).padStart(2, "0")}/${m.exp_year}`
                    : "—"}
                </p>
                {m.is_default ? (
                  <p className="mt-1 text-[10px] text-[#5E5E5E]">
                    {t("account.transactions.default")}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Search + status pill — 40px input, 14px text */}
      <div className="mt-8 flex items-center gap-2.5 px-3">
        <div className="flex h-10 w-full max-w-[420px] items-center gap-2 rounded-[8px] border border-[#EBEBEB] px-3.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-[#5E5E5E]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("account.transactions.searchPlaceholder")}
            aria-label={t("account.transactions.searchPlaceholder")}
            className="w-full bg-transparent text-[14px] text-[#222222] placeholder:text-[#717171] focus:outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])
            }
            className="h-[22px] appearance-none rounded-full border border-[#EBEBEB] bg-white py-0.5 pl-3 pr-6 text-[12px] text-[#5E5E5E] focus:outline-none"
            aria-label={t("account.transactions.statusFilter")}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "all"
                  ? t("account.transactions.status.all")
                  : t(`account.transactions.status.${option}`)}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
          >
            <path
              d="M2 3.5l3 3 3-3"
              stroke="#5E5E5E"
              strokeWidth="1.1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Transaction history — ONE white r12 shadowed card, rows split by
          hairlines (capture Frame 2147237124) */}
      <div className="mt-8 px-3">
        {loading ? (
          <p className="text-sm text-[#717171]">{t("account.loading")}</p>
        ) : visibleTransactions.length === 0 ? (
          <p className="text-sm text-[#717171]">
            {t("account.transactions.empty")}
          </p>
        ) : (
          <ul className="flex flex-col gap-3 rounded-[12px] bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            {visibleTransactions.map((row, i) => (
              <li key={row.id} className="flex flex-col">
                {i > 0 ? (
                  <div aria-hidden className="h-px w-full bg-[#EBEBEB]" />
                ) : null}
                {/* Row per user spec: name → which centre → which program →
                    date. Status + amount stay on the right edge. */}
                <div className="flex flex-col gap-2 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-[16px] font-[weight:590] leading-[19px] text-[#222222]">
                      {row.child_name || "—"}
                    </p>
                    <p
                      className={`shrink-0 text-[12px] ${STATUS_TEXT_COLOR[row.status]}`}
                    >
                      {t(`account.transactions.status.${row.status}`)}
                    </p>
                  </div>
                  <p className="truncate text-[13px] leading-[16px] text-[#5E5E5E]">
                    {row.centre_name || "—"}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-[14px] font-[weight:510] leading-[18px] text-[#222222]">
                      {row.program_name || "—"}
                    </p>
                    <p className="shrink-0 text-[16px] font-[weight:590] text-[#222222]">
                      ${row.amount.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-[12px] leading-[15px] text-[#717171]">
                    {fmtDate(row.paid_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProfileShell>
  );
}
