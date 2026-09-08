import type { ReactNode } from "react"
import Link from "next/link"
import { Apple, ArrowRight, Check, Play } from "lucide-react"

export function InfoGlow({ variant = "hero" }: { variant?: "hero" | "soft" | "pink" }) {
  const blobs =
    variant === "pink"
      ? [
          "absolute -left-10 top-8 h-[340px] w-[340px] rounded-full bg-[#fde8f0] blur-[90px]",
          "absolute -right-8 top-20 h-[300px] w-[300px] rounded-full bg-[#fff4cc] blur-[90px]",
          "absolute left-1/2 top-40 h-[220px] w-[220px] -translate-x-1/2 rounded-full bg-[#e8e4ff] blur-[80px]",
        ]
      : variant === "soft"
        ? [
            "absolute left-[8%] top-10 h-[260px] w-[260px] rounded-full bg-[#d7f4f3] blur-[80px]",
            "absolute right-[10%] top-16 h-[240px] w-[240px] rounded-full bg-[#fff4cc] blur-[80px]",
          ]
        : [
            "absolute left-[12%] top-8 h-[320px] w-[320px] rounded-full bg-[#fff4cc] blur-[90px]",
            "absolute right-[10%] top-16 h-[300px] w-[300px] rounded-full bg-[#d7f4f3] blur-[90px]",
            "absolute left-1/2 top-28 h-[180px] w-[180px] -translate-x-1/2 rounded-full bg-[#f3e8ff] blur-[70px]",
          ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {blobs.map((className) => (
        <div key={className} className={className} />
      ))}
    </div>
  )
}

export function InfoSection({
  children,
  className = "",
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`relative px-6 md:px-16 ${className}`}>
      <div className="relative mx-auto max-w-[1100px]">{children}</div>
    </section>
  )
}

export function FeatureSplit({
  reverse,
  eyebrow,
  title,
  body,
  bullets,
  checks,
  visual,
}: {
  reverse?: boolean
  eyebrow: string
  title: string
  body: string
  bullets?: string[]
  checks?: boolean
  visual: ReactNode
}) {
  return (
    <div
      className={`flex flex-col items-center gap-10 lg:flex-row lg:gap-16 ${
        reverse ? "lg:flex-row-reverse" : ""
      }`}
    >
      <div className="w-full max-w-lg lg:flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0abab5]">{eyebrow}</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">{title}</h3>
        <p className="mt-4 text-base leading-7 text-shade-500">{body}</p>
        {bullets?.length ? (
          <ul className="mt-5 space-y-2.5">
            {bullets.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-6 text-shade-500">
                {checks ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0abab5]" />
                ) : (
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0abab5]" />
                )}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="w-full lg:flex-1">{visual}</div>
    </div>
  )
}

export function DarkCta({
  title,
  body,
  primary,
  primaryHref,
  secondary,
  secondaryHref,
  visual,
}: {
  title: string
  body?: string
  primary: string
  primaryHref: string
  secondary?: string
  secondaryHref?: string
  visual?: ReactNode
}) {
  return (
    <section className="px-6 py-16 md:px-16">
      <div className="mx-auto flex max-w-[1100px] flex-col overflow-hidden rounded-[28px] bg-[#1a1a1a] md:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-5 px-8 py-12 md:px-14">
          <h2 className="max-w-md text-3xl font-semibold leading-tight text-white md:text-4xl">{title}</h2>
          {body ? <p className="max-w-md text-sm leading-6 text-white/70">{body}</p> : null}
          <Link
            href={primaryHref}
            className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-ink transition hover:bg-[#d7f4f3]"
          >
            {primary}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {secondary && secondaryHref ? (
            <Link href={secondaryHref} className="w-fit text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">
              {secondary}
            </Link>
          ) : null}
        </div>
        {visual ? <div className="relative min-h-[240px] flex-1 p-6 md:p-8">{visual}</div> : null}
      </div>
    </section>
  )
}

export function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[36px] border-[10px] border-[#222] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] ${className}`}
    >
      {children}
    </div>
  )
}

