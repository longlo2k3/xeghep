# CLEANUP_REPORT — Audit dọn dẹp codebase (Phase 1)

- **Repo:** longlo2k3/xeghep · **Branch làm việc:** `main` (@ `0538c0e`)
- **Backup:** `backup/pre-cleanup-20261016` (đã push, gồm cả 4 commit local chưa push)
- **Ngày audit:** 2026-10-16
- **Stack:** Next.js 15.4 (App Router) · React 19 · Payload CMS 3.90 (Postgres) · Tailwind · Vitest
- **Nguyên tắc:** chỉ đánh dấu SAFE khi đã grep toàn repo + kiểm tra dynamic/barrel/config. Tool (knip/depcheck/madge) chỉ là gợi ý.

> ⚠️ **Baseline test đang FAIL sẵn:** `backend-tests/anonymizePii.test.ts` fail vì `.env`/`.env.local` đặt `ANONYMIZE_MONTHS=` (rỗng) → `src/seed/anonymizePii.ts:22` parse ra `NaN` → `process.exit(1)` ở top-level. Lỗi env, không liên quan dọn dẹp. (User đã đồng ý coi là pre-existing.)

---

## 0. Baseline metrics (TRƯỚC khi dọn)

| Metric | Giá trị |
| --- | --- |
| `src` | 1.58 MB · 233 files |
| `public` | 12.32 MB · 28 files |
| `media` | 12.65 MB (uploads runtime) |
| `.next` (build output) | 712 MB |
| `node_modules` | 823 MB |
| Dependencies / devDependencies | 16 / 16 |
| Build time | ~355s (pass) |
| Lint | 0 errors, 117 warnings |
| Typecheck | pass |
| Test | 469 passed / 1 file failed (env, pre-existing) |

---

## 1. Bảng kết quả audit

### 1.1. Backend API / route

| # | Đường dẫn | Loại | Lý do | Bằng chứng | Mức độ | Dung lượng |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `src/app/api/v1/pricing/airport/route.ts` | API route | Không còn client nội bộ nào gọi. Getter `getAirportPricing()` (thứ duy nhất gọi endpoint) là dead code. | knip (unused export `getAirportPricing` api.ts:730) + `grep getAirportPricing` chỉ thấy định nghĩa; gọi endpoint chỉ ở api.ts:734 (trong dead getter). MIGRATION.md §"dead getters" | **REVIEW** | nhỏ |
| 2 | `src/app/api/v1/pricing/distance/route.ts` | API route | Tương tự #1 (`getDistanceRates()` dead). | knip + grep; MIGRATION.md | **REVIEW** | nhỏ |
| 3 | `src/app/api/v1/settings/pricing/route.ts` | API route | Tương tự #1 (`getPricingSettings()` dead). | knip + grep; MIGRATION.md | **REVIEW** | nhỏ |
| 4 | `src/app/api/v1/pages/[slug]/route.ts` | API route | Getter `getPage()` dead → không consumer nội bộ (frontend không dùng getPage). | knip (unused `getPage` api.ts:875) + grep chỉ thấy định nghĩa | **REVIEW** | nhỏ |

> Lý do xếp REVIEW (không SAFE): đây là API public theo contract (§4 trong MIGRATION.md), có thể có client bên ngoài (mobile/third-party) gọi. Cần user xác nhận trước khi xóa.

### 1.2. Backend file test/dev

