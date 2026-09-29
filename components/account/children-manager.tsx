"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatTemplate } from "@/components/programs/format";
import { apiGet, apiPatch, apiPost } from "@/lib/classz-api-client";
import { resolveUploadUrl } from "@/lib/resolve-upload-url";
import { ProfileShell } from "./profile-shell";

/**
 * ADR-006 D3 — "Profile-child profile": the parent manages their children as
 * cards (photo, year badge, Years on ClassZ, Zschool connected/not, age, sex,
 * SEN). Add/edit modal matches the capture: Full name · ID card number ·
 * Birthday · Country + Emergency contact + Phone · Zschool (placeholder) ·
 * Required SEN assistance toggle. The full HKID is sent once and only the
 * four+four fragments are ever stored (split-on-input).
 */

type Child = {
  id: number;
  full_name: string | null;
  photo_url: string | null;
  date_of_birth: string | null;
  sex: number | null;
  age: number | null;
  years_on_classz: number;
  year_badge: string;
  sen_assistance: boolean;
  zschool_connected: boolean;
  id_first_four: string | null;
  id_last_four: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_country_code: string;
};

type ChildForm = {
  full_name: string;
  hkid_number: string;
  date_of_birth: string;
  sex: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_country_code: string;
  sen_assistance: boolean;
};

const EMPTY_FORM: ChildForm = {
  full_name: "",
  hkid_number: "",
  date_of_birth: "",
  sex: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_country_code: "+852",
  sen_assistance: false,
};

