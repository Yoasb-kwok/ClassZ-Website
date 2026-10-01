"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, XCircle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatTemplate } from "@/components/programs/format";
import { apiGet, apiPatch, apiPost } from "@/lib/classz-api-client";
import { resolveUploadUrl } from "@/lib/resolve-upload-url";
import { ProfileShell } from "./profile-shell";

/**
 * ADR-006 — "Profile about me page" (figma 2909 Profile-about_me, capture
 * #Card / 2147237030): one white card (radius 24, shadow 0 6px 16px 12%,
 * pad 48/64, gap 32) holding everything. Spec-exact values from the capture:
 * Hello 22/590 #000 · Hong Kong 14/400 #5E5E5E · stats value 18/590 + label
 * 16/590 both #222 in 151.5-wide Info blocks with 44-tall #EBEBEB separators ·
 * photo 150×150 with the 30×30 #0ABAB5 edit badge at bottom-right (pad 8.18,
 * icon 16.36) · divider #EBEBEB · form rows 69 tall (inner pad 16/12; only
 * Full name carries the 1px #222 border), labels 12/400 #717171, values
 * 16/400 #222 · Verified/Verify 14/590 #222 · Language inline: "Language"
 * 16/400 #222 + 113×35 box, 1px #B0B0B0 r4, pad 8/16, arrow 16 #5E5E5E.
 * No address. Verification on hold (D4): email badge static, Verify stub.
 * Card shadow 0 6px 16px rgba(0,0,0,.12) per capture; the shell wraps
 * content in a <div> because globals.css overflow-clips <section>s, which
 * erased the left/right half of the shade.
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

function Info({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex w-[168px] flex-col">
      <span className="text-[20px] font-[weight:590] leading-[24px] text-[#222222]">
        {value}
      </span>
      <span className="text-[17px] font-[weight:590] leading-[21px] text-[#222222]">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return <span aria-hidden className="mx-2 h-[44px] w-px bg-[#EBEBEB]" />;
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
        /* The Card — white, r24, figma-exact shade on all four sides
            (0 6px 16px rgba(0,0,0,.12), capture Card shadows), pad 48/64,
            gap 32. Rendered inside a div: globals.css overflow-clips every
            <section>, which cut the left/right shade off */
        <div className="flex w-full max-w-[1000px] flex-col gap-8 rounded-[24px] bg-white p-[48px_64px] shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
          {/* Top row — info col (486.5) + 150×150 photo inside a 745.5-wide
              frame (capture Frame 2147237524): the photo does NOT align with
              the 817-wide form below — its right edge stops at 745.5 */}
          <div className="flex w-full max-w-[745.5px] items-start justify-between gap-8">
            <div className="flex min-w-0 flex-col gap-8">
              <div className="flex flex-col gap-2.5 py-2">
                <p className="text-[22px] font-[weight:590] leading-[26px] text-black">
                  {formatTemplate(t, "account.aboutMe.hello", {
                    name: summary.name || "",
                  })}
                </p>
                <p className="text-[14px] leading-[17px] text-[#5E5E5E]">
                  Hong Kong
                </p>
              </div>
              <div className="flex items-center bg-white py-2">
                <Info
                  value={summary.children_count}
                  label={t("account.aboutMe.children")}
                />
                <Separator />
                <Info
                  value={summary.bookings_count}
                  label={t("account.aboutMe.bookings")}
                />
                <Separator />
                <Info
                  value={summary.years_on_classz}
                  label={t("account.aboutMe.years")}
                />
              </div>
            </div>

            {/* 150×150 photo + 30×30 #0ABAB5 edit badge at bottom-right */}
            <div className="relative shrink-0">
              <div className="h-[150px] w-[150px] overflow-hidden rounded-full">
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
                className="absolute bottom-0 right-0 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#0ABAB5] text-white transition-colors hover:bg-[#08a19c] disabled:opacity-60"
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

          {/* Line 31 */}
          <div aria-hidden className="h-px w-full bg-[#EBEBEB]" />

          {/* Form — Drop-Down rows 69 tall, inner pad 16/12; only Full name
              carries the 1px #222 border (capture: visible stroke on row 1) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <div className="flex flex-col gap-4">
              {/* Full name — bordered row */}
              <div className="rounded-[8px] border border-[#222222] px-3 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-[12px] leading-[14px] text-[#717171]">
                      {t("account.aboutMe.fullName")}
                    </span>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent text-[16px] leading-[19px] text-[#222222] focus:outline-none"
                    />
                  </div>
                  {fullName ? (
                    <button
                      type="button"
                      aria-label={t("account.aboutMe.clearName")}
                      onClick={() => setFullName("")}
                      className="shrink-0 text-[#1B1A1F] transition-colors hover:text-[#5E5E5E]"
                    >
                      <XCircle className="h-[18px] w-[18px]" />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Email + Verified (borderless row) */}
              <div className="flex h-[69px] items-center justify-between px-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[12px] leading-[14px] text-[#717171]">
                    {t("account.aboutMe.email")}
                  </span>
                  <span className="text-[16px] leading-[19px] text-[#222222]">
                    {summary.email}
                  </span>
                </div>
                {summary.email_verified ? (
                  <span className="text-[14px] font-[weight:590] text-[#222222]">
                    {t("account.aboutMe.verified")}
                  </span>
                ) : null}
              </div>

              {/* Country (labeled, borderless dropdown w/ arrow) + Phone
                  (labeled) + Verify — capture Frame 2147236979 */}
              <div className="flex h-[69px] items-center gap-2 px-3">
                <label className="relative flex w-[100px] shrink-0 cursor-pointer flex-col gap-1">
                  <span className="text-[12px] leading-[14px] text-[#717171]">
                    {t("account.aboutMe.country")}
                  </span>
                  <span className="flex items-center justify-between">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full appearance-none bg-transparent pr-3 text-[16px] leading-[19px] text-[#222222] focus:outline-none"
                    >
                      {COUNTRY_PREFIXES.map((prefix) => (
                        <option key={prefix} value={prefix}>
                          {prefix}
                        </option>
                      ))}
                    </select>
                    <svg
                      aria-hidden
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      className="pointer-events-none absolute right-0 bottom-1"
                    >
                      <path
                        d="M2.67 6l5.33 5.33L13.33 6"
                        stroke="#222222"
                        strokeWidth="1.33"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </label>

                <div className="flex min-w-0 flex-1 items-center justify-between pl-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] leading-[14px] text-[#717171]">
                      {t("account.aboutMe.phone")}
                    </span>
                    <span className="text-[16px] leading-[19px] text-[#222222]">
                      {summary.mobile || "—"}
                    </span>
                  </div>
                  <span
                    className="cursor-not-allowed text-[14px] font-[weight:590] text-[#222222]"
                    title={t("account.comingSoon")}
                  >
                    {t("account.aboutMe.verify")}
                  </span>
                </div>
              </div>
            </div>

            {/* Language — aligned with the rows (pl-3): 16px label, 20px
                gap, 113×35 box (1px #B0B0B0 r4, pad 8/16, 16px text,
                arrow 16 #5E5E5E) — capture Frame 2147237009 */}
            <div className="mt-8 flex items-center gap-5 pl-3">
              <span className="text-[16px] leading-[19px] text-[#222222]">
                {t("account.aboutMe.language")}
              </span>
              <div className="relative">
                <select
                  value={summary.locale || "en"}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSummary((s) => (s ? { ...s, locale: next } : s));
                  }}
                  className="h-[35px] w-[113px] appearance-none rounded-[4px] border border-[#B0B0B0] bg-white pl-4 pr-10 text-[16px] leading-[19px] text-[#222222] focus:border-classz-400 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="zh-TW">繁體中文</option>
                </select>
                <svg
                  aria-hidden
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <path
                    d="M2.72 6l5.28 5.28L13.28 6"
                    stroke="#5E5E5E"
                    strokeWidth="1.33"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Save — at the very bottom, standing for the whole page */}
            <div className="mt-8 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex h-10 items-center gap-2 rounded-[8px] bg-[#222222] px-5 text-[14px] font-[weight:590] text-white transition-colors hover:bg-black disabled:opacity-50"
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