| # | Đường dẫn | Loại | Lý do | Bằng chứng | Mức độ | Dung lượng |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `.tmp-route-pricing-browser.mjs` | File tạm debug | Script thử nghiệm route-pricing, import `pg` trực tiếp; không thuộc build/app. | knip "Unused files"; `git ls-files` tracked; không được import ở đâu | **SAFE** | 1.3 KB |
| 2 | `.tmp-route-pricing-browser.html` | File tạm debug | Trang HTML tạm của script trên. | tracked trong git, không tham chiếu | **SAFE** | 8.4 KB |
| 3 | `docs/examples/ninh-binh-pricing.css` | Docs example | File CSS ví dụ trong docs, không được import/đọc bởi code hay config. | knip "Unused files" | **SAFE** | 2.9 KB |
| 4 | `src/seed/seed.ts` (`console.log` ×2) | Debug log | Log debug trong seed script (không phải app runtime). | grep `console.log` | **REVIEW** | nhỏ |
| 5 | `src/admin/hooks/useBookingPolling.ts:132` (`console.debug`) | Debug log | Log debug (đã bọc trong nhánh lỗi silent). | grep | **KEEP** (log hợp lệ cho debug) | — |
| 6 | `src/seed/*` (13 file), `src/scripts/*` (2 file) | Seed/ops script | Script vận hành (seed/schema/generate types) — KHÔNG thuộc production bundle (không được app import). | `package.json` scripts tham chiếu; không import trong `src/app` | **KEEP** | ~120 KB |
| 7 | `tests/**`, `backend-tests/**` | Test | Test suite; không vào build. | vitest.workspace | **KEEP** | 130 KB |

### 1.3. Frontend — file/component không dùng

| # | Đường dẫn | Loại | Lý do | Bằng chứng | Mức độ | Dung lượng |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `src/admin/features/dashboard/DashboardPlaceholder.tsx` | Component | Không được import ở đâu; chỉ bị re-export bởi `dashboard/index.ts`. App dùng `DashboardOverview`. | knip "Unused files"/"Unused exports"; grep `DashboardPlaceholder` chỉ thấy định nghĩa + re-export | **SAFE** | 8.3 KB |
| 2 | `src/admin/components/ui/Dialog.tsx` | Component (re-export) | Chỉ re-export `Modal as Dialog`; không ai import `Dialog`. | knip "Unused files"; grep `Dialog` chỉ thấy `ConfirmDialog`/`Modal` và chính file này | **SAFE** | 110 B |
| 3 | `src/admin/components/common/index.ts` | Barrel | Barrel không được import (code import trực tiếp từng file). | knip "Unused files"; madge orphans; grep không có import `@/admin/components/common'` | **SAFE** | 246 B |
| 4 | `src/admin/components/ui/index.ts` | Barrel | Không được import. | knip + grep | **SAFE** | 205 B |
| 5 | `src/admin/features/seo/index.ts` | Barrel | Không được import (`SitemapMonitor` import trực tiếp). | knip + grep | **SAFE** | 78 B |
| 6 | `src/admin/types/index.ts` | Barrel | Không được import (các type import trực tiếp từng file). | knip + grep | **SAFE** | 259 B |

> Ghi chú: `WhyChooseUs` (home) và `AboutWhyChooseUs` đều **được dùng** (home page / gioi-thieu page) → KEEP. `TopBanner` dùng trong `Header` → KEEP. `useBookingPolling`, `lib/sound.ts` đều được dùng → KEEP.

### 1.4. Code thừa (dead code / unused exports)

