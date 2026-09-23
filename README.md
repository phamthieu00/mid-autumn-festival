# Đêm Trăng Rằm — Mid-Autumn Festival

Website vui vẻ về Tết Trung Thu: đêm trăng huyền ảo, chuyện Chú Cuội – Hằng Nga – Thỏ Ngọc,
đếm ngược tới rằm tháng Tám, bảy mini-game có bảng xếp hạng chung, thử thách mỗi ngày, đăng nhập
Google, hồ sơ + huy hiệu, thẻ chia sẻ kết quả với ảnh OG động và bức tường đèn ước công khai
cập nhật realtime. Song ngữ Việt / Anh.

**Demo:** https://mid-autumn-festival-murex.vercel.app

## Kiến trúc

```
Browser ──same-origin──▶ Vercel (apps/web, static SPA)
                           ├─ /api/*  ──rewrite──▶ API (Hono + Node)   ← chưa bật, xem "Deploy"
                           └─ /r/*    ──rewrite──▶ API: HTML OG cho crawler → redirect /results/:id
API ──▶ Postgres (source of truth)   API ──▶ Redis (ZSET ranking, rate limit, pub/sub SSE, cache)
```

- **Postgres là sự thật**, Redis ZSET chỉ là lớp xếp hạng có thể rebuild (`lb:v1:{game}:{period}`),
  có fallback SQL khi Redis lỗi. Redis còn dùng cho rate limit (Lua `INCR+PEXPIRE`), pub/sub cho
  SSE tường ước, cache profile và cache ảnh OG.
- **Anti-cheat**: server phát game session (seed + hạn 30 phút); quiz chấm trên server từng câu;
  rhythm / puzzle / word được **replay** từ seed; catch / runner / match kiểm tra ngưỡng hợp lý;
  mỗi session chỉ finish một lần. Vi phạm rõ → `422 REJECTED`, vùng mờ → chấp nhận kèm `flags`.
- **Login** chỉ Google OAuth qua better-auth, cookie first-party (`maf.session_token`). Chơi không
  cần đăng nhập; bảng xếp hạng công khai và thử thách ngày thì cần.

## Monorepo

```
apps/web          @maf/web    Vite 8 · React 19 · Tailwind v4 · Motion · React Router 7 · Three.js · react-query
apps/api          @maf/api    Hono 4 · Drizzle ORM · postgres.js · ioredis · better-auth · satori + resvg · pino
packages/shared   @maf/shared engine thuần của 7 game, ngân hàng quiz, luật anti-cheat, Zod schema, huy hiệu, wordlist
```

`@maf/shared` export thẳng TypeScript source (`exports: ./* → ./src/*.ts`) nên web, tsx và tsup dùng
trực tiếp, không cần build.

## Chạy local

```bash
pnpm install
docker compose up -d                 # postgres:16 (db maf + maf_test) và redis:7 qua OrbStack/Docker
cp apps/api/.env.example apps/api/.env
# điền BETTER_AUTH_SECRET, DAILY_SEED_SECRET (openssl rand -base64 48), GOOGLE_CLIENT_ID/SECRET, ADMIN_EMAILS
pnpm --filter @maf/api db:migrate    # áp dụng migration trong apps/api/drizzle
pnpm --filter @maf/api db:seed       # (tuỳ chọn) 12 người chơi giả + vài điều ước
pnpm dev                             # web http://localhost:5173 (proxy /api và /r → :3000), api :3000
```

Kiểm tra: `pnpm -r typecheck && pnpm lint && pnpm -r test && pnpm -r build`.
Test API chạy với Postgres/Redis thật (db `maf_test`, Redis db 1); CI dùng services tương tự.

### Biến môi trường (apps/api)

| Biến                                     | Ý nghĩa                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `PUBLIC_ORIGIN`                          | origin của web (cookie, CSRF, better-auth `baseURL`), ví dụ `https://…vercel.app` |
| `DATABASE_URL`, `REDIS_URL`              | kết nối Postgres / Redis (`.railway.internal` cần IPv6, ioredis đã bật `family=0`) |
| `BETTER_AUTH_SECRET`                     | ≥ 32 ký tự, ký cookie phiên                                                     |
| `DAILY_SEED_SECRET`                      | ≥ 32 ký tự, HMAC sinh seed thử thách ngày                                       |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth client (redirect `${PUBLIC_ORIGIN}/api/auth/callback/google`)          |
| `ADMIN_EMAILS`                           | danh sách email (phẩy) được vào `/admin/wishes` và các route `/api/admin/*`     |
| `SESSION_TTL_MINUTES`                    | hạn game session, mặc định 30                                                   |
| `METRICS_TOKEN`                          | bật `GET /api/metrics` (Prometheus text, `Authorization: Bearer …`); bỏ trống = 404 |
| `LOG_LEVEL`, `PORT`                      | pino level, cổng (Railway tự đặt `PORT`)                                        |

## API chính

