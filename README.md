# Đêm Trăng Rằm — Mid-Autumn Festival

Website vui vẻ về Tết Trung Thu: đêm trăng huyền ảo, chuyện Chú Cuội – Hằng Nga – Thỏ Ngọc,
đếm ngược tới rằm tháng Tám, bảy mini-game, đố vui từ ngân hàng 1000+ câu hỏi, nhạc nền
generative và bức tường đèn ước nguyện với hiệu ứng thả đèn 3D. Song ngữ Việt / Anh.

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS v4 · Motion · React Router 7 · Three.js · Vitest

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
│  ├─ games/     shared + 7 game (catch, runner, rhythm, match, puzzle, quiz, word)
│  │  └─ quiz/bank/  250 câu viết tay + generator sinh ~750 câu
│  ├─ wishes/    lưu localStorage, bức tường đèn, hiệu ứng thả đèn Three.js (lazy)
│  └─ scores/    kỷ lục từng game
├─ i18n/         từ điển vi/en typed, provider
├─ hooks/, lib/  tiện ích, ngày Trung Thu, audio (SFX synth + AmbientEngine nhạc generative)
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

Nhạc nền là **generative ambient** chạy hoàn toàn bằng Web Audio (`src/lib/audio/ambientEngine.ts`):
thang ngũ cung D, pad mềm, tiếng gảy kiểu đàn tranh, chuông, reverb convolver. Không cần file.
Nếu đặt `public/audio/bgm.mp3` (CC0), nút nhạc sẽ ưu tiên phát file đó. SFX cũng được tổng hợp.

## Thả đèn ước 3D

Khi gửi điều ước, một lồng đèn Three.js (chunk lazy ~137 KB gzip, chỉ tải khi vào form) bay từ nút
gửi lên trời trong 4 giây kèm tàn lửa, rồi đáp xuống wall với hiệu ứng highlight. Không có WebGL
hoặc bật `prefers-reduced-motion` thì dùng fallback CSS/Motion.

## Deploy

Vercel: repo đã có `vercel.json` rewrite cho SPA. Netlify: thêm `_redirects` với `/* /index.html 200`.