| # | Đường dẫn | Loại | Lý do | Bằng chứng | Mức độ | Dung lượng |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `src/components/home/WhyChooseUs.tsx` (dòng 1–296) | Code comment-out | 262 dòng comment-out bản cũ (chiếm ~1/2 file, 528 dòng gốc). | đếm `^\s*//`: 262 dòng | **SAFE** | ~14 KB |
| 2 | `src/lib/api.ts` — `getCompanyInfo` (665), `getAirportPricing` (730), `getDistanceRates` (740), `getPricingSettings` (750), `getPage` (875), `postBooking` (949), `getRedirects` (976) | Hàm dead | Không được import/gọi ngoài file. Bản `postBooking`/`getRedirects`/`isApiError` dùng ở `lib/api/client.ts` & `lib/api/redirects.ts` là bản khác. | knip 104 unused exports + grep (chỉ thấy định nghĩa); MIGRATION.md "dead getters" | **SAFE** | ~8 KB |
| 3 | `src/data/company-info.ts:95` — `FIVE_COMMITMENTS` | Const dead | Chỉ định nghĩa, không ai dùng (`SIX_COMMITMENTS` mới là bản dùng). | grep `FIVE_COMMITMENTS`: chỉ dòng định nghĩa | **SAFE** | ~40 B |
| 4 | 47 `export default` trùng với named export | Export thừa | Mọi file đều export cả named + default; chỉ named được import. | knip "Duplicate exports" (47) | **SAFE** (ưu tiên thấp) | ~2 KB |
| 5 | 54 unused exported types | Type dead | Type-only, không ảnh hưởng runtime/bundle. | knip "Unused exported types" | **SAFE** (ưu tiên thấp) | ~3 KB |
| 6 | Unused exports nội bộ: `normalizePhone`/`toVietnamIso` (booking.ts), `buildRoutesQuery`/`FALLBACK_COMPANY_SETTINGS` (api.ts), `DEFAULT_OG_IMAGE` (seo.ts), `normalizePath` (redirects.ts), `toRouteItem`/`toRouteDetail`/`fallbackRouteDetail`/`formatCompanySettings`/`toArticle` (api/server.ts), `formatNumber` (utils.ts)… | Export thừa | Được dùng nội bộ cùng file nhưng export thừa ra ngoài. | knip "Unused exports" | **REVIEW** (chỉ nên bỏ từ khóa `export`, không xóa hàm — zero rủi ro nhưng zero lợi ích bundle) | ~0 |
| 7 | `src/lib/utils.ts` (khác `src/admin/lib/utils.ts`) | Module chỉ test dùng | Chỉ `tests/seo.test.ts` import; không production code. | grep `src/lib/utils`: chỉ test | **REVIEW** | 2 KB |
| 8 | `src/lib/api/idempotency.ts` — `IDEMPOTENCY_TTL_MS`, `lib/api/envelope.ts` — `CORS_HEADERS`/`defaultErrorMessage`, `lib/api/serialize.ts` — `STATUS_LABELS`/`PAYMENT_METHOD_LABELS`/`serverBase`/`mediaUrl` | Const/fn dead | knip đánh dấu unused; nhiều khả năng chỉ dùng nội bộ/test. | knip "Unused exports" | **REVIEW** | nhỏ |

### 1.5. Assets

| # | Đường dẫn | Loại | Lý do | Bằng chứng | Mức độ | Dung lượng |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `public/banner.png` | Ảnh | Không được tham chiếu; app dùng `banner.webp`. | quét toàn repo: không có chuỗi `banner.png` | **SAFE** | 5.58 MB |
| 2 | `public/banner2.avif` | Ảnh | Không tham chiếu (kể cả app lẫn seed). | quét toàn repo | **SAFE** | 551 KB |
| 3 | `public/banner2.webp` | Ảnh | Không tham chiếu. | quét toàn repo | **SAFE** | 106 KB |
| 4 | `public/letan.png` | Ảnh | Chỉ xuất hiện trong **comment**; code dùng `/letan.webp`. | grep `letan` → chỉ comment + `letan.webp` | **SAFE** | 610 KB |
| 5 | `public/tongdai.png` | Ảnh | Không tham chiếu; code dùng `/tongdai.webp`. | grep `tongdai` → chỉ `tongdai.webp` | **SAFE** | 237 KB |
| 6 | `public/BacGiang.jpg`, `BacNinh.jpg`, `HaiPhong.jpg`, `HaLong.jpg`, `MongCai.jpg`, `NoiBai.jpg` | Ảnh (6) | Bản `.jpg` không tham chiếu; app dùng `.webp` (slideshow/seed). | quét toàn repo: không có `<name>.jpg` | **SAFE** | ~1.66 MB |
| 7 | `public/banner3.png` | Ảnh | **Đang dùng** (`HeroSection.tsx:23`), nhưng nặng 2.5 MB PNG. | grep `banner3.png` | **KEEP** → tối ưu ở Phase 3 (chuyển WebP/AVIF) | 2.49 MB |
| 8 | `media/*` (22 file) | Upload runtime | Được serve tại `/media/*` (`src/app/media/[...path]/route.ts`) cho nội dung đã seed. Xóa có thể vỡ ảnh production. | route serve `media/`; `git ls-files media/` tracked | **REVIEW** | 12.65 MB |
| 9 | `public/images/og-xe-ghep-lien-tinh.webp` | Ảnh OG | Dùng qua `DEFAULT_OG_IMAGE` (seo.ts:5). | grep | **KEEP** | 82 KB |

