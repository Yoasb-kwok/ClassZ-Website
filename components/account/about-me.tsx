"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, XCircle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatTemplate } from "@/components/programs/format";
import { apiGet, apiPatch, apiPost } from "@/lib/classz-api-client";
import { resolveUploadUrl } from "@/lib/resolve-upload-url";
import { ProfileShell } from "./profile-shell";

/**
 * ADR-006 — "Profile about me page" (figma 2909 Profile-about_me, capture-
 * matched 2026-09-30): ONE white card holding everything — top row is the
 * greeting + location line + the three Info stats (divider-separated) with
 * the 150×150 profile photo on the same row (its teal edit badge IS the
 * change-photo affordance), then a divider, then the Drop-Down form rows
 * (Full name with clear icon, Email + Verified, Country + Phone + Verify)
 * and the Language dropdown. No address (user decision 2026-09-30).
 * Verification stays on hold (D4): email badge static, Verify is a stub.
 */

type Summary = {
  id: number;
  name: string | null;
  email: string;
  mobile: string | null;
  country_code: string;
  address: string | null;
  locale: string;
  photo_url: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  children_count: number;
  bookings_count: number;
  years_on_classz: number;
};

const COUNTRY_PREFIXES = ["+852", "+86", "+65", "+81", "+44", "+1"];

