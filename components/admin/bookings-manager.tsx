"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { isDemoSession } from "@/components/admin/use-admin-api";
import { apiGet, apiPatch, apiPost } from "@/lib/classz-api-client";
import {
  AdminCard,
  AdminGhostButton,
  AdminInput,
  AdminModal,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminStatusChip,
  AdminTable,
  AdminTableShell,
  statusTone,
} from "@/components/classz-admin-ui";

type EnrollReq = {
  id: number;
  student_name?: string;
  class_name?: string;
  status: string;
  tokens_required?: number;
  lesson_count?: number;
  amount_hkd?: number | null;
  paid?: boolean;
  refunded?: boolean;
  created_at?: string;
};

type WaitlistRow = {
  id: number;
  class_id: number;
  student_name?: string;
  contact_email?: string;
  status: string;
};

export function BookingsManager({ embedded = false }: { embedded?: boolean }) {
  const { locale } = useLanguage();
  const zh = locale === "zh-TW";
  const demo = isDemoSession();
  const [tab, setTab] = useState<"requests" | "waitlist">("requests");
  const [requests, setRequests] = useState<EnrollReq[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [classes, setClasses] = useState<Array<{ id: number; name: string }>>(
    [],
  );
  const [wlForm, setWlForm] = useState({
    class_id: "",
    student_name: "",
    contact_email: "",
  });
  const [rowError, setRowError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<EnrollReq | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (demo) return;
    try {
      const [req, wl, cls] = await Promise.all([
        apiGet<EnrollReq[]>("/enrollment-requests").catch(() => []),
        apiGet<WaitlistRow[]>("/waitlist").catch(() => []),
        apiGet<Array<{ id: number; name: string }>>("/classes").catch(() => []),
      ]);
      setRequests(Array.isArray(req) ? req : []);
      setWaitlist(Array.isArray(wl) ? wl : []);
      setClasses(Array.isArray(cls) ? cls : []);
    } catch {
      /* ignore */
    }
  }, [demo]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * ADR-005 D8 — approve is one-click atomic (enrollments created or a
   * loud error; CLASS_FULL means "reject for a refund, or wait").
   * Reject requires a reason and auto-refunds paid reservations.
   */
  async function approveRequest(r: EnrollReq) {
    if (r.amount_hkd != null && Number(r.amount_hkd) > 0) {
      const ok = window.confirm(
        zh
          ? `核准後即建立報名（HK$${Number(r.amount_hkd).toFixed(0)} 已收款）。任何一堂滿額都會被阻擋。確定？`
          : `Approving creates the enrollments now (HK$${Number(r.amount_hkd).toFixed(0)} captured). Blocked if any session is full. Continue?`,
      );
      if (!ok) return;
    }
    setBusy(true);
    setRowError(null);
    try {
      await apiPatch(`/enrollment-requests/${r.id}`, { status: "fulfilled" });
      await load();
    } catch (e) {
      setRowError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function rejectRequest() {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) return;
    setBusy(true);
    setRowError(null);
    try {
      await apiPatch(`/enrollment-requests/${rejectTarget.id}`, {
        status: "rejected",
        rejection_reason: reason,
      });
      setRejectTarget(null);
      setRejectReason("");
      await load();
    } catch (e) {
      setRowError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function addWaitlist() {
    if (!wlForm.class_id) return;
    try {
      await apiPost("/waitlist", {
        class_id: Number(wlForm.class_id),
        student_name: wlForm.student_name,
        contact_email: wlForm.contact_email,
      });
      setWlForm({ class_id: "", student_name: "", contact_email: "" });
      await load();
    } catch (e) {
      setRowError(
        e instanceof Error ? e.message : "Failed — run db:migrate:centre-crm?",
      );
    }
  }

  const body = (
    <>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["requests", zh ? "報名請求" : "Requests"],
            ["waitlist", zh ? "候補" : "Waitlist"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${
              tab === k
                ? "bg-classz-100 border-classz-400"
                : "bg-white border-classz-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {rowError ? (
        <div
          role="alert"
          data-testid="bookings-row-error"
          className="rounded-lg border border-brand-coral/40 bg-brand-coral/10 px-3 py-2 text-sm text-brand-coral"
        >
          {rowError}
        </div>
      ) : null}

      {tab === "requests" ? (
        <AdminCard>
          <AdminTableShell>
            <AdminTable>
              <thead className="bg-classz-100">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">
                    {zh ? "學員" : "Student"}
                  </th>
                  <th className="px-3 py-2 text-left">
                    {zh ? "課堂" : "Class"}
                  </th>
                  <th className="px-3 py-2 text-left">
                    {zh ? "堂数" : "Sessions"}
                  </th>
                  <th className="px-3 py-2 text-left">
                    {zh ? "金額" : "Amount"}
                  </th>
                  <th className="px-3 py-2 text-left">
                    {zh ? "狀態" : "Status"}
                  </th>
                  <th className="px-3 py-2 text-right">
                    {zh ? "操作" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2">{r.student_name}</td>
                    <td className="px-3 py-2">{r.class_name}</td>
                    <td className="px-3 py-2">
                      {r.amount_hkd != null ? (r.lesson_count ?? 1) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {r.amount_hkd != null
                        ? `HK$${Number(r.amount_hkd).toFixed(0)}${r.refunded ? (zh ? "（已退款）" : " (refunded)") : ""}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <AdminStatusChip tone={statusTone(r.status)}>
                        {r.status}
                      </AdminStatusChip>
                    </td>
                    <td className="px-3 py-2 text-right space-x-1">
                      {r.status === "pending" ? (
                        <>
                          <AdminGhostButton
                            type="button"
                            disabled={busy}
                            className="text-sm py-1 px-2"
                            onClick={() => approveRequest(r)}
                          >
                            {zh ? "核准" : "Approve"}
                          </AdminGhostButton>
                          <AdminGhostButton
                            type="button"
                            disabled={busy}
                            className="text-sm py-1 px-2 text-brand-coral"
                            onClick={() => {
                              setRejectTarget(r);
                              setRejectReason("");
                            }}
                          >
                            {zh ? "拒絕" : "Reject"}
                          </AdminGhostButton>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {!requests.length ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-classz-500"
                    >
                      {demo
                        ? zh
                          ? "請用中心帳號登入"
                          : "Sign in"
                        : zh
                          ? "無請求"
                          : "No requests"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </AdminTable>
          </AdminTableShell>
        </AdminCard>
      ) : null}

      {tab === "waitlist" ? (
        <AdminCard>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
            <AdminSelect
              value={wlForm.class_id}
              onChange={(e) =>
                setWlForm({ ...wlForm, class_id: e.target.value })
              }
            >
              <option value="">{zh ? "課堂" : "Class"}</option>
              {classes.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </AdminSelect>
            <AdminInput
              placeholder={zh ? "姓名" : "Name"}
              value={wlForm.student_name}
              onChange={(e) =>
                setWlForm({ ...wlForm, student_name: e.target.value })
              }
            />
            <AdminInput
              placeholder="Email"
              value={wlForm.contact_email}
              onChange={(e) =>
                setWlForm({ ...wlForm, contact_email: e.target.value })
              }
            />
            <AdminPrimaryButton type="button" onClick={addWaitlist}>
              {zh ? "加入候補" : "Add"}
            </AdminPrimaryButton>
          </div>
          <ul className="divide-y divide-classz-100 text-sm">
            {waitlist.map((w) => (
              <li key={w.id} className="py-2 flex justify-between">
                <span>
                  #{w.id} · {w.student_name || w.contact_email} · class{" "}
                  {w.class_id}
                </span>
                <span className="text-classz-500">
                  <AdminStatusChip tone={statusTone(w.status)}>
                    {w.status}
                  </AdminStatusChip>
                </span>
              </li>
            ))}
            {!waitlist.length ? (
              <li className="py-6 text-center text-classz-500">
                {zh ? "候補名單為空" : "Waitlist empty"}
              </li>
            ) : null}
          </ul>
        </AdminCard>
      ) : null}

      {/* ADR-005 — reject requires a reason; paid requests auto-refund. */}
      <AdminModal
        open={rejectTarget != null}
        title={zh ? "拒絕報名請求" : "Reject booking request"}
        onClose={() => setRejectTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <AdminGhostButton
              type="button"
              onClick={() => setRejectTarget(null)}
            >
              {zh ? "取消" : "Cancel"}
            </AdminGhostButton>
            <AdminPrimaryButton
              type="button"
              disabled={busy || !rejectReason.trim()}
              onClick={rejectRequest}
            >
              {zh ? "拒絕並退款" : "Reject"}
            </AdminPrimaryButton>
          </div>
        }
      >
        <div className="space-y-3">
          {rejectTarget &&
          rejectTarget.amount_hkd != null &&
          Number(rejectTarget.amount_hkd) > 0 ? (
            <p className="text-sm text-brand-coral">
              {zh
                ? `此為已付款預約（HK$${Number(rejectTarget.amount_hkd).toFixed(0)}）——拒絕後將自動全數退款。`
                : `This is a paid reservation (HK$${Number(rejectTarget.amount_hkd).toFixed(0)}) — rejecting triggers an automatic full refund.`}
            </p>
          ) : null}
          <AdminInput
            placeholder={
              zh ? "拒絕原因（必填）" : "Rejection reason (required)"
            }
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </AdminModal>
    </>
  );

  if (embedded) return body;

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "預約" : "Bookings"}
        description={
          zh
            ? "付費預約（家長付款 → 中心審批）、報名請求、候補名單"
            : "Paid reservations (parent pays → centre approves), enrollment requests and waitlist"
        }
        Icon={CalendarClock}
      />
      {body}
    </AdminPageFrame>
  );
}