### 1.6. Dependencies

| # | Đường dẫn | Loại | Lý do | Bằng chứng | Mức độ | Dung lượng |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `@testing-library/jest-dom` (devDep) | Dependency | Không import ở bất kỳ file nào; test không dùng matcher jest-dom (`toBeInTheDocument`…). | grep cả `src/tests/backend-tests`: 0 match | **SAFE** | nhỏ |
| 2 | `eslint-config-next` (devDep) | Dependency | depcheck báo unused nhưng **thực tế dùng** qua `eslint.config.mjs` (`compat.extends("next/core-web-vitals","next/typescript")`). | đọc `eslint.config.mjs` | **KEEP** | — |
| 3 | `autoprefixer` (devDep) | Dependency | depcheck báo unused nhưng dùng qua `postcss.config.mjs` (Tailwind). | postcss.config.mjs | **KEEP** | — |
| 4 | 16 dependencies runtime | — | Không có dependency runtime nào thừa (depcheck rỗng). `react-router-dom` dùng bởi admin SPA. | depcheck | **KEEP** | — |

---

## 2. Tổng dung lượng ước tính giảm được

| Nhóm | SAFE | REVIEW (nếu duyệt) |
| --- | --- | --- |
| Assets (public) | **~8.56 MB** | +12.65 MB (`media/`) |
| File chết (component/barrel) | ~9.2 KB | — |
| Docs example + temp files | ~12.6 KB | — |
| Code thừa (comment + hàm dead + const) | ~25 KB | nhỏ |
| Dependency | nhỏ (jest-dom) | — |
| **TỔNG** | **≈ 8.6 MB** | **≈ 21.3 MB** |

> Phần lớn lợi ích đến từ **assets trong `public/`** (được copy vào build output). Dead code `src` đóng góp nhỏ về byte nhưng giúp sạch và giảm bundle admin SPA (các component dead).

---

## 3. Rủi ro cần lưu ý