function ChildCard({ child, onEdit }: { child: Child; onEdit: () => void }) {
  const { t } = useLanguage();
  const photo = child.photo_url ? resolveUploadUrl(child.photo_url) : "";
  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex w-full items-center gap-4 rounded-[12px] border border-[#EBEBEB] bg-white p-4 text-left transition-shadow hover:shadow-[0_6px_16px_2px_rgba(0,0,0,0.08)]"
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          className="h-[72px] w-[72px] shrink-0 rounded-full border border-[#EBEBEB] object-cover"
        />
      ) : (
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border border-[#EBEBEB] bg-[#F5F5F5] text-[24px] font-[weight:590]">
          {(child.full_name || "?").slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[16px] font-[weight:590] leading-[19px]">
            {child.full_name}
          </p>
          <span className="rounded-full bg-[#D7F4F3] px-2 py-0.5 text-[11px] font-[weight:590] text-[#0ABAB5]">
            {child.year_badge}
          </span>
          {child.sen_assistance ? (
            <span className="rounded-full bg-[#222222] px-2 py-0.5 text-[11px] font-[weight:590] text-white">
              SEN
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[13px] leading-[16px] text-[#5E5E5E]">
          {formatTemplate(t, "account.children.yearsOnClassz", {
            n: child.years_on_classz,
          })}
          {child.age != null
            ? ` · ${formatTemplate(t, "account.children.age", { n: child.age })}`
            : ""}
          {child.sex === 1
            ? ` · ${t("account.children.male")}`
            : child.sex === 0
              ? ` · ${t("account.children.female")}`
              : ""}
        </p>
        <p className="mt-1 text-[12px] leading-[15px] text-[#717171]">
          {t("account.children.zschool")}:{" "}
          <span
            className={
              child.zschool_connected ? "text-[#0ABAB5]" : "text-[#717171]"
            }
          >
            {child.zschool_connected
              ? t("account.children.connected")
              : t("account.children.notConnected")}
          </span>
        </p>
      </div>
    </button>
  );
}

function ChildModal({
  editing,
  onClose,
  onSaved,
}: {
  editing: Child | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<ChildForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        full_name: editing.full_name || "",
        hkid_number: "",
        date_of_birth: editing.date_of_birth
          ? String(editing.date_of_birth).slice(0, 10)
          : "",
        sex: editing.sex != null ? String(editing.sex) : "",
        emergency_contact_name: editing.emergency_contact_name || "",
        emergency_contact_phone: editing.emergency_contact_phone || "",
        emergency_contact_country_code:
          editing.emergency_contact_country_code || "+852",
        sen_assistance: editing.sen_assistance,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [editing]);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        full_name: form.full_name.trim(),
        date_of_birth: form.date_of_birth || null,
        sex: form.sex === "" ? null : Number(form.sex),
        emergency_contact_name: form.emergency_contact_name.trim() || null,
        emergency_contact_phone: form.emergency_contact_phone.trim() || null,
        emergency_contact_country_code:
          form.emergency_contact_country_code || "+852",
        sen_assistance: form.sen_assistance,
      };
      if (form.hkid_number.trim()) body.hkid_number = form.hkid_number.trim();
      if (editing) {
        await apiPatch(`/children/${editing.id}`, body, "student");
      } else {
        await apiPost("/children", body, "student");
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-11 w-full rounded-[8px] border border-[#EFF1F3] px-4 text-sm focus:border-classz-400 focus:outline-none";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("account.children.addTitle")}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-[520px] overflow-auto rounded-[12px] bg-white p-6">
        <h3 className="text-[20px] font-[weight:590] leading-[24px]">
          {editing
            ? t("account.children.editTitle")
            : t("account.children.addTitle")}
        </h3>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] text-ink">
              {t("account.children.fullName")}
            </span>
            <input
              value={form.full_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, full_name: e.target.value }))
              }
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] text-ink">
              {t("account.children.idNumber")}
            </span>
            <input
              value={form.hkid_number}
              onChange={(e) =>
                setForm((f) => ({ ...f, hkid_number: e.target.value }))
              }
              placeholder={
                editing && editing.id_first_four
                  ? `${editing.id_first_four}****${editing.id_last_four}`
                  : "A1234567"
              }
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] text-ink">
                {t("account.children.birthday")}
              </span>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date_of_birth: e.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] text-ink">
                {t("account.children.sex")}
              </span>
              <select
                value={form.sex}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sex: e.target.value }))
                }
                className={`${inputClass} bg-white`}
              >
                <option value="">—</option>
                <option value="1">{t("account.children.male")}</option>
                <option value="0">{t("account.children.female")}</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] text-ink">
              {t("account.children.emergencyContact")}
            </span>
            <div className="grid grid-cols-[88px_1fr] gap-2">
              <select
                value={form.emergency_contact_country_code}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    emergency_contact_country_code: e.target.value,
                  }))
                }
                className={`${inputClass} bg-white`}
              >
                <option value="+852">+852</option>
                <option value="+86">+86</option>
                <option value="+65">+65</option>
              </select>
              <input
                value={form.emergency_contact_name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    emergency_contact_name: e.target.value,
                  }))
                }
                placeholder={t("account.children.contactName")}
                className={inputClass}
              />
            </div>
            <input
              value={form.emergency_contact_phone}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  emergency_contact_phone: e.target.value,
                }))
              }
              placeholder={t("account.children.contactPhone")}
              className={inputClass}
            />
          </div>

          {/* Zschool — placeholder only (ADR-006 Open Item): no connect flow. */}
          <div className="flex items-center justify-between rounded-[8px] border border-[#EFF1F3] px-4 py-3">
            <span className="text-[14px] text-ink">
              {t("account.children.zschool")}
            </span>
            <span className="text-[13px] text-[#717171]">
              {editing?.zschool_connected
                ? t("account.children.connected")
                : t("account.children.notConnected")}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-[8px] border border-[#EFF1F3] px-4 py-3">
            <span className="text-[14px] text-ink">
              {t("account.children.senRequired")}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={form.sen_assistance}
              onClick={() =>
                setForm((f) => ({ ...f, sen_assistance: !f.sen_assistance }))
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.sen_assistance ? "bg-[#0ABAB5]" : "bg-[#B0B0B0]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                  form.sen_assistance ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {error ? (
            <p className="text-[13px] text-brand-coral">{error}</p>
          ) : null}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-[8px] border border-[#B0B0B0] px-5 text-[14px] transition-colors hover:border-ink"
            >
              {t("account.cancel")}
            </button>
            <button
              type="button"
              disabled={saving || !form.full_name.trim()}
              onClick={() => void submit()}
              className="flex h-11 items-center gap-2 rounded-[8px] bg-[#222222] px-5 text-[14px] font-[weight:590] text-white transition-colors hover:bg-black disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editing ? t("account.save") : t("account.children.add")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChildrenPage() {
  const { t } = useLanguage();
  const [children, setChildren] = useState<Child[] | null>(null);
  const [modal, setModal] = useState<{ open: boolean; editing: Child | null }>({
    open: false,
    editing: null,
  });

  function reload() {
    apiGet<Child[]>("/children", "student")
      .then(setChildren)
      .catch(() => setChildren([]));
  }

  useEffect(reload, []);

  return (
    <ProfileShell active="children">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-[weight:590] leading-[34px]">
          {t("account.sidebar.childProfile")}
        </h1>
        <button
          type="button"
          onClick={() => setModal({ open: true, editing: null })}
          className="flex h-10 items-center gap-2 rounded-[8px] bg-[#222222] px-4 text-[14px] font-[weight:590] text-white transition-colors hover:bg-black"
        >
          <Plus className="h-4 w-4" />
          {t("account.children.addTitle")}
        </button>
      </div>

      {children === null ? (
        <p className="mt-8 text-sm text-[#717171]">{t("account.loading")}</p>
      ) : children.length === 0 ? (
        <p className="mt-8 text-sm text-[#717171]">
          {t("account.children.empty")}
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onEdit={() => setModal({ open: true, editing: child })}
            />
          ))}
        </div>
      )}

      {modal.open ? (
        <ChildModal
          editing={modal.editing}
          onClose={() => setModal({ open: false, editing: null })}
          onSaved={reload}
        />
      ) : null}
    </ProfileShell>
  );
}
