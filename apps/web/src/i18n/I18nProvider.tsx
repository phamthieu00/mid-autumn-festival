import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { safeGet, safeSet } from '@/lib/storage'
import { getPath, interpolate } from './interpolate'
import { vi } from './locales/vi'
import { en } from './locales/en'
import type { Lang, LocalizedText, TranslateParams, TranslationKey } from './types'

const DICTS = { vi, en } as const
const STORAGE_KEY = 'lang'

export interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  t: (key: TranslationKey, params?: TranslateParams) => string
  tx: (text: LocalizedText) => string
}

// eslint-disable-next-line react-refresh/only-export-components
export const I18nContext = createContext<I18nContextValue | null>(null)

function readInitialLang(): Lang {
  const stored = safeGet<string | null>(STORAGE_KEY, null)
  return stored === 'en' ? 'en' : 'vi'
}

export function I18nProvider({
  children,
  initialLang,
}: {
  children: ReactNode
  initialLang?: Lang
}) {
  const [lang, setLangState] = useState<Lang>(() => initialLang ?? readInitialLang())

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    safeSet(STORAGE_KEY, next)
  }, [])

  const toggleLang = useCallback(() => setLang(lang === 'vi' ? 'en' : 'vi'), [lang, setLang])

  const t = useCallback(
    (key: TranslationKey, params?: TranslateParams) => {
      const value = getPath(DICTS[lang], key) ?? getPath(vi, key)
      if (value == null) {
        if (import.meta.env.DEV) console.warn(`[i18n] Missing key: ${key}`)
        return key
      }
      return interpolate(value, params)
    },
    [lang],
  )

  const tx = useCallback((text: LocalizedText) => text[lang] ?? text.vi, [lang])

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t, tx }),
    [lang, setLang, toggleLang, t, tx],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