export function MiniChart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 120" className={className} aria-hidden>
      <polyline
        fill="none"
        stroke="#0abab5"
        strokeWidth="3"
        points="8,88 48,72 88,78 128,42 168,50 212,22"
      />
      {[8, 48, 88, 128, 168, 212].map((x, i) => (
        <circle key={x} cx={x} cy={[88, 72, 78, 42, 50, 22][i]} r="4" fill="#0abab5" />
      ))}
    </svg>
  )
}

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#e8ecec] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <div className="flex items-center gap-2 border-b border-[#eee] bg-[#f6f6f6] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 flex h-6 flex-1 items-center rounded-md bg-white px-3 text-[11px] text-shade-400">
          classz.co/centre
        </span>
      </div>
      <div className="flex min-h-[320px] md:min-h-[400px]">
        <aside className="hidden w-[88px] flex-col items-center gap-5 bg-[#222] py-6 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0abab5] text-[11px] font-semibold text-white">
            Z
          </span>
          {["Dash", "Kids", "Class", "Pay", "Docs"].map((label) => (
            <span key={label} className="text-[10px] text-white/50">
              {label}
            </span>
          ))}
        </aside>
        <div className="grid min-w-0 flex-1 gap-4 p-4 md:grid-cols-[1.15fr_0.85fr] md:p-6">
          <div className="rounded-2xl bg-[#f7fafa] p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Overview</p>
              <p className="text-xs text-shade-400">This week</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Active students", value: "128" },
                { label: "Attendance", value: "85%" },
                { label: "Classes", value: "24" },
                { label: "Parents", value: "91" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white px-3 py-3">
                  <p className="text-[11px] text-shade-400">{stat.label}</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-[#f7fafa] p-4">
            <p className="text-sm font-semibold text-ink">Progress</p>
            <MiniChart className="mt-4 h-28 w-full" />
            <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs text-ink">Records submitted this week</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MiniPhone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[28px] border-[8px] border-[#222] bg-[#f7fafa] shadow-[0_16px_40px_rgba(0,0,0,0.16)] ${className}`}>
      <div className="mx-auto mt-1.5 h-1 w-10 rounded-full bg-[#d0d0d0]" />
      <div className="p-3">{children}</div>
    </div>
  )
}

export function PhoneAnalytics() {
  return (
    <MiniPhone>
      <p className="text-[10px] font-semibold text-ink">This week</p>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {[
          { l: "Students", v: "128" },
          { l: "Attend", v: "85%" },
        ].map((s) => (
          <div key={s.l} className="rounded-lg bg-white px-2 py-2">
            <p className="text-[9px] text-shade-400">{s.l}</p>
            <p className="text-sm font-semibold">{s.v}</p>
          </div>
        ))}
      </div>
      <MiniChart className="mt-2 h-16 w-full" />
    </MiniPhone>
  )
}

export function PhoneSchedule() {
  return (
    <MiniPhone>
      <p className="text-[10px] font-semibold text-ink">Today</p>
      <div className="mt-2 space-y-1.5">
        {[
          { t: "09:30", n: "STEM Lab" },
          { t: "14:00", n: "Violin" },
          { t: "16:30", n: "Swim" },
        ].map((row) => (
          <div key={row.n} className="flex items-center justify-between rounded-lg bg-white px-2 py-1.5">
            <span className="text-[10px] font-medium">{row.n}</span>
            <span className="text-[9px] text-shade-400">{row.t}</span>
          </div>
        ))}
      </div>
    </MiniPhone>
  )
}

export function PhoneChat() {
  return (
    <MiniPhone>
      <p className="text-[10px] font-semibold text-ink">Parents</p>
      <div className="mt-2 space-y-1.5">
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-2 py-1.5 text-[9px] leading-4 text-ink">
          How did today go?
        </div>
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#0abab5] px-2 py-1.5 text-[9px] leading-4 text-white">
          Ava stayed curious with the circuit.
        </div>
      </div>
    </MiniPhone>
  )
}

export function PhoneStudents() {
  const kids = [
    { src: "/images/profile-charlie.jpg", name: "Charlie" },
    { src: "/kid-music.jpg", name: "Ava" },
    { src: "/kid-science.jpg", name: "Leo" },
    { src: "/kid-painting.jpg", name: "Mia" },
  ]
  return (
    <MiniPhone>
      <p className="text-[10px] font-semibold text-ink">Class list</p>
      <p className="text-[9px] text-shade-400">Photos · today</p>
      <div className="mt-2 space-y-1.5">
        {kids.map((kid) => (
          <div key={kid.name} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5">
            <img src={kid.src} alt="" className="h-7 w-7 rounded-full object-cover" />
            <span className="text-[10px] font-medium">{kid.name}</span>
          </div>
        ))}
      </div>
    </MiniPhone>
  )
}

export function PhoneListing() {
  return (
    <MiniPhone>
      <p className="text-[10px] font-semibold text-ink">Centre profile</p>
      <div className="mt-2 overflow-hidden rounded-lg">
        <img src="/kid-science.jpg" alt="" className="h-16 w-full object-cover" />
      </div>
      <p className="mt-2 text-[10px] font-semibold">Harbour Studio</p>
      <p className="text-[9px] text-shade-400">Art · Music · STEM</p>
    </MiniPhone>
  )
}

export function StoreBadges() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href="#"
        className="inline-flex items-center gap-3 rounded-xl bg-[#222] px-4 py-2.5 text-white"
      >
        <Apple className="h-5 w-5" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase">Download on the</span>
          <span className="text-sm font-semibold">App Store</span>
        </span>
      </a>
      <a
        href="#"
        className="inline-flex items-center gap-3 rounded-xl bg-[#222] px-4 py-2.5 text-white"
      >
        <Play className="h-5 w-5 fill-current" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase">Get it on</span>
          <span className="text-sm font-semibold">Google Play</span>
        </span>
      </a>
    </div>
  )
}

export function ObservationCard({
  photo,
  name,
  note,
}: {
  photo: string
  name: string
  note: string
}) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
      <img src={photo} alt="" className="h-36 w-full object-cover" />
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-ink">{name}</p>
        <p className="mt-1 text-xs leading-5 text-shade-500">{note}</p>
      </div>
    </article>
  )
}
