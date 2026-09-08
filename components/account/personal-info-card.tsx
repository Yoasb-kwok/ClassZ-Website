"use client"

import { useMemo, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import { ALL_DISTRICTS } from "@/lib/locations"
import {
  updateStudentAccount,
  updateStudentProfile,
  uploadStudentPhoto,
  type StudentProfileDetail,
} from "@/lib/student-passport"
import { useStudentPassport } from "@/components/account/student-shell"

function Field({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="pi-field">
      <span className="pi-field-label">{label}</span>
      <span className={`pi-field-value${muted ? " pi-field-value--muted" : ""}`}>{value || "—"}</span>
    </div>
  )
}

export function PersonalInfoCard() {
  const { data, loading, reload } = useStudentPassport()
  const [editing, setEditing] = useState(false)
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const t = (en: string, tw: string) => (zh ? tw : en)

  const profile = (data?.profile ?? null) as StudentProfileDetail | null
  const account = data?.account

  const sexLabel = useMemo(() => {
    if (profile?.sex === 1) return t("Male", "男")
    if (profile?.sex === 0) return t("Female", "女")
    return ""
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.sex, zh])

  if (loading) return <p className="text-sm text-classz-500">{t("Loading personal information…", "載入個人資訊…")}</p>
  if (!profile || !account) return null

  return (
    <>
      <section className="pi-card">
        <div className="pi-card-head">
          <h2 className="pi-card-title">{t("Personal Information", "個人資訊")}</h2>
          <button type="button" className="pi-edit-btn" onClick={() => setEditing(true)}>
            {t("Edit", "編輯")}
          </button>
        </div>

        {/* Parent account */}
        <div className="pi-block">
          <div className="pi-block-avatar">{(account.name || account.full_name || "P").slice(0, 1).toUpperCase()}</div>
          <div className="pi-block-body">
            <p className="pi-block-title">{t("Parent account", "家長帳戶")}</p>
            <div className="pi-grid">
              <Field label={t("Name", "姓名")} value={account.full_name || account.name || "—"} />
              <Field label={t("Email", "電郵")} value={account.email || "—"} />
              <Field
                label={t("Mobile", "電話")}
                value={account.country_code ? `+${account.country_code} ${account.mobile}` : account.mobile || "—"}
              />
            </div>
          </div>
        </div>

        {/* Child / learner */}
        <div className="pi-block">
          <div className="pi-block-avatar">
            {profile.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolveUploadUrl(profile.photo_url)} alt="" className="pi-avatar-img" />
            ) : (
              (profile.name || "?").slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="pi-block-body">
            <p className="pi-block-title">{t("Learner", "學員")}</p>
            <div className="pi-grid">
              <Field label={t("Full name", "全名")} value={profile.name || "—"} />
              <Field label={t("Nickname", "暱稱")} value={profile.nick_name || "—"} />
              <Field label={t("Sex", "性別")} value={sexLabel} />
              <Field label={t("Age", "年齡")} value={profile.age != null ? String(profile.age) : "—"} />
              <Field label={t("Date of birth", "出生日期")} value={profile.date_of_birth || "—"} />
              <Field label={t("School", "學校")} value={profile.school || "—"} />
              <Field label={t("District", "地區")} value={profile.residential_district || "—"} />
              <Field label={t("Parent name", "家長姓名")} value={profile.parents_name || "—"} />
              <Field label={t("Contact number", "聯絡電話")} value={profile.contact_number || "—"} />
              <Field label={t("Medical notes", "醫療備註")} value={profile.medical_notes || "—"} />
              <Field label={t("Student ID", "學員編號")} value={profile.student_id || "—"} muted />
              <Field label={t("Level", "程度")} value={profile.level || "—"} muted />
              <Field label={t("HKID (first)", "身份證（前）")} value={profile.id_first_four_masked || "—"} muted />
              <Field label={t("HKID (last)", "身份證（後）")} value={profile.id_last_four_masked || "—"} muted />
            </div>
            <p className="pi-hint">{t("Grey fields are managed by your centre.", "灰色欄位由中心管理。")}</p>
          </div>
        </div>
      </section>

      {editing ? (
        <PersonalInfoModal profile={profile} account={account} onClose={() => setEditing(false)} onSaved={reload} />
      ) : null}
    </>
  )
}

function PersonalInfoModal({
  profile,
  account,
  onClose,
  onSaved,
}: {
  profile: StudentProfileDetail
  account: { name: string; full_name: string; email: string; mobile: string; country_code: string }
  onClose: () => void
  onSaved: () => void
}) {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const t = (en: string, tw: string) => (zh ? tw : en)

  const [name, setName] = useState(account.full_name || account.name || "")
  const [mobile, setMobile] = useState(account.mobile || "")
  const [countryCode, setCountryCode] = useState(account.country_code || "852")
  const [child, setChild] = useState({
    full_name: profile.name || "",
    nick_name: profile.nick_name || "",
    date_of_birth: profile.date_of_birth || "",
    sex: profile.sex ?? -1,
    school: profile.school || "",
    residential_district: profile.residential_district || "",
    parents_name: profile.parents_name || "",
    contact_number: profile.contact_number || "",
    medical_notes: profile.medical_notes || "",
  })
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [sending, setSending] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  function setChildField<K extends keyof typeof child>(k: K, v: (typeof child)[K]) {
    setChild((c) => ({ ...c, [k]: v }))
  }

  async function handlePhoto(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = String(reader.result || "")
      try {
        await uploadStudentPhoto(profile.id, dataUrl)
        setOk(t("Photo uploaded.", "相片已上載。"))
      } catch (e) {
        setError(e instanceof Error ? e.message : t("Photo upload failed", "相片上載失敗"))
      }
    }
    reader.readAsDataURL(file)
  }

  async function postJson(path: string, body: unknown) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const json = (await res.json().catch(() => ({}))) as { success?: boolean; msg?: string; message?: string }
    if (!res.ok || json.success === false) {
      throw new Error(json.msg || json.message || `HTTP ${res.status}`)
    }
    return json
  }

  async function sendOtp() {
    if (!email.trim()) return setError(t("Enter the new email first.", "請先輸入新電郵。"))
    setSending(true)
    setError(null)
    setOk(null)
    try {
      await postJson("/api/user/send-verify-email", { newEmail: email.trim() })
      setOtpSent(true)
      setOk(t("Verification code sent to the new email.", "驗證碼已寄往新電郵。"))
    } catch (e) {
      setError(e instanceof Error ? e.message : t("Failed to send code", "寄送驗證碼失敗"))
    } finally {
      setSending(false)
    }
  }

  async function confirmEmail() {
    if (!otp.trim()) return setError(t("Enter the verification code.", "請輸入驗證碼。"))
    setBusy(true)
    setError(null)
    setOk(null)
    try {
      await postJson("/api/user/confirm-email", { newEmail: email.trim(), otp: otp.trim() })
      setOk(t("Email updated.", "電郵已更新。"))
      setEmail("")
      setOtp("")
      setOtpSent(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : t("Email change failed", "電郵更新失敗"))
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    setBusy(true)
    setError(null)
    setOk(null)
    try {
      await updateStudentAccount({
        name: name.trim() || undefined,
        full_name: name.trim() || undefined,
        mobile: mobile.trim() || undefined,
        country_code: countryCode.trim() || undefined,
      })
      await updateStudentProfile(profile.id, {
        full_name: child.full_name,
        nick_name: child.nick_name,
        date_of_birth: child.date_of_birth,
        sex: child.sex >= 0 ? child.sex : undefined,
        school: child.school,
        residential_district: child.residential_district,
        parents_name: child.parents_name,
        contact_number: child.contact_number,
        medical_notes: child.medical_notes,
      })
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : t("Save failed", "儲存失敗"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pi-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="pi-modal" role="dialog" aria-modal onMouseDown={(e) => e.stopPropagation()}>
        <div className="pi-modal-head">
          <h2>{t("Personal Information", "個人資訊")}</h2>
          <button type="button" className="pi-modal-close" onClick={onClose} aria-label={t("Close", "關閉")}>
            ×
          </button>
        </div>

        <div className="pi-modal-section">
          <h3>{t("Parent account", "家長帳戶")}</h3>
          <label className="pi-input-label">
            {t("Name", "姓名")}
            <input className="pi-input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="pi-input-label">
            {t("Mobile", "電話")}
            <div className="pi-inline">
              <input
                className="pi-input"
                style={{ maxWidth: 90 }}
                value={countryCode}
                placeholder="852"
                onChange={(e) => setCountryCode(e.target.value)}
              />
              <input
                className="pi-input"
                value={mobile}
                placeholder="90000103"
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </label>
          <label className="pi-input-label">
            {t("Email (OTP required to change)", "電郵（更改需驗證碼）")}
            <div className="pi-inline">
              <input
                className="pi-input"
                type="email"
                value={email}
                placeholder={account.email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="button" className="pi-secondary-btn" onClick={sendOtp} disabled={sending || !email.trim()}>
                {sending ? t("Sending…", "寄送中…") : t("Send code", "寄驗證碼")}
              </button>
            </div>
          </label>
          {otpSent ? (
            <label className="pi-input-label">
              {t("Verification code", "驗證碼")}
              <div className="pi-inline">
                <input className="pi-input" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <button type="button" className="pi-secondary-btn" onClick={confirmEmail} disabled={busy || !otp.trim()}>
                  {t("Confirm", "確認")}
                </button>
              </div>
            </label>
          ) : null}
        </div>

        <div className="pi-modal-section">
          <h3>{t("Learner", "學員")}</h3>
          <label className="pi-input-label">
            {t("Photo", "相片")}
            <input type="file" accept="image/*" onChange={(e) => handlePhoto(e.target.files?.[0])} className="pi-input pi-input--file" />
          </label>
          <label className="pi-input-label">
            {t("Full name", "全名")}
            <input className="pi-input" value={child.full_name} onChange={(e) => setChildField("full_name", e.target.value)} />
          </label>
          <label className="pi-input-label">
            {t("Nickname", "暱稱")}
            <input className="pi-input" value={child.nick_name} onChange={(e) => setChildField("nick_name", e.target.value)} />
          </label>
          <label className="pi-input-label">
            {t("Date of birth", "出生日期")}
            <input
              className="pi-input"
              type="date"
              value={child.date_of_birth}
              onChange={(e) => setChildField("date_of_birth", e.target.value)}
            />
          </label>
          <label className="pi-input-label">
            {t("Sex", "性別")}
            <select className="pi-input" value={child.sex} onChange={(e) => setChildField("sex", Number(e.target.value))}>
              <option value={-1}>—</option>
              <option value={1}>{t("Male", "男")}</option>
              <option value={0}>{t("Female", "女")}</option>
            </select>
          </label>
          <label className="pi-input-label">
            {t("School", "學校")}
            <input className="pi-input" value={child.school} onChange={(e) => setChildField("school", e.target.value)} />
          </label>
          <label className="pi-input-label">
            {t("District", "地區")}
            <input
              className="pi-input"
              list="pi-districts"
              value={child.residential_district}
              onChange={(e) => setChildField("residential_district", e.target.value)}
            />
            <datalist id="pi-districts">
              {ALL_DISTRICTS.map((d) => (
                <option key={d.slug} value={zh ? d.zh : d.en} />
              ))}
            </datalist>
          </label>
          <label className="pi-input-label">
            {t("Parent name", "家長姓名")}
            <input className="pi-input" value={child.parents_name} onChange={(e) => setChildField("parents_name", e.target.value)} />
          </label>
          <label className="pi-input-label">
            {t("Contact number", "聯絡電話")}
            <input className="pi-input" value={child.contact_number} onChange={(e) => setChildField("contact_number", e.target.value)} />
          </label>
          <label className="pi-input-label">
            {t("Medical notes", "醫療備註")}
            <textarea
              className="pi-input pi-input--area"
              value={child.medical_notes}
              onChange={(e) => setChildField("medical_notes", e.target.value)}
            />
          </label>
        </div>

        {error ? <p className="pi-error">{error}</p> : null}
        {ok ? <p className="pi-ok">{ok}</p> : null}

        <div className="pi-modal-actions">
          <button type="button" className="pi-secondary-btn" onClick={onClose}>
            {t("Cancel", "取消")}
          </button>
          <button type="button" className="pi-primary-btn" onClick={save} disabled={busy}>
            {busy ? t("Saving…", "儲存中…") : t("Save", "儲存")}
          </button>
        </div>
      </div>
    </div>
  )
}
