import { z } from 'zod'
import { LANTERN_COLOR_IDS, WISH_NAME_MAX, WISH_TEXT_MAX } from './wishes'

const ZERO_WIDTH = /[\u200B-\u200F\u2060\uFEFF]/g

export const normalizeText = (s: string) =>
  s.normalize('NFC').replace(ZERO_WIDTH, '').replace(/\s+/g, ' ').trim()

export const normalizeNickname = (s: string) => normalizeText(s)

export const NICKNAME_MIN = 3
export const NICKNAME_MAX = 20
const NICKNAME_RE = /^[\p{L}\p{N} _.-]+$/u

export const NicknameSchema = z
  .string()
  .transform(normalizeNickname)
  .pipe(
    z
      .string()
      .min(NICKNAME_MIN)
      .refine((s) => [...s].length <= NICKNAME_MAX, { message: `max ${NICKNAME_MAX} characters` })
      .regex(NICKNAME_RE, { message: 'letters, numbers, space, _ . - only' }),
  )

/** Compared after lower-casing and stripping separators. */
export const RESERVED_NICKNAMES = new Set([
  'admin',
  'administrator',
  'mod',
  'moderator',
  'system',
  'official',
  'support',
  'root',
  'hangnga',
  'chucuoi',
  'thongoc',
  'demtrangram',
  'midautumn',
  'anonymous',
  'andanh',
  'aido',
])

export const LanternColorSchema = z.enum(LANTERN_COLOR_IDS)

export const WishInputSchema = z.object({
  text: z
    .string()
    .transform(normalizeText)
    .pipe(
      z
        .string()
        .min(1)
        .refine((s) => [...s].length <= WISH_TEXT_MAX, { message: `max ${WISH_TEXT_MAX}` }),
    ),
  name: z.string().transform(normalizeText).pipe(z.string().max(WISH_NAME_MAX)).optional(),
  color: LanternColorSchema,
  lang: z.enum(['vi', 'en']).default('vi'),
})
export type WishInput = z.infer<typeof WishInputSchema>
