"use client"

import { useCallback, useEffect, useState } from "react"
import { loadAdminStore, saveAdminStore, type ClasszAdminStore } from "@/lib/classz-admin-store"

export function useAdminStore() {
  const [store, setStore] = useState<ClasszAdminStore | null>(null)

  useEffect(() => {
    setStore(loadAdminStore())
  }, [])

  const patch = useCallback((fn: (s: ClasszAdminStore) => ClasszAdminStore) => {
    setStore((prev) => {
      const base = prev ?? loadAdminStore()
      const next = fn(base)
      saveAdminStore(next)
      return next
    })
  }, [])

  return { store, patch, ready: store !== null }
}
