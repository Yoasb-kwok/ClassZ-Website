"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { BookOpen, Camera, ChevronDown, Footprints, Home, Sparkles, Trophy } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getClasszSession } from "@/lib/classz-auth"
import { resolveCompanionAnimal } from "@/lib/learning-companion-animals"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import {
  fetchStudentPassport,
  formatLessonDate,
  formatLessonTimeRange,
  formatPassportDate,
  lessonOrdinal,
  type PassportLesson,
  type PassportRecord,
  type StudentPassport,
} from "@/lib/student-passport"
import { progressLevelLabel } from "@/lib/activity-learning-record"

type PassportCtx = {
  data: StudentPassport | null
  loading: boolean
  error: string | null
  setProfileId: (id: number) => void
  reload: () => void
}

const Ctx = createContext<PassportCtx>({
  data: null,
  loading: true,
  error: null,
  setProfileId: () => {},
  reload: () => {},
})

export function useStudentPassport() {
  return useContext(Ctx)
}

const LESSON_FOCUS_REMINDER =
  "What was the main lesson focus today? (short answer with 10 words)"

const NAV = [
  { href: "/account/home", label: "Home", Icon: Home },
  { href: "/account", label: "Learning companion", Icon: Sparkles, match: ["/account/analytical-insight", "/account/supporting-learning"] },
  { href: "/account/academic", label: "Academic dashboard", Icon: BookOpen },
  { href: "/account/activity", label: "Activity dashboard", Icon: Trophy },
  { href: "/account/work-samples", label: "Work Samples", Icon: Camera },
  { href: "/account/moments", label: "Moments", Icon: Footprints },
]

function IconMale() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10" cy="14" r="5" stroke="#0ABAB5" strokeWidth="2" />
      <path d="M14 10l6-6M17 4h3v3" stroke="#0ABAB5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconFolderRecord({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M14.6673 7.33301V11.333C14.6673 13.9997 14.0007 14.6663 11.334 14.6663H4.66732C2.00065 14.6663 1.33398 13.9997 1.33398 11.333V4.66634C1.33398 1.99967 2.00065 1.33301 4.66732 1.33301H5.66732C6.66732 1.33301 6.88732 1.62634 7.26732 2.13301L8.26732 3.46634C8.52065 3.79967 8.66732 3.99967 9.33398 3.99967H11.334C14.0007 3.99967 14.6673 4.66634 14.6673 7.33301Z" stroke="#222222" strokeWidth="1.16" />
    </svg>
  )
}

function IconPin({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M8 8.7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="#222" strokeWidth="1.16" />
      <path d="M8 14.7s5-3.7 5-7.3a5 5 0 1 0-10 0c0 3.6 5 7.3 5 7.3Z" stroke="#222" strokeWidth="1.16" />
    </svg>
  )
}

function childPhoto(profile?: { name?: string; photo_url?: string | null } | null) {
  if (profile?.photo_url) return resolveUploadUrl(profile.photo_url)
  return ""
}

const WAITING_FOR_RECORDS = "This section will fill in as the centre adds learning records."
const WAITING_FOR_AI =
  "This section will fill in once the AI learning summary has been generated."

