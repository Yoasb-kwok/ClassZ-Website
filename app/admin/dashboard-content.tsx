"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  ListChecks,
  BookOpen,
  AlertCircle,
  Calendar,
  ChevronRight,
  DollarSign,
  UserPlus,
  Users,
  Filter,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useAdminStore } from "@/components/admin/use-admin-store"
import { formatHKD, formatClassTime, locationLabel, type DemoStats, type DemoUpcomingClass } from "@/lib/classz-admin-demo"
import type { ClasszAdminStore } from "@/lib/classz-admin-store"

function deriveFromStore(store: ClasszAdminStore): { stats: DemoStats; upcoming: DemoUpcomingClass[] } {
  const paid = store.orders.filter((o) => o.payment_status === "paid")
  const totalRevenue = paid.reduce((s, o) => s + o.total, 0)
  const totalUsers = store.users.length
  const now = Date.now()
  const in14 = 14 * 86400000
  const expiringStudents = store.users.filter((u) => {
    const t = new Date(u.token_expiry).getTime()
    return !Number.isNaN(t) && t > now && t < now + in14
  }).length
  const lowTokenStudents = store.users.filter((u) => u.remaining_tokens < 3).length
  const upcoming: DemoUpcomingClass[] = store.courses
    .filter((c) => new Date(c.start_time).getTime() > now - 3600000)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 20)
    .map((c) => ({
      id: c.id,
      name: c.name,
      instructor: c.instructor,
      start_time: c.start_time,
      enrolled_count: c.enrolled_count,
      capacity: c.capacity,
      location: c.location,
    }))
  return {
    stats: { totalRevenue, totalUsers, expiringStudents, lowTokenStudents },
    upcoming,
  }
}

export default function AdminDashboardPage() {
  const { t, locale } = useLanguage()
  const { store, ready } = useAdminStore()
  const [locFilter, setLocFilter] = useState("all")

  const { stats, upcoming } = useMemo(() => {
    if (!store) {
      return {
        stats: { totalRevenue: 0, totalUsers: 0, expiringStudents: 0, lowTokenStudents: 0 },
        upcoming: [] as DemoUpcomingClass[],
      }
    }
    return deriveFromStore(store)
  }, [store])

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)
  const todayClasses = upcoming.filter((c) => {
    const start = new Date(c.start_time).getTime()
    return start >= todayStart.getTime() && start < todayEnd.getTime()
  })
  const displayToday = todayClasses.length
  const locations = Array.from(new Set(upcoming.map((c) => c.location).filter(Boolean))) as string[]
  const filtered = upcoming.filter((c) => locFilter === "all" || c.location === locFilter)

  if (!ready || !store) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-12 w-12 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold text-classz-700 flex items-center gap-3">
        <LayoutDashboard className="h-8 w-8 md:h-9 md:w-9 text-classz-500" />
        {t("classzAdmin.overview")}
      </h1>

      <div className="bg-white rounded-lg shadow-md border border-classz-200 border-l-4 border-l-classz-400 p-5">
        <h2 className="text-xl font-semibold text-classz-700 mb-4">{t("classzAdmin.todayTodo")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-classz-50 border border-classz-200">
            <div className="flex items-center gap-3">
              <ListChecks className="h-8 w-8 text-classz-500" />
              <div>
                <p className="text-base font-medium text-classz-700">{t("classzAdmin.pendingApps")}</p>
                <p className="text-3xl font-bold text-classz-700">2</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-classz-400 opacity-70" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-classz-50 border border-classz-200">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-classz-500" />
              <div>
                <p className="text-base font-medium text-classz-700">{t("classzAdmin.pendingTrials")}</p>
                <p className="text-3xl font-bold text-classz-700">1</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-classz-400 opacity-70" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-classz-100/60 border border-classz-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-classz-600" />
              <div>
                <p className="text-base font-medium text-classz-700">{t("classzAdmin.expiringTokens")}</p>
                <p className="text-3xl font-bold text-classz-700">{stats.expiringStudents}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-classz-400 opacity-70" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-classz-100/60 border border-classz-200">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-classz-600" />
              <div>
                <p className="text-base font-medium text-classz-700">{t("classzAdmin.todayClasses")}</p>
                <p className="text-3xl font-bold text-classz-700">{displayToday}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-classz-400 opacity-70" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md border border-classz-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium text-classz-600">{t("classzAdmin.totalRevenue")}</h3>
            <DollarSign className="h-5 w-5 text-classz-500" />
          </div>
          <div className="text-3xl font-bold text-classz-700">{formatHKD(stats.totalRevenue)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-classz-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium text-classz-600">{t("classzAdmin.totalUsers")}</h3>
            <UserPlus className="h-5 w-5 text-classz-500" />
          </div>
          <div className="text-3xl font-bold text-classz-700">{stats.totalUsers}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-classz-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium text-classz-600">{t("classzAdmin.expiringSoon")}</h3>
            <AlertCircle className="h-5 w-5 text-classz-500" />
          </div>
          <div className="text-3xl font-bold text-classz-700">{stats.expiringStudents}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-classz-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium text-classz-600">{t("classzAdmin.lowTokens")}</h3>
            <Users className="h-5 w-5 text-classz-500" />
          </div>
          <div className="text-3xl font-bold text-classz-700">{stats.lowTokenStudents}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-classz-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-classz-700">{t("classzAdmin.upcomingList")}</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-classz-500" />
            <select
              value={locFilter}
              onChange={(e) => setLocFilter(e.target.value)}
              className="px-3 py-2 text-base border border-classz-200 rounded-md bg-white text-classz-700 focus:outline-none focus:ring-2 focus:ring-classz-400 min-h-[2.75rem]"
            >
              <option value="all">{t("classzAdmin.allLocations")}</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {locationLabel(loc)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="text-classz-600">{t("classzAdmin.noUpcoming")}</p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((c) => (
              <li key={c.id} className="flex justify-between items-center p-4 bg-classz-50/80 rounded-lg border border-classz-100">
                <div>
                  <div className="font-medium text-classz-800">{c.name}</div>
                  <div className="text-base text-classz-600">
                    {t("classzAdmin.with")} {c.instructor}
                  </div>
                  <div className="text-base text-classz-600">{formatClassTime(c.start_time, locale)}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-medium text-classz-800">
                    {c.enrolled_count} / {c.capacity}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
