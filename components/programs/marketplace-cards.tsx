"use client"

import Link from "next/link"
import { FavouriteButton } from "@/components/favourite-button"
import { SaveCourseButton } from "@/components/programs/save-course-button"

export function MarketplaceCentreCard({
  href,
  id,
  name,
  image,
  meta,
  price,
  sponsored,
  feedback,
  sponsoredLabel,
  feedbackLabel,
}: {
  href: string
  id: number
  name: string
  image: string
  meta: string
  price: string
  sponsored: boolean
  feedback: boolean
  sponsoredLabel: string
  feedbackLabel: string
}) {
  return (
    <Link
      href={href}
      data-testid="centre-card"
      className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#e6e6e6]">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute top-3 left-3 flex gap-2">
          {sponsored ? <Badge>{sponsoredLabel}</Badge> : null}
        </div>
        {feedback ? (
          <span className="absolute top-3 right-3">
            <Badge>{feedbackLabel} ✓</Badge>
          </span>
        ) : null}
        <span className="absolute right-3 bottom-3">
          <FavouriteButton
            type="centre"
            id={id}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm"
          />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-5 py-5">
        <h3 className="text-[20px] leading-7 font-semibold text-[#18191b]">{name}</h3>
        {meta ? <p className="text-[14px] leading-5 text-[#5e5e5e]">{meta}</p> : null}
        {price ? <p className="text-[16px] leading-6 font-medium text-[#18191b]">{price}</p> : null}
      </div>
    </Link>
  )
}

export function MarketplaceProgramCard({
  href,
  id,
  name,
  image,
  meta,
  price,
  sponsored,
  sponsoredLabel,
}: {
  href: string
  id: number
  name: string
  image: string
  meta: string
  price: string
  sponsored: boolean
  sponsoredLabel: string
}) {
  return (
    <Link
      href={href}
      data-testid="program-listing-card"
      className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#e6e6e6]">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        {sponsored ? (
          <span className="absolute top-3 left-3">
            <Badge>{sponsoredLabel}</Badge>
          </span>
        ) : null}
        <span className="absolute right-3 bottom-3">
          <SaveCourseButton courseId={id} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-5 py-5">
        <h3 className="text-[20px] leading-7 font-semibold text-[#18191b]">{name}</h3>
        {meta ? <p className="text-[14px] leading-5 text-[#5e5e5e]">{meta}</p> : null}
        {price ? <p className="text-[16px] leading-6 font-semibold text-[#18191b]">{price}</p> : null}
      </div>
    </Link>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#18191b] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      {children}
    </span>
  )
}
