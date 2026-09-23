import { Hono } from 'hono'
import { GAME_TITLES, GAME_UNITS } from '@maf/shared/games/labels'
import { env } from '../env'
import { loadResult } from '../services/results'

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!,
  )

/** Crawler-friendly share page: OG tags for bots, instant redirect into the SPA for humans. */
export const shareRoutes = new Hono().get('/r/:publicId', async (c) => {
  const publicId = c.req.param('publicId')
  const lang = c.req.query('lang') === 'en' ? 'en' : 'vi'
  const r = await loadResult(publicId)
  const name = r.player?.nickname ?? (lang === 'vi' ? 'Một người chơi' : 'A player')
  const title = `${name} · ${r.value} ${GAME_UNITS[r.gameId][lang]} · ${GAME_TITLES[r.gameId][lang]}`
  const desc =
    lang === 'vi'
      ? `Chơi ${GAME_TITLES[r.gameId].vi} trên Đêm Trăng Rằm và thử vượt kỷ lục này!`
      : `Play ${GAME_TITLES[r.gameId].en} on Moonlit Night and try to beat this score!`
  const target = `${env.PUBLIC_ORIGIN}/results/${encodeURIComponent(publicId)}`
  const image = `${env.PUBLIC_ORIGIN}/api/og/results/${encodeURIComponent(publicId)}.png?lang=${lang}`
  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(`${env.PUBLIC_ORIGIN}/r/${publicId}`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:image" content="${esc(image)}">
<meta http-equiv="refresh" content="0;url=${esc(target)}">
<link rel="canonical" href="${esc(target)}">
<style>body{background:#0b1026;color:#fdf6e3;font-family:system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0}a{color:#ffd166}</style>
</head>
<body>
<p><a href="${esc(target)}">${esc(title)}</a></p>
<script>location.replace(${JSON.stringify(target)})</script>
</body>
</html>`
  c.header('Cache-Control', 'public, max-age=300')
  return c.html(html)
})