function isActive(pathname: string, href: string, extra: string[] = []) {
  if (href === "/account") {
    return pathname === "/account" || extra.some((p) => pathname.startsWith(p))
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function StudentAccountGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [data, setData] = useState<StudentPassport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<number | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const s = getClasszSession()
    if (!s) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/account")}`)
      return
    }
    if (s.user.role !== "student") {
      router.replace("/admin")
      return
    }
    setReady(true)
  }, [pathname, router])

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    setLoading(true)
    fetchStudentPassport(profileId)
      .then((next) => {
        if (cancelled) return
        setData(next)
        if (!profileId && next.profile?.id) setProfileId(next.profile.id)
        setError(null)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Load failed")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [ready, profileId, nonce])

  if (!ready) {
    return (
      <div className="min-h-screen bg-white text-sm text-classz-500 flex items-center justify-center">
        Loading…
      </div>
    )
  }

  return (
    <Ctx.Provider value={{ data, loading, error, setProfileId, reload: () => setNonce((n) => n + 1) }}>
      <div className="zpassport-app">
        <Navbar />
        <div className="app-body">
          <StudentSidebar />
          <div className="sidebar-divider" aria-hidden="true" />
          <main className="main-content">{children}</main>
        </div>
        <Footer />
      </div>
    </Ctx.Provider>
  )
}

function StudentSidebar() {
  const pathname = usePathname()
  const { data } = useStudentPassport()
  const profile = data?.profile
  const initial = (profile?.name || "?").slice(0, 1).toUpperCase()
  const photo = childPhoto(profile)

  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <div className="profile-avatar" role="img" aria-label={profile?.name || "Student"}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" />
          ) : (
            initial
          )}
        </div>
        <div className="profile-info">
          {data && data.profiles.length > 1 ? (
            <ProfileSelect />
          ) : (
            <p className="profile-name">
              {profile?.name || "Student"}
              <ChevronDown className="chevron" size={16} />
            </p>
          )}
          <div className="profile-meta">
            {profile?.sex === 1 ? <IconMale /> : null}
            <span className="profile-age">{profile?.age != null ? `Age ${profile.age}` : "—"}</span>
            <span className="badge">{profile?.level || "Beginner"}</span>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(({ href, label, Icon, match }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${href !== "/" && isActive(pathname, href, match) ? "active" : ""}`}
          >
            <span className="sidebar-link-bg">
              <span className="sidebar-link-content">
                <span className="sidebar-icon">
                  <Icon size={18} />
                </span>
                <span className="sidebar-link-label">{label}</span>
              </span>
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

function ProfileSelect() {
  const { data, setProfileId } = useStudentPassport()
  if (!data || data.profiles.length <= 1) return null
  return (
    <select
      className="profile-name"
      value={data.profile?.id || ""}
      onChange={(e) => setProfileId(Number(e.target.value))}
      style={{ border: "none", background: "transparent", fontWeight: 590, fontSize: 18, textAlign: "center" }}
    >
      {data.profiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  )
}

export function CompanionHome() {
  const { data, loading, error } = useStudentPassport()
  const name = firstName(data?.profile?.name) || "your child"
  const companion = data?.companion
  const animal = resolveCompanionAnimal(companion?.primary_companion)
  const narrative = companion?.narrative_json || {}
  const section = (narrative.learning_companion_section || {}) as Record<string, unknown>
  const supporting = companion?.supporting_companions || []

  if (loading) return <p className="text-sm text-classz-500">Loading learning companion…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <>
      <section className="learning-card">
        <div className="learning-intro">
          <p className="learning-intro-label">Based on recent ClassZ learning records:</p>
          <p className="learning-intro-title">{name}&apos;s learning companion is...</p>
        </div>
        <div className="primary-companion">
          <div className="primary-illustration">
            {animal ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={animal.poseSrcs[0] || animal.heroSrc} alt={animal.label} className="companion-image primary" />
            ) : (
              <div className="companion-image primary" style={{ background: "#E7F8F7" }} />
            )}
          </div>
          <div className="primary-content">
            <h1 className="companion-name">{animal?.shortName || "Learning companion"}</h1>
            <p className="companion-subtitle">{animal ? animal.label.replace(animal.shortName, "").trim() : ""}</p>
            <p className="companion-description">
              {String(section.meaning_paragraph_1 || animal?.meaning1 || "Your child’s Learning Companion will appear here after the centre confirms enough learning records.")}
            </p>
            <Link href="/account/analytical-insight" className="btn-primary">
              More Analytical Insight <span className="arrow">→</span>
            </Link>
            <p className="companion-footnote">
              Learning Companions summarise patterns in observed learning approaches. They are not fixed personality types.
            </p>
          </div>
        </div>
        {supporting.length ? (
          <>
            <hr className="section-divider" />
            <div className="secondary-section">
              <h2 className="secondary-heading">Also reflected in their learning...</h2>
              <div className="secondary-list">
                {supporting.map((label) => {
                  const extra = resolveCompanionAnimal(label)
                  return (
                    <div key={label} className="secondary-item">
                      <div className="secondary-illustration">
                        {extra ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={companionPoses(extra).reflected} alt={extra.label} className="companion-image secondary" />
                        ) : null}
                      </div>
                      <div className="secondary-text">
                        <h3 className="secondary-name">{extra?.shortName || label}</h3>
                        <p className="secondary-subtitle">{extra ? extra.label.replace(extra.shortName, "").trim() : label}</p>
                        <p className="secondary-description">{(extra && REFLECTED_BLURBS[extra.key]) || extra?.meaning1 || ""}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : null}
      </section>
      <div className="parent-reminder-wrap">
        <hr className="content-divider" />
        <div className="reminder-card">
          <h2 className="reminder-title">Parent reminder</h2>
          <p className="reminder-subtitle">Learning insights evolve with every new record added</p>
          <p className="reminder-body">
            How a child approaches learning can vary depending on the task, how familiar it feels and the
            environment. These insights reflect patterns ClassZ has observed rather than a fixed description of who
            the child is.
          </p>
        </div>
      </div>
    </>
  )
}

function firstName(full?: string | null) {
  return String(full || "").trim().split(/\s+/)[0] || "your child"
}

const POSE_SLOTS: Record<string, { hero: number; approach: number; respond: number; supportHero: number; supportWalk: number; reflected: number }> = {
  Rabbit: { hero: 4, approach: 1, respond: 2, supportHero: 3, supportWalk: 5, reflected: 1 },
  Owl: { hero: 2, approach: 1, respond: 3, supportHero: 4, supportWalk: 5, reflected: 3 },
  Turtle: { hero: 3, approach: 1, respond: 2, supportHero: 4, supportWalk: 5, reflected: 1 },
}

const DEFAULT_POSE_SLOTS = { hero: 0, approach: 1, respond: 2, supportHero: 3, supportWalk: 5, reflected: 1 }

const REFLECTED_BLURBS: Record<string, string> = {
  Turtle: "Represents a steady, careful approach that may benefit from time or encouragement when starting.",
  Owl: "Represents a careful, reflective approach to feedback, questions and checking work.",
}

function companionPoses(animal: ReturnType<typeof resolveCompanionAnimal>) {
  const poses = animal?.poseSrcs || []
  const slots = (animal && POSE_SLOTS[animal.key]) || DEFAULT_POSE_SLOTS
  const pick = (index: number) => poses[index] || poses[0] || ""
  return {
    hero: pick(slots.hero),
    approach: pick(slots.approach),
    respond: pick(slots.respond),
    supportHero: pick(slots.supportHero),
    supportWalk: pick(slots.supportWalk),
    reflected: pick(slots.reflected),
  }
}

function InsightArt({
  src,
  alt,
  className,
  imgClassName = "insight-section-image",
}: {
  src?: string
  alt: string
  className?: string
  imgClassName?: string
}) {
  if (!src) return null
  return (
    <div className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={imgClassName} />
    </div>
  )
}

function narrativeText(companion: StudentPassport["companion"] | undefined, keys: string[]) {
  const narrative = companion?.narrative_json || {}
  const sections = (narrative.sections || narrative.ai_sections || {}) as Record<string, unknown>
  for (const key of keys) {
    const value = sections[key]
    if (typeof value === "string" && value.trim()) return value
    if (value && typeof value === "object" && "text" in (value as object)) {
      const text = String((value as { text?: string }).text || "")
      if (text.trim()) return text
    }
  }
  const companionSection = (narrative.learning_companion_section || {}) as Record<string, unknown>
  for (const key of keys) {
    const value = companionSection[key]
    if (typeof value === "string" && value.trim()) return value
  }
  return ""
}

export function AnalyticalInsightPage() {
  const { data } = useStudentPassport()
  const companion = data?.companion
  const animal = resolveCompanionAnimal(companion?.primary_companion)
  const poses = companionPoses(animal)
  const glance =
    narrativeText(companion, ["current_learning_portrait", "your_child_at_a_glance"]) || WAITING_FOR_RECORDS
  const approach =
    narrativeText(companion, ["how_they_approach_something_new", "how_they_approach_learning"]) || WAITING_FOR_RECORDS
  const respond =
    narrativeText(companion, ["how_they_respond_to_challenge", "how_they_respond_along_the_way"]) || WAITING_FOR_RECORDS

  return (
    <div className="insight-page">
      <nav className="insight-breadcrumb" aria-label="Breadcrumb">
        <Link href="/account" className="insight-breadcrumb-parent">
          Learning Companion
        </Link>
        <span className="insight-breadcrumb-separator"> &gt; </span>
        <span className="insight-breadcrumb-current">Understanding Your Child&apos;s Learning</span>
      </nav>

      <div className="insight-hero">
        <InsightArt
          src={poses.hero}
          alt={animal?.label || "Learning companion"}
          className="insight-hero-illustration"
          imgClassName="insight-hero-image"
        />
        <h1 className="insight-title">Understanding Your Child&apos;s Learning</h1>
      </div>

      <hr className="insight-divider" />
      <article className="insight-section insight-section--text-only">
        <div className="insight-section-content">
          <h2 className="insight-section-title">Your Child at a Glance</h2>
          <p className="insight-section-description">{glance}</p>
        </div>
      </article>

      <hr className="insight-divider" />
      <article className="insight-section insight-section--image-right">
        <div className="insight-section-content">
          <h2 className="insight-section-title">How They Approach Learning</h2>
          <p className="insight-section-description">{approach}</p>
        </div>
        <InsightArt src={poses.approach} alt="" className="insight-section-illustration insight-illustration--approach" />
      </article>

      <hr className="insight-divider" />
      <article className="insight-section">
        <InsightArt src={poses.respond} alt="" className="insight-section-illustration insight-illustration--respond" />
        <div className="insight-section-content">
          <h2 className="insight-section-title">How They Respond Along the Way</h2>
          <p className="insight-section-description">{respond}</p>
        </div>
      </article>

      <nav className="insight-nav insight-nav--spaced">
        <Link href="/account" className="insight-nav-link">
          ← Back
        </Link>
        <Link href="/account/supporting-learning" className="insight-nav-link">
          Supporting Their Learning →
        </Link>
      </nav>
    </div>
  )
}

export function SupportingLearningPage() {
  const { data } = useStudentPassport()
  const companion = data?.companion
  const animal = resolveCompanionAnimal(companion?.primary_companion)
  const poses = companionPoses(animal)
  const help = companion ? (animal?.whatMayHelp || []).slice(0, 3) : []
  const supportCopy =
    narrativeText(companion, ["personalised_strategies", "what_may_help", "conditions_that_bring_out_their_best"]) ||
    WAITING_FOR_RECORDS
  const whyFits =
    narrativeText(companion, ["why_we_think_this", "evidence_and_confidence"]) || WAITING_FOR_RECORDS
  const supporting = (companion?.supporting_companions || [])
    .map((label) => resolveCompanionAnimal(label))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 2)
  const reflectedIntro =
    narrativeText(companion, ["also_reflected", "supporting_companions"]) || WAITING_FOR_RECORDS

  return (
    <div className="insight-page">
      <nav className="insight-breadcrumb" aria-label="Breadcrumb">
        <Link href="/account" className="insight-breadcrumb-parent">
          Learning Companion
        </Link>
        <span className="insight-breadcrumb-separator"> &gt; </span>
        <Link href="/account/analytical-insight" className="insight-breadcrumb-parent">
          Understanding Your Child&apos;s Learning
        </Link>
        <span className="insight-breadcrumb-separator"> &gt; </span>
        <span className="insight-breadcrumb-current">Supporting Their Learning</span>
      </nav>

      <div className="insight-hero">
        <InsightArt
          src={poses.supportHero}
          alt={animal?.label || "Learning companion"}
          className="insight-hero-illustration"
          imgClassName="insight-hero-image"
        />
        <h1 className="insight-title insight-title--supporting">Supporting Their Learning</h1>
      </div>

      <hr className="insight-divider" />
      <article className="insight-section insight-section--image-right">
        <div className="insight-section-content">
          <h2 className="insight-section-title">How You Can Support Them</h2>
          <p className="insight-section-description">{supportCopy}</p>
          <p className="insight-section-description insight-section-label">You could try:</p>
          <ul className="insight-section-list">
            {(help.length ? help : [
              "Demonstrate the first step when introducing a new activity.",
              `Give ${p.him} some quiet thinking time before stepping in.`,
              "Start with familiar parts first to build momentum before moving to newer steps.",
            ]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <InsightArt src={poses.supportWalk} alt="" className="insight-section-illustration insight-illustration--approach" />
      </article>

      <hr className="insight-divider" />
      <article className="insight-section insight-section--text-only">
        <div className="insight-section-content">
          <h2 className="insight-section-title">Why This Companion Fits</h2>
          <p className="insight-section-description">{whyFits}</p>
        </div>
      </article>

      <hr className="insight-divider" />
      <section className="insight-reflected">
        <h2 className="insight-section-title">Also Reflected in Their Learning</h2>
        <p className="insight-section-description">{reflectedIntro}</p>
        <div className="insight-reflected-list">
          {supporting.map((extra) => (
            <article key={extra.key} className="insight-reflected-item">
              <div className="insight-reflected-illustration">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={companionPoses(extra).reflected} alt={extra.label} className="insight-reflected-image" />
              </div>
              <div className="insight-section-content">
                <h3 className="insight-reflected-name">{extra.shortName}</h3>
                <p className="insight-reflected-subtitle">{extra.label.replace(extra.shortName, "").trim()}</p>
                <p className="insight-section-description">{REFLECTED_BLURBS[extra.key] || extra.meaning1}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <nav className="insight-nav insight-nav--spaced">
        <Link href="/account/analytical-insight" className="insight-nav-link">
          ← Back
        </Link>
        <Link href="/account" className="insight-nav-link">
          Back to home →
        </Link>
      </nav>
    </div>
  )
}

export function RecordsDashboard({ kind }: { kind: "academic" | "activity" }) {
  const { data, loading } = useStudentPassport()
  const isActivity = kind === "activity"
  const lessons = (data?.lessons || []).filter((lesson) =>
    isActivity ? lesson.kind === "activity" : lesson.kind !== "activity",
  )
  const records = (data?.records || []).filter((rec) =>
    isActivity ? rec.kind === "activity" : rec.kind !== "activity",
  )
  const prefix = isActivity ? "/account/activity" : "/account/academic"
  const title = isActivity ? "Activity Records" : "Academic Records"
  const pageClass = isActivity ? "activity-page" : "academic-page"
  const cardClass = isActivity ? "activity-summary-card" : "academic-summary-card"
  const portrait =
    narrativeText(data?.companion, ["current_learning_portrait"]) || WAITING_FOR_RECORDS

  const groups = useMemo(() => {
    const map = new Map<string, PassportLesson[]>()
    for (const lesson of lessons) {
      const key = lesson.latest_at ? `Updated ${formatPassportDate(lesson.latest_at)}` : "Recent"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(lesson)
    }
    return Array.from(map.entries())
  }, [lessons])

  if (loading) return <p className="text-sm text-classz-500">Loading records…</p>

  return (
    <div className={pageClass}>
      <Link href={`${prefix}/more`} className={cardClass}>
        <div className={isActivity ? "activity-summary-main" : "academic-summary-main"}>
          <div className={isActivity ? "activity-summary-text" : "academic-summary-text"}>
            <div className={isActivity ? "activity-summary-heading" : "academic-summary-heading"}>
              <div
                className={isActivity ? "activity-summary-icon" : "academic-summary-icon"}
                style={{
                  backgroundImage: `url('${isActivity ? "/images/activity-summary-trophy.png" : "/images/academic-summary-apple.png"}')`,
                }}
                aria-hidden
              />
              <div className={isActivity ? "activity-summary-heading-text" : "academic-summary-heading-text"}>
                <h1 className={isActivity ? "activity-summary-title" : "academic-summary-title"}>
                  Overall Learning Picture
                </h1>
                <span className={isActivity ? "activity-summary-status" : "academic-summary-status"}>
                  {records.length >= 5 ? "Established pattern" : "Early observations"}
                </span>
              </div>
            </div>
            <p className={isActivity ? "activity-summary-description" : "academic-summary-description"}>{portrait}</p>
            {records.length < 5 ? (
              <p className={isActivity ? "activity-summary-footnote" : "academic-summary-footnote"}>
                More details will be unlocked after 5 records
              </p>
            ) : null}
          </div>
        </div>
        <div className={isActivity ? "activity-stats" : "academic-stats"}>
          <div className={isActivity ? "activity-stat" : "academic-stat"}>
            <div className={isActivity ? "activity-stat-value-group" : "academic-stat-value-group"}>
              <div
                className={isActivity ? "activity-stat-icon" : "academic-stat-icon"}
                style={{ backgroundImage: "url('/images/icon-stat-folder.png')" }}
                aria-hidden
              />
              <span className={isActivity ? "activity-stat-value" : "academic-stat-value"}>{records.length}</span>
            </div>
            <span className={isActivity ? "activity-stat-label" : "academic-stat-label"}>
              Total {isActivity ? "activity" : "academic"} record
            </span>
          </div>
          <hr className={isActivity ? "activity-stats-divider" : "academic-stats-divider"} />
          <div className={isActivity ? "activity-stat" : "academic-stat"}>
            <div className={isActivity ? "activity-stat-value-group" : "academic-stat-value-group"}>
              <div
                className={isActivity ? "activity-stat-icon" : "academic-stat-icon"}
                style={{ backgroundImage: "url('/images/icon-stat-program.png')" }}
                aria-hidden
              />
              <span className={isActivity ? "activity-stat-value" : "academic-stat-value"}>{lessons.length}</span>
            </div>
            <span className={isActivity ? "activity-stat-label" : "academic-stat-label"}>
              Total {isActivity ? "activity" : "academic"} program
            </span>
          </div>
        </div>
      </Link>

      <p className="lesson-focus-reminder">{LESSON_FOCUS_REMINDER}</p>

      <section className={isActivity ? "activity-records" : "academic-records"}>
        <h2 className={isActivity ? "activity-records-title" : "academic-records-title"}>{title}</h2>
        {groups.length ? (
          groups.map(([date, items]) => (
            <div key={date} className={isActivity ? "activity-records-group" : "academic-records-group"}>
              <p className={isActivity ? "activity-records-date" : "academic-records-date"}>{date}</p>
              <div className={isActivity ? "activity-records-list" : "academic-records-list"}>
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`${prefix}/lessons/${item.id}`}
                    className={isActivity ? "activity-record-item activity-record-item--link" : "academic-record-item academic-record-item--link"}
                  >
                    <div
                      className={isActivity ? "activity-record-thumb" : "academic-record-thumb"}
                      style={
                        item.photo_url
                          ? { backgroundImage: `url('${resolveUploadUrl(item.photo_url)}')` }
                          : { background: "#E7F8F7" }
                      }
                    />
                    <div className={isActivity ? "activity-record-content" : "academic-record-content"}>
                      <div className={isActivity ? "activity-record-top" : "academic-record-top"}>
                        <div>
                          <h3 className={isActivity ? "activity-record-title" : "academic-record-title"}>{item.title}</h3>
                          <p className={isActivity ? "activity-record-meta" : "academic-record-meta"}>
                            <IconFolderRecord className="academic-record-inline-icon" />
                            {item.record_count} record{item.record_count === 1 ? "" : "s"}
                          </p>
                          <p className={isActivity ? "activity-record-location" : "academic-record-location"}>
                            <IconPin className="academic-record-inline-icon" />
                            {item.location || item.center_name || "—"}
                          </p>
                        </div>
                        <span className={isActivity ? `activity-record-badge activity-record-badge--${item.statusType}` : `academic-record-badge academic-record-badge--${item.statusType}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className={isActivity ? "activity-record-authors" : "academic-record-authors"}>{item.authors}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-classz-500">No {isActivity ? "activity" : "academic"} records yet.</p>
        )}
      </section>
    </div>
  )
}

