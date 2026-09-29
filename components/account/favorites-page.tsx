"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { apiGet } from "@/lib/classz-api-client"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import {
  ensureFavouritesLoaded,
  refreshFavourites,
  toggleFavourite,
  useIsFavourited,
  type FavItemType,
} from "@/lib/favourites"
import { ProfileShell } from "./profile-shell"

/**
 * ADR-006 D8 — "favorites": the parent's hearted programs, workshops, trials
 * and centres in one mixed list (newest first), each linking to its detail
 * page with an inline heart to unfavourite.
 */

type FavRow = { item_type: FavItemType; item_id: number }

type CourseRow = {
  id: number
  name: string
  course_type: string | null
  price?: string | null
  image_url?: string | null
}

type CentreRow = {
  id: number
  center_name: string
  category?: string | null
  avatar_url?: string | null
}

function courseHref(courseType: string | null, id: number): string {
  // Trials/workshops/programs are all courses rows — route by type.
  if (courseType && /trial/i.test(courseType)) return `/trials/${id}`
  if (courseType && /(short_term|summer|workshop)/i.test(courseType)) return `/workshops/${id}`
  return `/programs/${id}`
}

function FavouriteRow({
  type,
  id,
  title,
  subtitle,
  image,
  href,
}: {
  type: FavItemType
  id: number
  title: string
  subtitle: string
  image: string
  href: string
}) {
  const { t } = useLanguage()
  const favourited = useIsFavourited(type, id)
  return (
    <li className="flex items-center gap-4 rounded-[12px] border border-[#EBEBEB] p-3">
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-4">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-16 w-24 shrink-0 rounded-[8px] border border-[#EBEBEB] object-cover"
          />
        ) : (
          <div className="h-16 w-24 shrink-0 rounded-[8px] border border-[#EBEBEB] bg-[#F5F5F5]" />
        )}
        <div className="min-w-0">
          <p className="truncate text-[15px] font-[weight:590]">{title}</p>
          <p className="truncate text-[13px] text-[#5E5E5E]">{subtitle}</p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={t("account.favorites.remove")}
        aria-pressed={favourited}
        onClick={() => void toggleFavourite(type, id)}
        className="rounded p-2 text-[#BDBDBD] transition-colors hover:bg-[#F5F5F5]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 21s-7.5-4.7-9.7-9.2C.8 8.6 2.6 5 6.1 5c2 0 3.4 1 4.4 2.4L12 9l1.5-1.6C14.5 6 15.9 5 17.9 5c3.5 0 5.3 3.6 3.8 6.8C19.5 16.3 12 21 12 21Z"
            fill={favourited ? "#E5484D" : "none"}
            stroke={favourited ? "#E5484D" : "#BDBDBD"}
            strokeWidth="1.6"
          />
        </svg>
        <span className="sr-only">{t("account.favorites.remove")}</span>
      </button>
    </li>
  )
}

export function FavoritesPage() {
  const { t, locale } = useLanguage()
  const [rows, setRows] = useState<FavRow[] | null>(null)
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [centres, setCentres] = useState<CentreRow[]>([])

  useEffect(() => {
    refreshFavourites()
    Promise.all([
      apiGet<FavRow[]>("/favourites", "student").catch(() => []),
      fetch("/api/courses")
        .then((r) => r.json())
        .then((body) => (body?.success ? (body.data as CourseRow[]) : []))
        .catch(() => []),
      fetch("/api/centers")
        .then((r) => r.json())
        .then((body) => (body?.success ? (body.data as CentreRow[]) : []))
        .catch(() => []),
      ensureFavouritesLoaded(),
    ]).then(([favRows, courseRows, centreRows]) => {
      setRows(favRows || [])
      setCourses(courseRows || [])
      setCentres(centreRows || [])
    })
  }, [])

  const courseById = new Map(courses.map((c) => [Number(c.id), c]))
  const centreById = new Map(centres.map((c) => [Number(c.id), c]))

  const hydrated = (rows || []).map((row) => {
    if (row.item_type === "course") {
      const course = courseById.get(row.item_id)
      return {
        key: `course:${row.item_id}`,
        type: row.item_type,
        id: row.item_id,
        title: course?.name || `#${row.item_id}`,
        subtitle:
          course?.course_type === "trial"
            ? t("account.favorites.trial")
            : course?.course_type && /(short_term|summer)/i.test(course.course_type)
              ? t("account.favorites.workshop")
              : t("account.favorites.program"),
        image: course?.image_url ? resolveUploadUrl(course.image_url) : "",
        href: courseHref(course?.course_type || null, row.item_id),
      }
    }
    const centre = centreById.get(row.item_id)
    return {
      key: `centre:${row.item_id}`,
      type: row.item_type,
      id: row.item_id,
      title: centre?.center_name || `#${row.item_id}`,
      subtitle: centre?.category || t("account.favorites.centre"),
      image: centre?.avatar_url ? resolveUploadUrl(centre.avatar_url) : "",
      href: `/centres/${row.item_id}`,
    }
  })

  return (
    <ProfileShell active="favorites">
      <h1 className="text-[28px] font-[weight:590] leading-[34px]">
        {t("account.sidebar.favorites")}
      </h1>

      {rows === null ? (
        <p className="mt-8 text-sm text-[#717171]">{t("account.loading")}</p>
      ) : hydrated.length === 0 ? (
        <p className="mt-8 text-sm text-[#717171]">{t("account.favorites.empty")}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {hydrated.map((item) => (
            <FavouriteRow
              key={item.key}
              type={item.type}
              id={item.id}
              title={item.title}
              subtitle={item.subtitle}
              image={item.image}
              href={item.href}
            />
          ))}
        </ul>
      )}
    </ProfileShell>
  )
}
