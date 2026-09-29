"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatTemplate } from "@/components/programs/format";
import { apiGet, apiPatch, apiPost } from "@/lib/classz-api-client";
import { resolveUploadUrl } from "@/lib/resolve-upload-url";
import { ProfileShell } from "./profile-shell";

/**
 * ADR-006 — "Profile about me page": stats (children / bookings / years),
 * personal info (name, email ✓verified, address, country+phone, language)
 * and the parent profile picture. Verification is on hold (D4): the email
 * badge renders unconditionally; the phone Verify button is a stub.
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

function StatsBlock({ summary }: { summary: Summary }) {
  const { t } = useLanguage();
  const stats = [
    { label: t("account.aboutMe.children"), value: summary.children_count },
    { label: t("account.aboutMe.bookings"), value: summary.bookings_count },
    { label: t("account.aboutMe.years"), value: summary.years_on_classz },
  ];
  return (
    <div className="grid grid-cols-3 gap-4 rounded-[12px] border border-[#EBEBEB] p-5">
      {stats.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-1">
          <span className="text-[12px] leading-[14px] text-[#717171]">
            {label}
          </span>
          <span className="text-[28px] font-[weight:590] leading-[34px]">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AboutMePage() {
  const { t, locale, setLocale } = useLanguage();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
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
        setAddress(data.address || "");
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
        { full_name: fullName, address, locale: nextLocale },
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
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-[28px] font-[weight:590] leading-[34px]">
              {formatTemplate(t, "account.aboutMe.hello", {
                name: summary.name || "",
              })}
            </h1>
            <p className="mt-1 text-[14px] leading-[17px] text-[#5E5E5E]">
              {summary.address || "Hong Kong"}
            </p>
          </div>

          <StatsBlock summary={summary} />

          <section className="rounded-[12px] border border-[#EBEBEB] p-5">
            <h2 className="text-[18px] font-[weight:590] leading-[22px]">
              {t("account.aboutMe.personalInfo")}
            </h2>

            <div className="mt-5 flex items-center gap-4">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt=""
                  className="h-[72px] w-[72px] rounded-full border border-[#EBEBEB] object-cover"
                />
              ) : (
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[#EBEBEB] bg-[#F5F5F5] text-[24px] font-[weight:590]">
                  {(summary.name || "P").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-[8px] border border-[#B0B0B0] px-3 py-2 text-[14px] transition-colors hover:border-ink disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {uploading
                    ? t("account.uploading")
                    : t("account.aboutMe.changePhoto")}
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

            <form
              className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] text-ink">
                  {t("account.aboutMe.fullName")}
                </span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 rounded-[8px] border border-[#EFF1F3] px-4 text-sm focus:border-classz-400 focus:outline-none"
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-[14px] text-ink">
                  {t("account.aboutMe.email")}
                </span>
                <div className="flex h-11 items-center gap-2 rounded-[8px] border border-[#EFF1F3] bg-[#F5F5F5] px-4 text-sm text-[#5E5E5E]">
                  {summary.email}
                  {summary.email_verified ? (
                    <span className="ml-auto flex items-center gap-1 text-[12px] font-[weight:590] text-[#0ABAB5]">
                      ✓ {t("account.aboutMe.verified")}
                    </span>
                  ) : null}
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] text-ink">
                  {t("account.aboutMe.address")}
                </span>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-11 rounded-[8px] border border-[#EFF1F3] px-4 text-sm focus:border-classz-400 focus:outline-none"
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-[14px] text-ink">
                  {t("account.aboutMe.phone")}
                </span>
                <div className="flex h-11 items-center gap-2 rounded-[8px] border border-[#EFF1F3] px-4 text-sm">
                  <span className="text-[#5E5E5E]">{summary.country_code}</span>
                  <span>{summary.mobile || "—"}</span>
                  {summary.phone_verified ? null : (
                    <span
                      className="ml-auto cursor-not-allowed text-[12px] text-[#717171] underline"
                      title={t("account.comingSoon")}
                    >
                      {t("account.aboutMe.verify")}
                    </span>
                  )}
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] text-ink">
                  {t("account.aboutMe.language")}
                </span>
                <select
                  value={summary.locale || "en"}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSummary((s) => (s ? { ...s, locale: next } : s));
                  }}
                  className="h-11 rounded-[8px] border border-[#EFF1F3] bg-white px-4 text-sm focus:border-classz-400 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="zh-TW">繁體中文</option>
                </select>
              </label>

              <div className="flex items-center gap-3 md:col-span-2">
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
          </section>
        </div>
      )}
    </ProfileShell>
  );
}