type MoreItem = {
  label: string
  description?: string | null
}

function MoreItems({ items, emptyCopy }: { items: MoreItem[]; emptyCopy: string }) {
  if (!items.length) return <p className="more-info-empty">{emptyCopy}</p>
  return (
    <>
      {items.map((item) => (
        <div key={item.label} className="more-info-subsection">
          <h3 className="more-info-subsection-title">{item.label}</h3>
          {item.description ? (
            <p className="more-info-card-description">{item.description}</p>
          ) : null}
        </div>
      ))}
    </>
  )
}

/* node 3920:32148 — ZPassport-activity (more info), cards 3939:34907/34918/34961/35060 */
export function RecordsMorePage({ kind }: { kind: "academic" | "activity" }) {
  const { data } = useStudentPassport()
  const companion = data?.companion
  const isActivity = kind === "activity"
  const records = (data?.records || []).filter((r) =>
    isActivity ? r.kind === "activity" : r.kind !== "activity",
  )
  const differences = (data?.differences_across_programs || []).filter((d) =>
    isActivity ? d.kind === "activity" : d.kind !== "activity",
  )
  const prefix = isActivity ? "/account/activity" : "/account/academic"
  const portrait =
    narrativeText(companion, ["current_learning_portrait"]) ||
    "This section will fill in as the centre adds learning records."
  const algorithm = companion?.algorithm_json
  const strengths: MoreItem[] = (algorithm?.repeated_strengths || []).map((s) => ({
    label: s,
  }))
  const focusAreas: MoreItem[] = (algorithm?.repeated_focus_areas || []).map((s) => ({
    label: s,
  }))
  const differenceItems: MoreItem[] = differences.map((d) => ({
    label: d.program,
    description:
      [d.repeated_strength, d.repeated_support]
        .filter((parts) => parts && parts.length)
        .map((parts) => parts.join(" · "))
        .join(". ") || null,
  }))
  // ADR-002 D1 (refined): "What Seems to Help" is AI-sourced prose
  // (narrative key: what_helps_across_programmes). The deterministic
  // help_across_programs labels are deliberately NOT shown — display a
  // wait-for-AI message until the AI summary exists.
  const whatHelpsAi = narrativeText(companion, ["what_helps_across_programmes"])
  const overallStatus = records.length >= 5 ? "Established pattern" : "Early observations"

  return (
    <div className="more-info-page">
      <nav className="more-info-breadcrumb" aria-label="Breadcrumb">
        <Link href={prefix} className="more-info-breadcrumb-parent">
          {isActivity ? "Activity dashboard" : "Academic dashboard"}
        </Link>
        <span className="more-info-breadcrumb-separator"> &gt; </span>
        <span className="more-info-breadcrumb-current">More information</span>
      </nav>

      <div className="more-info-cards">
        <section className="more-info-card more-info-card--overview">
          <div className="more-info-card-content">
            <div className="more-info-overview-header">
              <h1 className="more-info-card-title">Overall Learning Picture</h1>
              <span className="more-info-badge">{overallStatus}</span>
            </div>
            <p className="more-info-card-description">{portrait}</p>
          </div>
          <div className="more-info-illustration-frame" aria-hidden="true">
            <div
              className={`more-info-art ${
                isActivity ? "more-info-art--trophy" : "more-info-art--apple"
              }`}
            />
          </div>
        </section>

        <section className="more-info-card">
          <div className="more-info-section-row">
            <div className="more-info-card-content">
              <h2 className="more-info-section-title">Stronger Areas</h2>
              <MoreItems items={strengths} emptyCopy="Add more records to reveal strengths." />
            </div>
            <div className="more-info-illustration-frame" aria-hidden="true">
              <div className="more-info-art more-info-art--chart" />
            </div>
          </div>
          <hr className="more-info-divider" />
          <div className="more-info-card-content">
            <h2 className="more-info-section-title">Areas Needing More Support</h2>
            <MoreItems
              items={focusAreas}
              emptyCopy="Add more records to reveal support areas."
            />
          </div>
        </section>

        <section className="more-info-card">
          {differenceItems.length ? (
            <>
              <div className="more-info-section-row">
                <div className="more-info-card-content">
                  <h2 className="more-info-section-title">Differences Across Programmes</h2>
                  <div className="more-info-subsection">
                    <h3 className="more-info-subsection-title">{differenceItems[0].label}</h3>
                    {differenceItems[0].description ? (
                      <p className="more-info-card-description">{differenceItems[0].description}</p>
                    ) : null}
                  </div>
                </div>
                <div className="more-info-illustration-frame" aria-hidden="true">
                  <div className="more-info-art more-info-art--differences" />
                </div>
              </div>
              {differenceItems.slice(1).map((item) => (
                <div key={item.label}>
                  <hr className="more-info-divider" />
                  <div className="more-info-card-content">
                    <div className="more-info-subsection">
                      <h3 className="more-info-subsection-title">{item.label}</h3>
                      {item.description ? (
                        <p className="more-info-card-description">{item.description}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="more-info-section-row">
              <div className="more-info-card-content">
                <h2 className="more-info-section-title">Differences Across Programmes</h2>
                <p className="more-info-empty">No programmes yet.</p>
              </div>
              <div className="more-info-illustration-frame" aria-hidden="true">
                <div className="more-info-art more-info-art--differences" />
              </div>
            </div>
          )}
        </section>

        <section className="more-info-card">
          <div className="more-info-section-row">
            <div className="more-info-card-content">
              <h2 className="more-info-section-title">What Seems to Help Across Programmes</h2>
              {whatHelpsAi ? (
                <p className="more-info-card-description">{whatHelpsAi}</p>
              ) : (
                <p className="more-info-empty">
                  {records.length >= 5 ? WAITING_FOR_AI : WAITING_FOR_RECORDS}
                </p>
              )}
            </div>
            <div className="more-info-illustration-frame" aria-hidden="true">
              <div className="more-info-art more-info-art--help" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

const PROGRESS_LEVEL_SCALE: Record<string, number> = {
  supported: 1,
  guided: 2,
  developing: 3,
  independent: 4,
}

const CHART_PLOT_WIDTH = 606.16
const CHART_PLOT_HEIGHT = 446.04

/* node 3939:34606 — Progress (level 1-4) over Lesson area chart, 713.67×521.52 */
function LessonProgressChart({ records }: { records: PassportRecord[] }) {
  const chronological = [...records].reverse()
  const levels = chronological.map(
    (rec) => PROGRESS_LEVEL_SCALE[String(rec.progress_level || "").toLowerCase()] || 0,
  )
  const columns = Math.max(chronological.length, 1)
  const columnWidth = CHART_PLOT_WIDTH / columns
  const yFor = (level: number) => CHART_PLOT_HEIGHT - (level / 4) * CHART_PLOT_HEIGHT

  const points = levels.map(
    (level, i) => `${(columnWidth * (i + 0.5)).toFixed(2)},${yFor(level).toFixed(2)}`,
  )
  const areaPath = points.length
    ? `M${(columnWidth * 0.5).toFixed(2)},${CHART_PLOT_HEIGHT} L${points.join(
        " L",
      )} L${(columnWidth * (levels.length - 0.5)).toFixed(2)},${CHART_PLOT_HEIGHT} Z`
    : ""

  return (
    <section className="lesson-chart-section">
      <div className="lesson-chart">
        <div className="lesson-chart-frame">
          {[1, 2, 3].map((level) => (
            <div className="lesson-chart-grid-line" key={level} style={{ top: yFor(level) }} />
          ))}
          {Array.from({ length: columns }).map((_, i) =>
            i === 0 ? null : (
              <div className="lesson-chart-stem" key={i} style={{ left: columnWidth * i }} />
            ),
          )}
          <svg
            className="lesson-chart-area"
            viewBox={`0 0 ${CHART_PLOT_WIDTH} ${CHART_PLOT_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {areaPath ? <path d={areaPath} fill="#00c7f2" fillOpacity="0.5" /> : null}
          </svg>
          {levels.map((_, i) => (
            <span
              className="lesson-chart-x-tick"
              key={i}
              style={{ left: columnWidth * (i + 0.5) }}
            >
              {i}
            </span>
          ))}
        </div>
        {[4, 3, 2, 1].map((level) => (
          <span
            className="lesson-chart-y-tick"
            key={level}
            style={{ top: `calc(73.2px + ${yFor(level).toFixed(2)}px)` }}
          >
            {level}
          </span>
        ))}
        <span className="lesson-chart-axis-label lesson-chart-axis-label--progress">Progress</span>
        <span className="lesson-chart-axis-label lesson-chart-axis-label--lesson">Lesson</span>
      </div>
    </section>
  )
}

/** Initial-letter fallback for centres/coaches that have no photo on record yet. */
function PersonAvatar({
  name,
  className,
}: {
  name?: string | null
  className: string
}) {
  const label = String(name || "").trim()
  return (
    <div className={`${className} lesson-avatar--initial`} aria-hidden="true">
      {label ? label.slice(0, 1).toUpperCase() : ""}
    </div>
  )
}

/* node 2210:16658 — ZPassport-activity details; content 3920:32925 */
export function LessonPage({ kind, lessonId }: { kind: "academic" | "activity"; lessonId: string }) {
  const { data } = useStudentPassport()
  const prefix = kind === "activity" ? "/account/activity" : "/account/academic"
  const lesson = data?.lessons.find((l) => String(l.id) === String(lessonId))
  if (!lesson) return <p className="text-sm text-classz-500">Lesson not found.</p>

  const insights = lesson.insights
  const records = lesson.records || []
  const strength = (insights?.repeated_strength || []).join(" · ")
  const supportNeed = (insights?.repeated_support || []).join(" · ")
  // ADR-002 D1 amendment: "What Seems to Help" is AI prose only — never the
  // deterministic what_helps labels. Show the state-appropriate wait copy.
  const helpWaiting = records.length >= 3 ? WAITING_FOR_AI : WAITING_FOR_RECORDS

  return (
    <div className="lesson-detail-page">
      <div
        className="lesson-hero"
        style={
          lesson.photo_url
            ? { backgroundImage: `url('${resolveUploadUrl(lesson.photo_url)}')` }
            : undefined
        }
      />

      <header className="lesson-header">
        <h1 className="lesson-title">{lesson.title}</h1>
        <div className="lesson-header-details">
          <div className="lesson-header-top-row">
            <p className="lesson-records">
              <IconFolderRecord className="lesson-inline-icon" />
              {lesson.record_count} Record{lesson.record_count === 1 ? "" : "s"}
            </p>
            <span className={`lesson-status-badge lesson-status-badge--${lesson.statusType || "early"}`}>
              {lesson.status}
            </span>
          </div>
          <p className="lesson-location">
            <IconPin className="lesson-inline-icon" />
            {lesson.center_name || lesson.location || "\u2014"}
          </p>
        </div>
      </header>

      <section className="lesson-hosted-by-section">
        <div className="lesson-hosted-by">
          <h2 className="lesson-hosted-by-label">Hosted by</h2>
          <div className="lesson-hosted-by-row">
            <PersonAvatar name={lesson.center_name} className="lesson-hosted-by-avatar" />
            <span className="lesson-hosted-by-name">{lesson.center_name || "\u2014"}</span>
          </div>
        </div>

        <LessonProgressChart records={records} />
      </section>

      <div className="lesson-info-cards">
        <section className="lesson-info-card">
          <div className="lesson-info-section-row lesson-info-section-row--with-art">
            <div className="lesson-info-section-body">
              <h2 className="lesson-info-title">Current Progress</h2>
              {insights?.current_progress ? (
                <p className="lesson-info-description">
                  {progressLevelLabel(insights.current_progress)}
                </p>
              ) : (
                <p className="lesson-info-empty">{WAITING_FOR_RECORDS}</p>
              )}
            </div>
            <div
              className="lesson-info-illustration lesson-info-illustration--chart"
              aria-hidden="true"
            />
          </div>
          <hr className="lesson-info-divider" />
          <div className="lesson-info-section-body">
            <h2 className="lesson-info-title">Repeated Strength</h2>
            {strength ? (
              <p className="lesson-info-subtitle">{strength}</p>
            ) : (
              <p className="lesson-info-empty">{WAITING_FOR_RECORDS}</p>
            )}
          </div>
          <hr className="lesson-info-divider" />
          <div className="lesson-info-section-body">
            <h2 className="lesson-info-title">Repeated Support Need</h2>
            {supportNeed ? (
              <p className="lesson-info-subtitle">{supportNeed}</p>
            ) : (
              <p className="lesson-info-empty">{WAITING_FOR_RECORDS}</p>
            )}
          </div>
        </section>

        <section className="lesson-info-card">
          <div className="lesson-info-section-row lesson-info-section-row--with-art">
            <div className="lesson-info-section-body">
              <h2 className="lesson-info-title">What Seems to Help</h2>
              <p className="lesson-info-empty">{helpWaiting}</p>
            </div>
            <div
              className="lesson-info-illustration lesson-info-illustration--help"
              aria-hidden="true"
            />
          </div>
          <hr className="lesson-info-divider" />
          <div className="lesson-info-section-body">
            <h2 className="lesson-info-title">Current Focus</h2>
            {insights?.current_focus ? (
              <p className="lesson-info-subtitle">{insights.current_focus}</p>
            ) : (
              <p className="lesson-info-empty">{WAITING_FOR_RECORDS}</p>
            )}
          </div>
        </section>
      </div>

      <section className="lesson-records-section">
        <h2 className="lesson-records-title">Recent Records</h2>
        <div className="lesson-records-card">
          {records.length ? (
            records.map((rec, i) => (
              <div key={rec.id}>
                {i > 0 ? <hr className="lesson-record-row-divider" /> : null}
                <Link
                  href={`${prefix}/lessons/${lesson.id}/records/${rec.id}`}
                  className="lesson-record-row"
                >
                  <div className="lesson-record-row-head">
                    <h3 className="lesson-record-row-class">{rec.class_name}</h3>
                  </div>
                  <div className="lesson-record-row-body">
                    <div className="lesson-record-row-meta">
                      <p className="lesson-record-row-meta-line">
                        {lessonOrdinal(records.length - i)}
                      </p>
                      <p className="lesson-record-row-meta-line">
                        <span>{formatLessonDate(rec.created_at)}</span>
                        <span>{formatLessonTimeRange(rec.start_time, rec.end_time)}</span>
                      </p>
                      <p className="lesson-record-row-meta-line">{rec.center_name || "\u2014"}</p>
                    </div>
                    {rec.instructor ? (
                      <p className="lesson-record-row-author">
                        <PersonAvatar name={rec.instructor} className="lesson-record-row-avatar" />
                        By {rec.instructor}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p className="lesson-info-empty">No records for this programme yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}

/* node 2210:16986 — ZPassport-activity details expand; content 3920:33262 */
export function LessonRecordPage({
  kind,
  lessonId,
  recordId,
}: {
  kind: "academic" | "activity"
  lessonId: string
  recordId: string
}) {
  const { data } = useStudentPassport()
  const prefix = kind === "activity" ? "/account/activity" : "/account/academic"
  const lesson = data?.lessons.find((l) => String(l.id) === String(lessonId))
  const record = lesson?.records.find((r) => String(r.id) === String(recordId))
  if (!lesson || !record) return <p className="text-sm text-classz-500">Record not found.</p>

  const records = lesson.records || []
  const index = records.findIndex((r) => String(r.id) === String(record.id))
  const ordinal = lessonOrdinal(Math.max(records.length - index, 1))
  const observed = record.evidence || (record.observed || []).join(" · ")
  const supportNeed = (record.attention_areas || []).join(" · ") || record.support_need
  const whatHelped = record.support_need

  return (
    <div className="lesson-detail-page lesson-record-page">
      <div className="lesson-hero-card">
        <nav className="lesson-breadcrumb" aria-label="Breadcrumb">
          <Link href={`${prefix}/lessons/${lesson.id}`} className="lesson-breadcrumb-parent">
            {lesson.title}
          </Link>
          <span className="lesson-breadcrumb-separator"> &gt; </span>
          <span className="lesson-breadcrumb-current">
            {lesson.title} {ordinal}
          </span>
        </nav>
        <div
          className="lesson-hero"
          style={
            record.photo_url
              ? { backgroundImage: `url('${resolveUploadUrl(record.photo_url)}')` }
              : undefined
          }
        />
      </div>

      <header className="lesson-header">
        <h1 className="lesson-title lesson-title--record">{lesson.title}</h1>
        <div className="lesson-header-details">
          <div className="lesson-record-meta-row">
            <p className="lesson-record-meta-cell">
              <IconFolderRecord className="lesson-inline-icon" />
              {ordinal}
            </p>
            <p className="lesson-record-meta-cell">
              <IconFolderRecord className="lesson-inline-icon" />
              {formatLessonDate(record.created_at)}
            </p>
            <p className="lesson-record-meta-cell">
              <IconFolderRecord className="lesson-inline-icon" />
              {formatLessonTimeRange(record.start_time, record.end_time) || "\u2014"}
            </p>
          </div>
          <p className="lesson-location">
            <IconPin className="lesson-inline-icon" />
            {record.center_name || lesson.center_name || "\u2014"}
          </p>
        </div>
      </header>

      <section className="lesson-record-feedback">
        <h2 className="lesson-record-feedback-label">Feedback by</h2>
        <div className="lesson-record-feedback-row">
          <PersonAvatar
            name={record.center_name || lesson.center_name}
            className="lesson-record-feedback-avatar"
          />
          <span className="lesson-record-feedback-name">
            {record.center_name || lesson.center_name || "\u2014"}
          </span>
        </div>
        {record.instructor ? (
          <div className="lesson-record-feedback-row">
            <PersonAvatar
              name={record.instructor}
              className="lesson-record-feedback-avatar"
            />
            <div className="lesson-record-feedback-info lesson-record-feedback-info--coach">
              <span className="lesson-record-feedback-name">{record.instructor}</span>
              <span className="lesson-record-feedback-role">Program Coach</span>
            </div>
          </div>
        ) : null}
      </section>

      <section className="lesson-info-card lesson-record-focus-card">
        <div className="lesson-record-focus-head">
          <h2 className="lesson-info-title">Today&apos;s Focus</h2>
          <span className={`lesson-status-badge lesson-status-badge--${lesson.statusType || "early"}`}>
            {lesson.status}
          </span>
        </div>
        <p className="lesson-info-description">{record.class_focus || "\u2014"}</p>
      </section>

      <section className="lesson-info-card">
        <div className="lesson-info-section-row lesson-info-section-row--with-art">
          <div className="lesson-info-section-body">
            <h2 className="lesson-info-title">What We Observed</h2>
            <p className="lesson-info-description">{observed || "\u2014"}</p>
          </div>
          <div
            className="lesson-info-illustration lesson-info-illustration--observed"
            aria-hidden="true"
          />
        </div>
        <hr className="lesson-info-divider" />
        <div className="lesson-info-section-body">
          <h2 className="lesson-info-title">Support Need Today</h2>
          <p className="lesson-info-description">{supportNeed || "\u2014"}</p>
        </div>
        <hr className="lesson-info-divider" />
        <div className="lesson-info-section-body">
          <h2 className="lesson-info-title">What Helped</h2>
          <p className="lesson-info-description">{whatHelped || "\u2014"}</p>
        </div>
        <hr className="lesson-info-divider" />
        <div className="lesson-info-section-body">
          <h2 className="lesson-info-title">Next Step</h2>
          <p className="lesson-info-description">{record.student_work_on || "\u2014"}</p>
        </div>
      </section>

      <section className="lesson-info-card">
        <div className="lesson-info-section-row lesson-info-section-row--with-art">
          <div className="lesson-info-section-body">
            <h2 className="lesson-info-title">Coach&apos;s Note</h2>
            <p className="lesson-info-description">{record.additional_comment || "\u2014"}</p>
          </div>
          <div
            className="lesson-info-illustration lesson-info-illustration--coach-note"
            aria-hidden="true"
          />
        </div>
      </section>

      {record.photo_url ? (
        <section className="lesson-record-moments">
          <h2 className="lesson-record-moments-title">Moments</h2>
          <div
            className="lesson-record-moments-image"
            style={{ backgroundImage: `url('${resolveUploadUrl(record.photo_url)}')` }}
            role="img"
            aria-label={`${lesson.title} moment`}
          />
        </section>
      ) : null}
    </div>
  )
}

export function StudentProfilePage() {
  const { data, loading } = useStudentPassport()
  const session = typeof window !== "undefined" ? getClasszSession() : null
  const profile = data?.profile
  const photo = childPhoto(profile)

  if (loading) return <p className="text-sm text-classz-500">Loading profile…</p>

  return (
    <div className="student-profile-page">
      <h1 className="student-profile-title">Profile</h1>
      <section className="student-profile-card">
        <div className="student-profile-parent">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="student-profile-parent-photo student-profile-parent-photo--initial">
            {(session?.user.name || "P").slice(0, 1)}
          </div>
          <div>
            <p className="student-profile-label">Parent account</p>
            <p className="student-profile-name">{session?.user.name || "Parent"}</p>
            <p className="student-profile-meta">{session?.user.email}</p>
          </div>
        </div>
      </section>
      <section className="student-profile-card">
        <div className="student-profile-parent">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="student-profile-parent-photo" />
          ) : (
            <div className="student-profile-parent-photo student-profile-parent-photo--initial">
              {(profile?.name || "?").slice(0, 1)}
            </div>
          )}
          <div>
            <p className="student-profile-label">Learner</p>
            <p className="student-profile-name">{profile?.name || "Student"}</p>
            <p className="student-profile-meta">
              {profile?.sex === 1 ? "Male" : profile?.sex === 0 ? "Female" : "—"}
              {profile?.age != null ? ` · Age ${profile.age}` : ""}
              {profile?.level ? ` · ${profile.level}` : ""}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export function MediaGrid({ kind }: { kind: "samples" | "moments" }) {
  const { data, loading } = useStudentPassport()
  const items = kind === "samples" ? data?.work_samples || [] : data?.moments || []
  const title = kind === "samples" ? "Work Samples" : "Moments"
  if (loading) return <p className="text-sm text-classz-500">Loading…</p>
  return (
    <div className="work-samples-page">
      <h1 className="work-samples-title">{title}</h1>
      {items.length ? (
        <div className="work-samples-grid">
          {items.map((item) => (
            <article key={String(item.id)} className="work-sample-card">
              <div
                className="work-sample-thumb"
                style={
                  item.image
                    ? { backgroundImage: `url('${resolveUploadUrl(item.image)}')` }
                    : { background: "#E7F8F7" }
                }
              />
              <div className="work-sample-body">
                <h2 className="work-sample-card-title">{item.title}</h2>
                <p className="work-sample-meta">{item.lessonLabel}</p>
                <p className="work-sample-centre">{item.centre}</p>
                <p className="work-sample-date">{formatPassportDate(item.date)}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-classz-500">No {title.toLowerCase()} yet.</p>
      )}
    </div>
  )
}
