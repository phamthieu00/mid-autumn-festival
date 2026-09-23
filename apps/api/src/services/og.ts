import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import type { GameId } from '@maf/shared/games/ids'
import { GAME_EMOJI, GAME_TITLES, GAME_UNITS } from '@maf/shared/games/labels'
import type { Lang } from '@maf/shared/i18n'
import { LANTERN_COLOR_IDS } from '@maf/shared/wishes'
import { env } from '../env'
import { safeRedis } from '../redis'

const require = createRequire(import.meta.url)

type FontEntry = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }
let fontsPromise: Promise<FontEntry[]> | null = null

async function loadFonts(): Promise<FontEntry[]> {
  const load = async (
    pkg: string,
    file: string,
    name: string,
    weight: 400 | 700,
  ): Promise<FontEntry> => {
    const path = require.resolve(`${pkg}/files/${file}`)
    const buf = await readFile(path)
    return {
      name,
      data: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      weight,
      style: 'normal',
    }
  }
  return Promise.all([
    load(
      '@fontsource/be-vietnam-pro',
      'be-vietnam-pro-vietnamese-700-normal.woff',
      'Be Vietnam Pro',
      700,
    ),
    load(
      '@fontsource/be-vietnam-pro',
      'be-vietnam-pro-latin-700-normal.woff',
      'Be Vietnam Pro',
      700,
    ),
    load(
      '@fontsource/be-vietnam-pro',
      'be-vietnam-pro-vietnamese-400-normal.woff',
      'Be Vietnam Pro',
      400,
    ),
    load(
      '@fontsource/be-vietnam-pro',
      'be-vietnam-pro-latin-400-normal.woff',
      'Be Vietnam Pro',
      400,
    ),
  ])
}

const LANTERN: Record<(typeof LANTERN_COLOR_IDS)[number], { body: string; glow: string }> = {
  red: { body: '#e63946', glow: 'rgba(230,57,70,0.55)' },
  gold: { body: '#f4c15d', glow: 'rgba(244,193,93,0.55)' },
  orange: { body: '#ff6b35', glow: 'rgba(255,107,53,0.55)' },
  pink: { body: '#ff8fb1', glow: 'rgba(255,143,177,0.55)' },
}

export interface ResultCard {
  publicId: string
  gameId: GameId
  value: number
  secondary: number | null
  nickname: string | null
  color: string
  rank: number | null
  dailyKey: string | null
  lang: Lang
}

type El = { type: string; props: Record<string, unknown> }
const h = (type: string, props: Record<string, unknown>, ...children: unknown[]): El => ({
  type,
  props: {
    ...props,
    children: children.length === 0 ? undefined : children.length === 1 ? children[0] : children,
  },
})

function template(card: ResultCard): El {
  const t = (lt: { vi: string; en: string }) => lt[card.lang]
  const color = LANTERN[(card.color as keyof typeof LANTERN) ?? 'red'] ?? LANTERN.red
  const name =
    card.nickname ?? (card.lang === 'vi' ? 'Một người chơi ẩn danh' : 'An anonymous player')
  const rankLine =
    card.rank != null
      ? card.lang === 'vi'
        ? `Hạng #${card.rank} toàn thời gian`
        : `Ranked #${card.rank} all-time`
      : card.dailyKey
        ? card.lang === 'vi'
          ? `Thử thách ngày ${card.dailyKey}`
          : `Daily challenge ${card.dailyKey}`
        : ''
  const secondary =
    card.secondary != null && card.secondary > 0
      ? ` · ${Math.floor(card.secondary / 60)}:${String(card.secondary % 60).padStart(2, '0')}`
      : ''
  return h(
    'div',
    {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 72px',
        background: 'linear-gradient(160deg, #1f2a5c 0%, #0b1026 55%, #070a1a 100%)',
        color: '#fdf6e3',
        fontFamily: 'Be Vietnam Pro',
        position: 'relative',
      },
    },
    // moon
    h('div', {
      style: {
        position: 'absolute',
        right: '90px',
        top: '70px',
        width: '220px',
        height: '220px',
        borderRadius: '9999px',
        background: '#ffe9a8',
        boxShadow: '0 0 80px 30px rgba(255,209,102,0.45)',
      },
    }),
    // lantern
    h(
      'div',
      {
        style: {
          position: 'absolute',
          right: '150px',
          bottom: '70px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
      },
      h('div', {
        style: { width: '40px', height: '12px', background: '#b8860b', borderRadius: '3px' },
      }),
      h('div', {
        style: {
          width: '110px',
          height: '130px',
          borderRadius: '9999px',
          background: color.body,
          boxShadow: `0 0 50px 14px ${color.glow}`,
        },
      }),
      h('div', {
        style: { width: '40px', height: '12px', background: '#b8860b', borderRadius: '3px' },
      }),
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column' } },
      h(
        'div',
        { style: { fontSize: '26px', letterSpacing: '6px', color: '#ff8c42', fontWeight: 700 } },
        card.lang === 'vi' ? 'ĐÊM TRĂNG RẰM · TẾT TRUNG THU' : 'MOONLIT NIGHT · MID-AUTUMN',
      ),
      h(
        'div',
        { style: { marginTop: '18px', fontSize: '54px', fontWeight: 700, color: '#ffd166' } },
        `${GAME_EMOJI[card.gameId]}  ${t(GAME_TITLES[card.gameId])}`,
      ),
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column' } },
      h('div', { style: { fontSize: '30px', color: 'rgba(253,246,227,0.75)' } }, name),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'flex-end', marginTop: '6px' } },
        h(
          'div',
          { style: { fontSize: '128px', fontWeight: 700, color: '#ffd166', lineHeight: '1' } },
          String(card.value),
        ),
        h(
          'div',
          {
            style: {
              fontSize: '40px',
              marginLeft: '18px',
              marginBottom: '16px',
              color: 'rgba(253,246,227,0.8)',
            },
          },
          `${t(GAME_UNITS[card.gameId])}${secondary}`,
        ),
      ),
      h(
        'div',
        { style: { marginTop: '14px', fontSize: '30px', color: '#7ed6a5', fontWeight: 700 } },
        rankLine,
      ),
      h(
        'div',
        { style: { marginTop: '28px', fontSize: '24px', color: 'rgba(253,246,227,0.55)' } },
        env.PUBLIC_ORIGIN.replace(/^https?:\/\//, ''),
      ),
    ),
  )
}

const memoryCache = new Map<string, Buffer>()
const OG_TTL = 7 * 86_400

export async function renderResultPng(card: ResultCard): Promise<Buffer> {
  const key = `og:v1:${card.publicId}:${card.lang}:${card.rank ?? 'x'}`
  const cached = memoryCache.get(key) ?? (await safeRedis((r) => r.getBuffer(key), null))
  if (cached) return cached
  fontsPromise ??= loadFonts()
  const svg = await satori(template(card) as never, {
    width: 1200,
    height: 630,
    fonts: await fontsPromise,
  })
  const png = Buffer.from(
    new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng(),
  )
  if (memoryCache.size > 200) memoryCache.delete(memoryCache.keys().next().value!)
  memoryCache.set(key, png)
  await safeRedis((r) => r.set(key, png, 'EX', OG_TTL), null)
  return png
}
