"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import en from "@/locales/en.json"
import zhTW from "@/locales/zh-TW.json"

type Locale = "en" | "zh-TW"

type Translations = Record<Locale, any>

const translations: Translations = {
    en,
    "zh-TW": zhTW,
}

interface LanguageContextValue {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("en")

    // Load preference from localStorage on mount
    useEffect(() => {
        const stored = typeof window !== "undefined" ? (localStorage.getItem("locale") as Locale | null) : null
        if (stored === "en" || stored === "zh-TW") {
            setLocaleState(stored)
        }
    }, [])

    const setLocale = (value: Locale) => {
        setLocaleState(value)
        if (typeof window !== "undefined") {
            localStorage.setItem("locale", value)
        }
    }

    const getValue = (loc: Locale, key: string) => {
        const parts = key.split(".")
        let node: any = translations[loc]
        for (const p of parts) {
            if (node && typeof node === "object" && p in node) {
                node = node[p]
            } else {
                return undefined
            }
        }
        return typeof node === "string" ? node : undefined
    }

    const value = useMemo<LanguageContextValue>(
        () => ({
            locale,
            setLocale,
            t: (key: string) => getValue(locale, key) ?? getValue("en", key) ?? key,
        }),
        [locale],
    )

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
    const ctx = useContext(LanguageContext)
    if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
    return ctx
}