| Route                                            | Ghi chú                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| `GET /api/health`                                | `{ok, db, redis, degraded}`; 503 chỉ khi Postgres down            |
| `GET/POST /api/auth/*`                           | better-auth (Google)                                             |
| `GET /api/me` · `PATCH /api/me`                  | player, huy hiệu; đổi nickname / màu đèn (409 khi trùng)          |
| `GET /api/me/export` · `DELETE /api/me`          | xuất JSON toàn bộ dữ liệu; xoá tài khoản (điểm rời BXH, điều ước → ẩn danh) |
| `POST /api/games/:gameId/sessions`               | `{mode: free\|daily}` → seed, hạn, câu hỏi quiz (không có đáp án) |
| `POST /api/sessions/:id/answer` · `/finish`      | chấm quiz từng câu; kết thúc và kiểm tra theo luật từng game       |
| `GET /api/leaderboards/:gameId?period=&limit=`   | `daily \| weekly \| alltime`, top 100, kèm hạng của tôi           |
| `GET /api/leaderboards/summary`                  | người dẫn đầu mỗi game (crown ở hub)                              |
| `GET /api/daily`                                 | thử thách hôm nay, trạng thái đã chơi, `resetsAt`                 |
| `GET /api/players/:id`                           | hồ sơ công khai                                                   |
| `GET/POST /api/wishes` · `POST /api/wishes/:id/report` · `GET /api/wishes/stream` | tường ước, báo cáo (3 lượt → chờ duyệt), SSE realtime |
| `GET/PATCH /api/admin/wishes`                    | duyệt / ẩn điều ước                                               |
| `GET /api/results/:publicId` · `GET /api/og/results/:publicId.png` · `GET /r/:publicId` | thẻ chia sẻ + ảnh OG 1200×630 |

Rate limit mặc định: tạo session 20/phút/người (60/IP), điều ước 5/giờ (20/IP), báo cáo 10/giờ,
export 5/giờ; SSE tối đa 5 kết nối/IP. Redis lỗi → limiter in-memory cùng ngưỡng.

## Deploy

- **Web**: Vercel build từ root `vercel.json` (`pnpm --filter @maf/web build`, output `apps/web/dist`),
  auto-deploy khi push `main`. Khi API đã có domain, thêm rewrite `/api/(.*)` và `/r/(.*)` **trước**
  fallback SPA để cookie là first-party.
- **API**: `apps/api/Dockerfile` (node 24 slim, `pnpm deploy --prod`) + `railway.json`
  (healthcheck `/api/health`, pre-deploy `node dist/migrate.js`). Railway cần plan Hobby; thay thế
  được bằng Render / Fly + Postgres/Redis bất kỳ vì API không phụ thuộc nền tảng.
- Google Cloud: OAuth client với redirect `https://<web>/api/auth/callback/google` và
  `http://localhost:5173/api/auth/callback/google`; trang `/privacy` làm Privacy Policy URL.

## Runbook

| Việc                          | Cách làm                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| Rebuild bảng xếp hạng Redis   | key thiếu được rebuild lazy từ `personal_bests`; rebuild toàn bộ: `rebuildAllLeaderboards()` trong `services/leaderboards.ts` (tsx REPL) |
| Xoay secret cookie            | đổi `BETTER_AUTH_SECRET` → mọi người phải đăng nhập lại; `DAILY_SEED_SECRET` chỉ đổi sau 0h VN |
| Ban người chơi                | `update players set banned_at = now() where user_id = …` rồi xoá `personal_bests` + `ZREM` |
| Duyệt điều ước                | `/admin/wishes` (tài khoản trong `ADMIN_EMAILS`) hoặc `PATCH /api/admin/wishes/:id`       |
| Job nền                       | trong process, lock Redis `SET NX`: expire session quá hạn (5 phút), purge session ẩn danh > 30 ngày (1 giờ) |
| Metrics                       | `curl -H "Authorization: Bearer $METRICS_TOKEN" https://<api>/api/metrics`               |
| Migration                     | `pnpm --filter @maf/api db:generate` sau khi sửa `src/db/schema`, commit thư mục `drizzle/` |

## Trò chơi và luật kiểm tra

| Game              | Route            | Điểm                                        | Server kiểm tra                                   |
| ----------------- | ---------------- | ------------------------------------------- | ------------------------------------------------- |
| Bắt lồng đèn      | `/games/catch`   | 60s, +1 / +5 vàng / −3 mây, combo ≥5 x2     | elapsed ≥ 58s, spawn tối đa, `score ≤ 2×(đèn+5×vàng)` |
| Rước đèn (runner) | `/games/runner`  | mét + bánh + 3×sao                          | `metres ≤ 62×elapsed`, pickup theo quãng đường     |
| Nhịp trống lân    | `/games/rhythm`  | điểm theo perfect/good và combo             | replay chart từ seed → điểm chính xác              |
| Ghép bánh         | `/games/match`   | ít nước đi hơn tốt hơn, thời gian tie-break | `moves ≥ 8`, thời gian tối thiểu theo nước đi      |
| Ghép hình trăng   | `/games/puzzle`  | 3×3 ít nước đi hơn tốt hơn (4×4 chỉ vui)    | replay chuỗi nước đi từ seed phải giải xong        |
| Đố vui            | `/games/quiz`    | 10 câu từ ngân hàng 1000+, 3 bậc danh hiệu  | chấm trên server từng câu, elapsed ≥ 10s           |
| Đoán từ           | `/games/word`    | 5 từ, điểm theo số lần đoán sai             | replay `guessed` trên từ sinh từ seed              |

## Ngày Trung Thu, nhạc nền, thả đèn 3D

- Bảng ngày rằm tháng Tám (2025–2030) nằm ở `packages/shared/src/midAutumnDates.ts`; đếm ngược mốc 00:00 giờ Việt Nam.
- Nhạc nền **generative ambient** bằng Web Audio (`apps/web/src/lib/audio/ambientEngine.ts`), SFX tổng hợp; đặt `public/audio/bgm.mp3` (CC0) nếu muốn phát file.
- Gửi điều ước → lồng đèn Three.js (chunk lazy) bay lên trời rồi đáp xuống tường; không WebGL hoặc `prefers-reduced-motion` thì fallback CSS.