1. **API endpoints REVIEW (#1.1):** `/api/v1/{pricing/airport,pricing/distance,settings/pricing,pages/[slug]}` có thể có client ngoài (mobile/third-party) theo contract. **Không xóa nếu chưa xác nhận.** An toàn hơn: chỉ xóa dead getter phía frontend, giữ endpoint.
2. **`media/` (12.65 MB):** là dữ liệu upload đang được serve runtime → **không xóa** trừ khi xác nhận là ảnh trùng/không dùng.
3. **False positive của knip:** knip báo `isNotFoundError` (api.ts) unused nhưng thực tế `(site)/tin-tuc/[slug]` và `(site)/tuyen-lien-tinh/[slug]` có dùng. Do file `src/lib/api.ts` trùng tên thư mục `src/lib/api/` gây nhầm. Vì vậy các mục nhóm 1.4 #2–8 đã được **grep xác minh lại**; riêng #7/#8 xếp REVIEW.
4. **`@testing-library/jest-dom`:** xóa an toàn nhưng nếu sau này thêm matcher jest-dom sẽ phải cài lại — chấp nhận.
5. **`src/lib/utils.ts` (#1.4.7):** nếu xóa sẽ **vỡ `tests/seo.test.ts`** → chỉ xóa kèm sửa/xóa test tương ứng.
6. **`.jpg`/`.png` trong `public/`:** xác nhận không phải fallback `<picture>`/OG trước khi xóa (đã quét: không có `<source>`/tham chiếu `.jpg`).
7. **Baseline test fail sẵn (`ANONYMIZE_MONTHS=`):** khi Phase 2 chạy lại `npm test`, file này sẽ vẫn fail — cần thống nhất tiêu chí pass (bỏ qua file này hoặc set env).
8. **4 commit local chưa push trên `main`:** đã nằm trong branch backup. `main` hiện ahead `origin/main` 4 commit.

---

## 4. Đề xuất thứ tự thực hiện Phase 2 (chờ duyệt)

1. `chore(backend): remove test/dev-only files` — `.tmp-*`, `docs/examples/ninh-binh-pricing.css`.
2. `chore(frontend): remove unused components` — `DashboardPlaceholder.tsx`, `Dialog.tsx`, 4 barrel `index.ts` (kèm sửa `dashboard/index.ts`).
3. `chore(frontend): remove dead code` — comment-out `WhyChooseUs.tsx`, dead getters `src/lib/api.ts`, `FIVE_COMMITMENTS`.
4. `chore(assets): remove unused assets` — 8.56 MB public assets.
5. `chore(deps): remove unused dependencies` — `@testing-library/jest-dom`.
6. (Review-only) `chore(backend): remove unused APIs` — 4 endpoint, **chỉ khi user xác nhận**.

Sau mỗi nhóm: chạy lint + typecheck + build + test, fail thì revert ngay.

---

**➡️ DỪNG LẠI — chờ user xác nhận danh sách SAFE/REVIEW trước khi sang Phase 2.**

---

## 5. Phase 2 — Kết quả dọn dẹp (ĐÃ THỰC HIỆN)

Tất cả thực hiện trực tiếp trên `main`, mỗi nhóm 1 commit. Sau mỗi nhóm chạy lint + typecheck + test + build; tất cả **PASS** (test chỉ fail đúng file env `anonymizePii` như baseline).

| # | Commit | Nội dung |
| --- | --- | --- |
| 1 | `14645ca` | `chore(backend): remove test/dev-only files` — `.tmp-route-pricing-browser.html/.mjs`, `docs/examples/ninh-binh-pricing.css` |
| 2 | `4f46f1c` | `chore(frontend): remove unused components` — `DashboardPlaceholder.tsx`, `Dialog.tsx`, 4 barrel `index.ts` (sửa `dashboard/index.ts`) |
| 3 | `242e038` | `chore(frontend): remove dead code and unused imports` — comment-out `WhyChooseUs.tsx` (−284 dòng), 9 dead getter trong `src/lib/api.ts` (−86 dòng), `FIVE_COMMITMENTS` |
| 4 | `8d324e3` | `chore(assets): remove unused assets` — 11 ảnh `public/` (−8.56 MB) |
| 5 | `e2f92c9` | `chore(deps): remove unused dependencies` — `@testing-library/jest-dom` (kèm `npm ci` sạch) |

> **Giữ nguyên (REVIEW) như đã thống nhất:** 4 endpoint `/api/v1/{pricing/airport,pricing/distance,settings/pricing,pages/[slug]}`, thư mục `media/`, `src/lib/utils.ts`. Không xóa.

---

## 6. Phase 3 — Tối ưu dung lượng & RAM (ĐÃ THỰC HIỆN)

| # | Commit | Nội dung |
| --- | --- | --- |
| 1 | `2cc25c5` | `chore(optimize): convert hero banner to webp and expand gitignore` |

- **Ảnh LCP hero:** `public/banner3.png` (2.49 MB PNG 1677×938) → `public/banner3.webp` (141 KB, quality 82), cập nhật `HeroSection.tsx:23` sang `/banner3.webp`. Giảm **≈ 2.35 MB** trong build output/public. (Vẫn đi qua `next/image` nên browser nhận AVIF/WebP tối ưu.)
- **`.gitignore`:** bổ sung `.DS_Store`, `Thumbs.db`, `*.log`, `npm-debug.log*`, `.tmp-*`, `coverage/`.
- **Middleware** (`src/middleware.ts`): đã tối ưu sẵn — cache redirect trong RAM 60s, fail-open, timeout 500ms, `matcher` loại static/asset/`_next`/`api`/`media`. Không cần sửa.
- **Bundle:** admin SPA đã được `dynamic import` + `ssr:false` (`src/app/admin/…`), `lucide-react` import theo icon (tree-shake). Seed data (`src/seed/*`) **không** lọt vào runtime bundle (đã grep).
- **Không có Dockerfile / `.dockerignore`** → phần 3.3 của kế hoạch **N/A**.

### Đề xuất tối ưu CHƯA áp dụng (cần bạn quyết định)
1. **`output: "standalone"`** trong `next.config.ts`: giảm mạnh dung lượng deploy (chỉ trace file cần thiết). Chỉ có lợi nếu đổi CI/deploy sang chạy `node .next/standalone/server.js`; nếu vẫn `next start` từ `node_modules` đầy đủ thì vô ích → **chưa thêm**.
2. **`postcss` đang nằm trong `dependencies`** dù chỉ dùng lúc build. Chuyển sang `devDependencies` an toàn nếu nơi deploy build cùng devDeps; **rủi ro** nếu deploy `npm ci --omit=dev` rồi build → **chưa chuyển**.
3. **`media/` (12.65 MB)**: là dữ liệu upload serve runtime → chỉ dọn nếu xác nhận là ảnh thừa/trùng.

---

## 7. So sánh TRƯỚC / SAU

| Metric | Trước | Sau | Chênh |
| --- | --- | --- | --- |
| `src` | 1.58 MB · 233 files | 1.55 MB · 227 files | −6 files |
| `public` | 12.32 MB · 28 files | 1.47 MB · 17 files | **−10.85 MB** |
| `media` (runtime) | 12.65 MB | 12.65 MB | 0 (giữ) |
| `.next` (build) | 712 MB | 726 MB | ± (dao động build) |
| `node_modules` | 823 MB | 821 MB | −1.5 MB |
| Dependencies / devDependencies | 16 / 16 | 16 / 15 | −1 devDep |
| Build time | ~355s | 304–357s | không hồi quy |
| Lint | 0 errors, 117 warnings | 0 errors, 116 warnings | −1 warning |
| Typecheck | pass | pass | — |
| Test | 469 pass / 1 file env-fail | 469 pass / 1 file env-fail | không đổi (baseline) |

**Tổng dung lượng public giảm: ≈ 10.85 MB** (Phase 2: −8.56 MB assets thừa, Phase 3: −2.35 MB nén hero).

---

## 8. Hướng dẫn ROLLBACK

- **Hoàn tác toàn bộ dọn dẹp:** `git reset --hard backup/pre-cleanup-20261016` (branch backup đã push, chứa trạng thái trước Phase 2).
- **Hoàn tác từng nhóm:** `git revert <commit>` với các hash ở §5 & §6 (mỗi nhóm 1 commit, revert độc lập được).
- **Backup branch:** `backup/pre-cleanup-20261016` (local + `origin`).

> ⚠️ **6 commit local trên `main` CHƯA push** (`origin/main..HEAD`). Chỉ push sau khi bạn xác nhận.

---

## 9. Trạng thái cuối

- ✅ Phase 0 (backup + baseline), Phase 1 (audit), Phase 2 (dọn dẹp), Phase 3 (tối ưu) — hoàn tất.
- ⏸️ **Chờ xác nhận để push `origin main`** và/hoặc quyết định 3 mục "Đề xuất chưa áp dụng" ở §6.
- Lỗi test `anonymizePii` vẫn là lỗi env sẵn có (`ANONYMIZE_MONTHS=` rỗng), không do dọn dẹp.