function StatsBlock({ summary }: { summary: Summary }) {
  const { t } = useLanguage();
  const stats = [
    { label: t("account.aboutMe.children"), value: summary.children_count },
    { label: t("account.aboutMe.bookings"), value: summary.bookings_count },
    { label: t("account.aboutMe.years"), value: summary.years_on_classz },
  ];
  return (
    <div className="flex items-center">
      {stats.map(({ label, value }, i) => (
        <div key={label} className="flex items-center">
          {i > 0 ? (
            <span aria-hidden className="mx-6 h-11 w-px bg-[#EBEBEB]" />
          ) : null}
          <div className="flex flex-col gap-1">
            <span className="text-[21px] font-[weight:590] leading-[26px] text-[#222222]">
              {value}
            </span>
            <span className="text-[14px] leading-[17px] text-[#717171]">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FieldRow({
  label,
  children,
  trailing,
}: {
  label: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex h-[69px] items-center justify-between border-b border-[#EBEBEB] px-1">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[14px] leading-[17px] text-[#717171]">
          {label}
        </span>
        {children}
      </div>
      {trailing}
    </div>
  );
}

export function AboutMePage() {
  const { t, locale, setLocale } = useLanguage();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+852");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    apiGet<Summary>("/me/summary", "student")
      .then((data) => {
        if (!alive) return;
        setSummary(data);
        setFullName(data.name || "");
        setCountryCode(data.country_code || "+852");
      })
      .catch(
        (e) => alive && setError(e instanceof Error ? e.message : "Failed"),
      )
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const nextLocale = summary?.locale || "en";
    try {
      await apiPatch(
        "/me",
        {
          full_name: fullName,
          country_code: countryCode,
          locale: nextLocale,
        },
        "student",
      );
      setSaved(true);
      if (locale !== nextLocale) {
        setLocale(nextLocale as "en" | "zh-TW");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read that file"));
        reader.readAsDataURL(file);
      });
      const res = await apiPost<{ url?: string }>(
        "/me/parent-photo",
        { image: dataUrl },
        "student",
      );
      setSummary((s) => (s ? { ...s, photo_url: res?.url || s.photo_url } : s));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const photo = summary?.photo_url ? resolveUploadUrl(summary.photo_url) : "";

  return (
    <ProfileShell active="about">
      {loading ? (
        <p className="text-sm text-[#717171]">{t("account.loading")}</p>
      ) : !summary ? (
        <p className="text-sm text-brand-coral">
          {error || t("account.loadFailed")}
        </p>
      ) : (
        /* One big card holding ALL the content (capture: Card 945×632 white) */
        <div className="rounded-[12px] border border-[#EBEBEB] bg-white p-8">
          {/* Top row — greeting + stats LEFT, photo RIGHT (capture
              Frame 2147237524: 486.5 info col + 150 photo, 150 tall) */}
          <div className="flex items-start justify-between gap-8">
            <div className="flex min-w-0 flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h1 className="text-[26px] font-[weight:590] leading-[31px] text-black">
                  {formatTemplate(t, "account.aboutMe.hello", {
                    name: summary.name || "",
                  })}
                </h1>
                <p className="text-[14px] leading-[17px] text-[#5E5E5E]">
                  Hong Kong
                </p>
              </div>
              <StatsBlock summary={summary} />
            </div>

            {/* 150×150 photo — the teal edit badge IS the change-photo
                control (capture Frame 2147236961 + 2147223704) */}
            <div className="relative shrink-0">
              <div className="h-[150px] w-[150px] overflow-hidden rounded-full border border-[#EBEBEB]">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#F5F5F5] text-[40px] font-[weight:590] text-[#5E5E5E]">
                    {(summary.name || "P").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label={t("account.aboutMe.changePhoto")}
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-1 right-1 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#0ABAB5] text-white shadow-sm transition-colors hover:bg-[#08a19c] disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void uploadPhoto(file);
                }}
              />
            </div>
          </div>

          <div aria-hidden className="my-7 h-px w-full bg-[#EBEBEB]" />

          {/* Drop-down form rows (capture Frame 2147237515) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <div className="flex flex-col">
              <FieldRow
                label={t("account.aboutMe.fullName")}
                trailing={
                  fullName ? (
                    <button
                      type="button"
                      aria-label={t("account.aboutMe.clearName")}
                      onClick={() => setFullName("")}
                      className="text-[#B0B0B0] transition-colors hover:text-[#5E5E5E]"
                    >
                      <XCircle className="h-[18px] w-[18px]" />
                    </button>
                  ) : null
                }
              >
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent text-[19px] leading-[24px] text-[#222222] focus:outline-none"
                />
              </FieldRow>

              <FieldRow
                label={t("account.aboutMe.email")}
                trailing={
                  summary.email_verified ? (
                    <span className="text-[14px] text-[#717171]">
                      ✓ {t("account.aboutMe.verified")}
                    </span>
                  ) : null
                }
              >
                <span className="text-[19px] leading-[24px] text-[#222222]">
                  {summary.email}
                </span>
              </FieldRow>

              <div className="flex items-center justify-between border-b border-[#EBEBEB] px-1 py-3">
                {/* Country prefix — real dropdown, persists with Save */}
                <label className="flex flex-col gap-1">
                  <span className="text-[14px] leading-[17px] text-[#717171]">
                    {t("account.aboutMe.country")}
                  </span>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-[100px] rounded-[8px] border border-[#EFF1F3] bg-white px-2 py-1.5 text-[19px] leading-[24px] text-[#222222] focus:border-classz-400 focus:outline-none"
                  >
                    {COUNTRY_PREFIXES.map((prefix) => (
                      <option key={prefix} value={prefix}>
                        {prefix}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] leading-[17px] text-[#717171]">
                      {t("account.aboutMe.phone")}
                    </span>
                    <span className="text-[19px] leading-[24px] text-[#222222]">
                      {summary.mobile || "—"}
                    </span>
                  </div>
                  <span
                    className="cursor-not-allowed text-[14px] text-[#717171] underline"
                    title={t("account.comingSoon")}
                  >
                    {t("account.aboutMe.verify")}
                  </span>
                </div>
              </div>
            </div>

            {/* Language — its own labelled dropdown at the bottom of the card */}
            <div className="mt-7 flex flex-col gap-2">
              <span className="text-[14px] leading-[17px] text-[#717171]">
                {t("account.aboutMe.language")}
              </span>
              <select
                value={summary.locale || "en"}
                onChange={(e) => {
                  const next = e.target.value;
                  setSummary((s) => (s ? { ...s, locale: next } : s));
                }}
                className="h-[52px] w-full rounded-[8px] border border-[#EFF1F3] bg-white px-4 text-[19px] text-[#222222] focus:border-classz-400 focus:outline-none"
              >
                <option value="en">English</option>
                <option value="zh-TW">繁體中文</option>
              </select>
            </div>

            <div className="mt-7 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex h-11 items-center gap-2 rounded-[8px] bg-[#222222] px-5 text-[14px] font-[weight:590] text-white transition-colors hover:bg-black disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("account.save")}
              </button>
              {saved ? (
                <span className="text-[13px] text-[#0ABAB5]">
                  {t("account.saved")}
                </span>
              ) : null}
              {error ? (
                <span className="text-[13px] text-brand-coral">{error}</span>
              ) : null}
            </div>
          </form>
        </div>
      )}
    </ProfileShell>
  );
}
