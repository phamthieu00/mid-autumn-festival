# Đêm Trăng Rằm — Mid-Autumn Festival

Website vui vẻ về Tết Trung Thu: đêm trăng huyền ảo, chuyện Chú Cuội – Hằng Nga – Thỏ Ngọc,
đếm ngược tới rằm tháng Tám, ba mini-game và bức tường đèn ước nguyện. Song ngữ Việt / Anh.

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS v4 · Motion · React Router 7 · Vitest

## Scripts

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # vitest
pnpm lint         # eslint
pnpm build        # tsc + vite build → dist/
pnpm preview
```

## Cấu trúc

```
src/
├─ components/   layout, sky (trăng, sao, lồng đèn), ui
├─ sections/     các section trang chủ
├─ pages/        Home, GamesHub, Wishes, NotFound
├─ features/
│  ├─ games/     shared + catch-lanterns + mooncake-match + quiz
│  ├─ wishes/    lưu localStorage, bức tường đèn
│  └─ scores/    kỷ lục từng game
├─ i18n/         từ điển vi/en typed, provider
├─ hooks/, lib/  tiện ích, ngày Trung Thu, audio
```

## Trò chơi

| Game         | Route          | Cách tính điểm                                           |
| ------------ | -------------- | -------------------------------------------------------- |
| Bắt lồng đèn | `/games/catch` | 60s, +1 / +5 vàng / −3 mây, combo ≥5 nhân đôi            |
| Ghép bánh    | `/games/match` | 8 đôi, ít nước đi hơn là tốt hơn, thời gian là tie-break |
| Đố vui       | `/games/quiz`  | 10 câu, 3 bậc danh hiệu                                  |

## Ngày Trung Thu

Bảng ngày dương lịch của rằm tháng Tám (2025–2030) nằm trong `src/lib/midAutumnDates.ts`.
Mốc đếm ngược là 00:00 giờ Việt Nam. Cập nhật bảng khi gần hết năm 2030.

## Nhạc nền

Đặt file `public/audio/bgm.mp3` (CC0) để bật nút nhạc. SFX được tổng hợp bằng Web Audio API.

## Deploy

Vercel: repo đã có `vercel.json` rewrite cho SPA. Netlify: thêm `_redirects` với `/* /index.html 200`.
