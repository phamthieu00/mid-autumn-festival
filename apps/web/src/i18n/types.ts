import type { vi } from './locales/vi'

import type { Lang, LocalizedText } from '@maf/shared/i18n'
export type { Lang, LocalizedText }

export type Dictionary = typeof vi

type Prev = [never, 0, 1, 2, 3, 4, 5]

/** Dot-path of all string leaves in a nested object, depth-limited. */
export type Leaves<T, D extends number = 6> = [D] extends [never]
  ? never
  : T extends string
    ? ''
    : {
        [K in keyof T & string]: T[K] extends string
          ? K
          : T[K] extends object
            ? `${K}.${Leaves<T[K], Prev[D]>}`
            : never
      }[keyof T & string]

export type TranslationKey = Leaves<Dictionary>
export type TranslateParams = Record<string, string | number>
