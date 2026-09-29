"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatTemplate } from "@/components/programs/format";
import { apiDelete, apiGet, apiPost } from "@/lib/classz-api-client";
import { ProfileShell } from "./profile-shell";

/**
 * ADR-006 — "Profile-Transaction": the transactions ledger (search by
 * name / status filter), saved Stripe payment methods (setup-mode Checkout
 * redirect), and the promocode toggle section (user addition — D7).
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

function StatusChip({ status }: { status: Transaction["status"] }) {
  const { t } = useLanguage();
  const map: Record<Transaction["status"], string> = {
    pending: "bg-[#FFF4E0] text-[#B7791F]",
    successful: "bg-[#D7F4F3] text-[#0ABAB5]",
    refunded: "bg-[#F5F5F5] text-[#5E5E5E]",
    failed: "bg-[#FFE5E5] text-[#D64545]",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-[weight:590] ${map[status]}`}
    >
      {t(`account.transactions.status.${status}`)}
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
    return [row.child_name, row.program_name, row.coach_name]
      .filter(Boolean)
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
      <h1 className="text-[28px] font-[weight:590] leading-[34px]">
        {t("account.sidebar.transactions")}
      </h1>

      {/* Saved payment methods (Decision 6) */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-[weight:590]">
            {t("account.transactions.savedMethod")}
          </h2>
          <button
            type="button"
            disabled={adding}
            onClick={() => void addPaymentMethod()}
            className="flex h-9 items-center gap-2 rounded-[8px] border border-[#B0B0B0] px-3 text-[13px] transition-colors hover:border-ink disabled:opacity-50"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {t("account.transactions.addMethod")}
          </button>
        </div>
        {methods.length === 0 ? (
          <p className="mt-3 text-[13px] text-[#717171]">
            {t("account.transactions.noMethods")}
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-3">
            {methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-[8px] border border-[#EBEBEB] px-4 py-3"
              >
                <div className="flex h-8 w-12 items-center justify-center rounded bg-[#F5F5F5] text-[11px] font-[weight:590] uppercase">
                  {m.brand || "card"}
                </div>
                <div>
                  <p className="text-[14px] font-[weight:590]">
                    {m.brand
                      ? m.brand[0].toUpperCase() + m.brand.slice(1)
                      : "Card"}{" "}
                    •••• {m.last4}
                  </p>
                  <p className="text-[12px] text-[#717171]">
                    {m.exp_month != null
                      ? `${String(m.exp_month).padStart(2, "0")}/${m.exp_year}`
                      : ""}
                    {m.is_default
                      ? ` · ${t("account.transactions.default")}`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={t("account.transactions.removeMethod")}
                  onClick={() => void removePaymentMethod(m.id)}
                  className="ml-2 rounded p-1.5 text-[#717171] transition-colors hover:bg-[#F5F5F5] hover:text-brand-coral"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promocodes — toggle section (user addition) */}
      <section className="mt-6 rounded-[12px] border border-[#EBEBEB]">
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

      {/* Ledger */}
      <section className="mt-8">
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("account.transactions.searchPlaceholder")}
            aria-label={t("account.transactions.searchPlaceholder")}
            className="h-10 flex-1 rounded-[8px] border border-[#B0B0B0] px-4 text-sm focus:border-classz-400 focus:outline-none"
          />
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])
            }
            className="h-10 rounded-[8px] border border-[#B0B0B0] bg-white px-3 text-sm"
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
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-[#717171]">{t("account.loading")}</p>
        ) : visibleTransactions.length === 0 ? (
          <p className="mt-6 text-sm text-[#717171]">
            {t("account.transactions.empty")}
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {visibleTransactions.map((row) => (
              <li
                key={row.id}
                className="rounded-[12px] border border-[#EBEBEB] p-4"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="text-[13px] text-[#717171]">
                    {fmtDate(row.paid_at)}
                  </span>
                  <span className="text-[15px] font-[weight:590]">
                    {row.child_name || "—"}
                  </span>
                  <StatusChip status={row.status} />
                  <span className="ml-auto text-[16px] font-[weight:590]">
                    ${row.amount.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#5E5E5E]">
                  {row.program_name ? (
                    <span className="font-[weight:510] text-ink">
                      {row.program_name}
                    </span>
                  ) : null}
                  {row.note ? <span>· {row.note}</span> : null}
                  {row.lessons_count != null ? (
                    <span>
                      ·{" "}
                      {formatTemplate(t, "account.transactions.lessons", {
                        n: row.lessons_count,
                      })}
                    </span>
                  ) : null}
                  {row.period_start || row.period_end ? (
                    <span>· {fmtPeriod(row.period_start, row.period_end)}</span>
                  ) : null}
                  {row.coach_name ? (
                    <span>
                      ·{" "}
                      {formatTemplate(t, "account.transactions.by", {
                        name: row.coach_name,
                      })}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </ProfileShell>
  );
}
