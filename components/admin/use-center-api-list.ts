"use client"

import { useCallback, useEffect, useState } from "react"
import { getClasszSession } from "@/lib/classz-auth"
import { apiGet } from "@/lib/classz-api-client"
import { isDemoSession } from "@/components/admin/use-admin-api"

export function useCenterApiList<T>(
  path: string,
  mapRow: (row: Record<string, unknown>) => T,
  demoData: T[] = []
) {
  const [rows, setRows] = useState<T[]>(demoData)
  const [ready, setReady] = useState(isDemoSession())
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (isDemoSession()) {
      setRows(demoData)
      setReady(true)
      return
    }
    try {
      const data = await apiGet<Record<string, unknown>[]>(path)
      setRows((data || []).map(mapRow))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
      setRows([])
    } finally {
      setReady(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])

  useEffect(() => {
    reload()
  }, [reload, getClasszSession()?.token])

  return { rows, setRows, ready, error, reload }
}
