# MIGRATION.md — Gộp 3 dự án (website + admin CMS + backend) thành 1 dự án Next.js

> Dự án đích: `D:\Freelancer\web-xeghep\cms\xeghep`
> Nguồn (read-only): `cms/website` (Next.js 15 public), `cms/admin` (Vite SPA CMS), `cms/backend` (Payload CMS 3 + Next.js 15 + Postgres)
> Ngày: 2026-10-15

---

## 0. Quyết định đã tự chọn (khi prompt mơ hồ)

| # | Vấn đề | Quyết định | Lý do |
|---|--------|------------|-------|
| D1 | Đường dẫn dự án mới (prompt để trống `[PATH_NEW_PROJECT]`) | `D:\Freelancer\web-xeghep\cms\xeghep` | Cùng cấp với 3 dự án nguồn, tên ngắn khớp tên miền business |
| D2 | Payload admin UI (backend)原本 ở `/admin`, xung đột với custom CMS | Di chuyển payload admin UI sang **`/payload-admin`** (đổi tên folder route `(payload)/admin` → `(payload)/payload-admin`); custom CMS giữ `/admin` | Giữ capability debug DB của Payload, không đụng `/admin` của CMS; không thêm link từ public |
| D3 | Admin SPA (Vite) chạy dưới `/admin` | Port vào `src/admin/**` + route `app/admin/[[...path]]` mount react-router `basename="/admin"` | Tái sử dụng 100% UI, chỉ đổi routing base |
| D4 | Tailwind của website (brand=green) vs admin (brand=blue, shadcn tokens) conflict | **2 cấu hình Tailwind riêng**, chuyển config bằng custom PostCSS plugin chọn theo đường dẫn file CSS (`src/admin/index.css` → config admin; còn lại → config website) | Public UI MUST giữ nguyên 100% → không được để token admin đè màu public |
| D5 | Root layout website render Header/Footer (chrome public) nhưng `/admin`, `/payload-admin` không được có chrome public | Áp dụng **Multiple Root Layouts** (không có `app/layout.tsx`): `src/app/(site)/` = website (layout cũ nguyên vẹn), `src/app/(payload)/` = payload, `src/app/admin/` = CMS SPA (layout riêng) | Cách Payload template chính thức tổ chức; URL public không đổi vì route group trong suốt |
| D6 | Website fetch data qua HTTP sang CMS_URL (rewrite) | Giữ nguyên cách fetch HTTP; `CMS_URL` mặc định trỏ về chính app (`http://localhost:3000`); **xóa rewrite** `/api/v1/*` trong next.config | Giữ hành vi fail-open fallback + ISR như cũ, ít refactor nhất |
| D7 | Giá realtime bị xóa nhưng UI BookingForm hiển thị giá | Thay bằng giá **lưu trữ tĩnh** trong Route (tiers/`priceShare1Text`/`priceFrom`) — không còn tính toán realtime; backend tạo booking suy giá từ tiers đã lưu của route | UI giữ nguyên, nguồn dữ liệu = config đã nhập tay |
| D8 | Booking lifecycle/state machine bị xóa nhưng vẫn cần tạo + xem đơn | Giữ collection `bookings` (create/read/status mặc định `pending`), xóa hook transition, `statusHistory`, `cancelReason`, mọi API điều phối trạng thái | Nghiệp vụ "đặt xe" còn lại hoạt động như cũ |
| D9 | ESLint | Thêm `eslint` + `eslint-config-next` (dev), config flat tối thiểu; rule gây lỗi do code giữ nguyên → hạ `warn`/`off` và ghi chú | AC yêu cầu `lint` không lỗi; website gốc không có eslint (script `lint` hỏng) |
| D10 | Port dev | `next dev` / `next build` / `next start` (mặc định port 3000, đổi bằng `PORT`) | Một dự án một port |
| D11 | GraphQL routes của Payload | Giữ nguyên (không có consumer, là API sẵn có của backend) | Không nằm trong danh sách REMOVE |
| D12 | Docker/compose/nginx của monorepo cũ | KHÔNG port (ngoài scope) | Prompt chỉ yêu cầu một lệnh dev + một lệnh build |

---

## 1. Rule checklist từ `website/AGENTS.md` (áp dụng toàn dự án)

AGENTS.md được copy về gốc dự án mới (`AGENTS.md`, giữ nguyên nội dung gốc + bổ sung mục 17 cho cấu trúc mới).

| # | Rule (viết tắt) | Mức | Áp dụng thế nào trong dự án mới | Trạng thái |
|---|------------------|-----|----------------------------------|------------|
| 1.1 | `<title>` unique, ~50-60 ký tự, brand cuối | 🔴 | Giữ nguyên metadata gốc từng trang (không sửa) | ✅ giữ |
| 1.2 | Meta description | 🟠 | Giữ nguyên | ✅ giữ |
| 1.3 | Self-canonical absolute từng trang, không đặt ở root layout | 🔴 | Giữ nguyên `constructMetadata` từng trang; root layout (site group) không có canonical | ✅ giữ |
| 1.4 | Charset đầu, viewport không maximum-scale | 🔴 | Layout giữ nguyên (`charset` trong `<head>`, viewport gốc) | ✅ giữ |
| 1.5 | Robots meta: `noindex` cho trang admin | 🔴 | `/admin` + `/payload-admin`: metadata `robots: noindex,nofollow` + header `X-Robots-Tag` qua middleware | ✅ làm |
| 1.5 | Không vừa Disallow vừa noindex cùng URL | 🔴 | Xem mục 5 — mâu thuẫn nội bộ AGENTS.md (1.5 vs mẫu 9.1/14.1) + AC prompt; resolution ghi ở mục "Mâu thuẫn rule" | ⚠️ resolution ở §5 |
| 1.7 | `<html lang="vi">`, favicon | 🔴/🟠 | Giữ nguyên (site layout `lang="vi"`) | ✅ giữ |
| 2.x | OG tags | 🟠 | Giữ nguyên | ✅ giữ |
| 3.x | Semantic HTML | 🟠 | Giữ nguyên (không sửa markup) | ✅ giữ |
| 4.3 | Trailing slash nhất quán | 🔴 | `trailingSlash: false` giữ nguyên từ website | ✅ giữ |
| 4.4 | Redirect/404/410 đúng | 🔴 | Middleware CMS redirects giữ nguyên (301/308/410); `notFound()` giữ nguyên | ✅ giữ |
| 5.1-5.2 | alt/width/height, LCP không lazy | 🔴 | Giữ nguyên markup ảnh | ✅ giữ |
| 6.x | CWV | 🔴/🟠 | Giữ nguyên (next/font, ISR) | ✅ giữ |
| 7.x | JSON-LD khớp dữ liệu hiển thị | 🔴 | Giữ nguyên `JsonLd`/`schema.ts`; giá hiển thị = giá stored → schema vẫn khớp | ✅ giữ |
| 8.1 | Link crawlable `<a href>` | 🔴 | Giữ nguyên; admin dùng react-router `<Link>` (SPA admin, không index) | ✅ giữ |
| 9.1 | robots.txt có Disallow /admin/ mẫu Next.js | 🔴 | `app/robots.ts`: Disallow `/admin/`, `/payload-admin/` (mẫu 14.1) + X-Robots-Tag noindex | ⚠️ xem §5 |
| 9.2 | Sitemap chỉ URL indexable | 🔴 | `sitemap.ts` giữ nguyên (không `/admin`) | ✅ giữ |
| 9.3 | 404 thật | 🔴 | `notFound()` giữ; `not-found.tsx`移到 `(site)/` | ✅ giữ |
| 9.4 | Nội dung trong server HTML | 🔴 | Giữ nguyên SSG/ISR | ✅ giữ |
| 10 | Mobile parity | 🔴 | Giữ nguyên responsive | ✅ giữ |
| 11 | a11y cơ bản | 🟠 | Giữ nguyên | ✅ giữ |
| 13.1 | HTTPS/no mixed content | 🔴 | Header security giữ nguyên; deploy phía nginx | ✅ giữ |
| 14.1 | `await params`, canonical per page, `notFound()`, metadata API, sitemap.ts, robots.ts | 🔴/🟠 | Code Next.js gốc đã đúng; payload routes giữ nguyên | ✅ giữ |
| 15.1 | Checklist验证 | 🔴 | Build + test + grep kiểm ở §6-§7 | ✅ chạy |

### Bổ sung (mục 17 added vào AGENTS.md bản copy)
- Vị trí API: `src/app/api/v1/**` (REST public) + payload REST catch-all `src/app/(payload)/api/**`.
- Vị trí CMS: `src/app/admin/**` + code SPA trong `src/admin/**`; luôn có `noindex`; không link từ public.
- Public pages nằm trong route group `src/app/(site)/`.

---

## 2. Audit — danh sách module KEEP / REMOVE

### 2.1 REMOVE hoàn toàn (5 nghiệp vụ)

| Nghiệp vụ | File/route/model bị xóa (đã thực hiện) |
|-----------|------------------------------------------|
| **Driver** | Đã không còn trong code nguồn; xóa dead refs: admin `DashboardPlaceholder` card `/drivers`, admin `Header.routeTitles["/drivers"]`, test refs |
| **Webhook** | website: `src/app/api/webhooks/revalidate/route.ts`, `src/app/api/v1/webhooks/revalidate/route.ts`, `src/lib/revalidate.ts`; backend: `src/lib/revalidate/webhookClient.ts`, `src/collections/hooks/revalidateHooks.ts` + mọi import hook ở 8 collection/global |
| **Realtime pricing** | backend: `src/app/api/v1/pricing/estimate/route.ts`, `src/lib/pricing/estimate.ts`, `src/lib/pricing/matchRoute.ts`, `loadPricingCtx`/`invalidatePricingCtx` trong `lib/api/ctx.ts`, `RATE_RULES.estimate`, `RATE_RULES.general` (dead); website: `postEstimate` + effect gọi estimate trong `BookingForm`, dead getters `getAirportPricing/getDistanceRates/getPricingSettings/getPage`, dead data `src/data/airport-pricing.ts`, `src/data/long-distance-pricing.ts`; tests `pricing.golden.test.ts` |
| **Booking state machine / lifecycle** | backend: `src/lib/booking/stateMachine.ts`, hook beforeChange của Bookings, fields `statusHistory`/`cancelReason` (+validate), `INVALID_TRANSITION` error code; tests `booking.stateMachine.test.ts`; admin: `lib/stateMachine.ts` (phần transitions/evaluate), `StatusTransitionActions.tsx`, `PATCH /bookings/{id}` UI, `stateMachine.test.ts`, block transitions trong `bookings.test.tsx` |
| **Notification worker** | backend: `src/lib/notify/{worker,telegram,email,message,escapeHtml}.ts`, `src/globals/NotificationSettings.ts`, `src/app/api/v1/notify/test/route.ts`, `src/instrumentation.ts`, `src/scripts/initNotificationTable.ts`, fields `notifiedAt/notifyAttempts/notifyError` trên Bookings, tests `notify*.test.ts`; admin: `NotificationSettingsForm.tsx` + tab trong `SettingsPage`, `types/settings.NotificationSettings`, `notification.settings.test.tsx` |

### 2.2 KEEP (còn nguyên hoặc chỉ trim tối thiểu)

- **Website public**: toàn bộ trang (`/`, `/tin-tuc`, `/tuyen-lien-tinh`, `/dat-xe`, `/chinh-sach/*`, `/gioi-thieu`, `/lien-he`, `/dat-xe/thanh-cong`), components, styling, assets, SEO (metadata/JSON-LD/sitemap/robots), middleware redirects CMS, data fallbacks.
- **Backend còn lại**: Payload collections `users, media, routes, articles, pages, bookings (trim), redirects, airport_pricing, distance_rates`; globals `company_settings, pricing_settings`; REST `/api/v1/{routes,articles,pages,redirects,seo/sitemap,settings/*,pricing/{airport,distance},bookings}`; payload REST catch-all (custom multipart wrapper); `/media/[...path]`; libs `api/{envelope,rateLimit,idempotency,serialize,ctx (còn getPayloadInstance/getClientIp/hashIp)}`, `booking/{bookingCode,lookupToken,validate}`, `pricing/formatTier`, `settings/*`, `seo/*`, hook `createRedirectOnSlugChange`; scripts + seeds + tests KEEP.
- **Admin còn lại**: login/auth/RBAC, dashboard, routes, articles, pages, media, redirects (+ SitemapMonitor), pricing tables, settings company/pricing, users, help; UI components; đa số tests.

---

## 3. Xử lý phụ thuộc vào phần REMOVE (từng chỗ)

| Chỗ phụ thuộc | Phương án thay thế (đơn giản nhất) | File |
|---------------|-------------------------------------|------|
| `BookingForm` hiển thị giá realtime (badge "Báo giá tự động", giá trên nút submit, giá tóm tắt) | Hiển thị giá **tĩnh** từ route card đã chọn (`priceShare1Text`/`priceCharter4to5Text`/`priceCharter7Text`/`priceFrom` — dữ liệu do admin nhập tay). Không gọi API estimate. | `src/components/booking/BookingForm.tsx` |
| `POST /api/v1/bookings` tính `estimatedPrice` bằng `estimate()` | Suy giá từ tiers đã lưu của route (`tierShare1`…, `formatTier`); rideType khác share1 → `negotiable`/"Liên hệ báo giá". Response giữ nguyên shape. | `src/app/api/v1/bookings/route.ts` |
| `/dat-xe/thanh-cong` hiển thị `estimatedPriceFormatted` | Vẫn đọc từ response booking (đã thay bằng giá stored) | giữ nguyên |
| `GET /api/v1/routes/[slug]` dùng `loadPricingCtx()` chỉ để `priceValidUntilFallback` | Thay bằng 1 `findGlobal('pricing_settings')` trực tiếp | `routes/[slug]/route.ts` |
| Admin điều phối trạng thái đơn (`StatusTransitionActions`) | Xóa component + UI block tương ứng; danh sách đơn vẫn hiển thị `status` stored | `src/admin/features/bookings/*` |
| ISR revalidate 60s trước đây được webhook push | Không còn push → ISR theo thời gian (60s) vẫn tự refresh; admin sửa nội dung ≤60s hiển thị trên public | ghi nhận |
| Middleware backend gắn `X-Robots-Tag` cho `/admin` | Gộp vào middleware website: `/admin` + `/payload-admin` → header noindex (+ guard cookie cho `/admin`) | `src/middleware.ts` |

---

## 4. Mâu thuẫn rule AGENTS.md vs prompt

| # | Mâu thuẫn | Resolution |
|---|-----------|------------|
| C1 | Prompt AC: `/admin` phải có **noindex metadata AND Disallow trong robots**. AGENTS.md 1.5 🔴: "KHÔNG vừa Disallow vừa noindex cho cùng URL — chọn một". | AGENTS.md ưu tiên, nhưng AGENTS.md tự mâu thuẫn nội bộ: 9.1 và 14.1 (Next.js) đều cho mẫu `Disallow: /admin/`. Chọn **cả hai** theo AC prompt + mẫu 9.1/14.1 (framework-specific): robots.txt Disallow `/admin/`, `/payload-admin/` (chỉ production) + defense-in-depth `X-Robots-Tag: noindex` (header) như backend vốn làm. Nếu chủ site muốn tuân thủ 1.5 tuyệt đối: bỏ Disallow, giữ noindex — đã ghi ở đây để người kiểm tra quyết định. |
| C2 | Prompt: "ẩn khỏi giao diện, chỉ gõ URL" nhưng AGENTS.md cấm cloaking/hidden text | Không việc gì: ẩn link menu là UX, không phải cloaking; trang vẫn render thật khi truy cập | 

---

## 5. Các quyết định kỹ thuật khác đã ghi nhận

- Port admin dùng `react-router` v6 với `basename="/admin"`; `AuthContext` fallback `window.location.href='/login'` → `/admin/login`.
- Axios `baseURL` giữ `/api` (payload REST catch-all + api/v1 cùng origin) — không đổi code HTTP.
- Cookie `cms_admin_token` giữ `path=/` (middleware đọc được); auth thật do payload access control + AuthContext.
- `@tanstack/react-query` bị loại (chỉ có provider, 0 hook dùng).
- `lucide-react`: nâng admin từ `^0.475.0` → `^1.16.0` (website đang dùng) để một dependency; sửa icon import nếu đổi tên.
- Payload types (`payload-types.ts`) copy từ backend rồi cắt tay phần NotificationSettings + field đã xóa (không chạy migration/DB thật).
- Không chạy `db:push`/seed — chỉ định nghĩa schema; lệnh có sẵn trong package.json khi cần.
- Website `.env.local`/backend `.env`: KHÔNG copy (chỉ `.env.example` tên biến).

---

## 6. Kết quả kiểm tra (cập nhật khi chạy)

### Typecheck
```
npx tsc --noEmit  →  0 errors ✅
```

### ESLint (D9)
```
npm run lint  →  0 errors, 110 warnings ✅
```
Warnings chủ yếu: `no-explicit-any`, `no-unused-vars` (code giữ nguyên theo D9 — không refactor thừa).

### Tests
```
npm test  →  39 files, 458/458 PASS ✅
```

### Build
```
npm run build  →  28 routes, 0 errors ✅
```
- `/` static (SSG, revalidate 1m)
- `/admin/[[...path]]` dynamic (SPA mount)
- `/payload-admin/[[...segments]]` dynamic
- `/robots.txt` static
- `/sitemap.xml` static
- Middleware 34.3 kB

### Smoke test (next start, production)
```
11/11 PASS ✅
```
| Route | Status | Ghi chú |
|---|---|---|
| `/` | 200 | Trang chủ SSG |
| `/admin` | 200 | Admin SPA + `X-Robots-Tag: noindex, nofollow` |
| `/robots.txt` | 200 | Disallow `/admin/`, `/payload-admin/`, `/api/` |
| `/sitemap.xml` | 200 | |
| `/tuyen-lien-tinh` | 200 | |
| `/tin-tuc` | 200 | |
| `/dat-xe` | 200 | |
| `/gioi-thieu` | 200 | |
| `/lien-he` | 200 | |
| `/chinh-sach/bao-mat` | 200 | |
| `/non-existent-page` | 404 | 404 thật, không soft-404 |

**Lưu ý runtime:** API routes (`/api/v1/*`) và `/payload-admin` trả 500 khi Postgres chưa chạy — cần `DATABASE_URI` hợp lệ + Postgres hoạt động. Frontend không phụ thuộc DB ở runtime (SSG + ISR).

### File đã move/fix trong smoke test
- `src/app/(site)/robots.ts` → `src/app/robots.ts` (route group `(site)` khiến Next.js không nhận diện metadata route)
- `src/admin/context/AuthContext.tsx`: bỏ try/catch quanh `useNavigate` (vi phạm Rules of Hooks); `AuthProvider` luôn nằm trong `BrowserRouter`

---

## 7. Bảng kiểm rule AGENTS.md trên code mới

| Rule | Status | Ghi chú |
|---|---|---|
| 1.1 Title unique | ✅ | `generateMetadata` per-page, template `%s | Brand` |
| 1.3 Canonical self-ref absolute | ✅ | Per-page, không kế thừa root layout |
| 1.5 Robots meta / X-Robots-Tag | ✅ | Middleware set `X-Robots-Tag: noindex, nofollow` cho `/admin/*` và `/payload-admin/*`; robots.txt Disallow |
| 1.7 lang, favicon | ✅ | `lang="vi"`, favicon trong metadata |
| 2.1 Open Graph | ✅ | OG tags per-page |
| 4.3 Trailing slash | ✅ | Next.js mặc định (no trailing slash) |
| 5.1 img alt/width/height | ✅ | Component ảnh có đủ attributes |
| 8.1 Link crawlable `<a href>` | ✅ | Dùng `next/link` cho SPA, `<a href>` cho external |
| 9.1 robots.txt | ✅ | Disallow `/admin/`, `/payload-admin/`, `/api/`; Sitemap khai báo |
| 9.2 XML Sitemap | ✅ | `src/app/sitemap.ts` tự sinh từ data |
| 9.3 Trang 404 | ✅ | `notFound()` → HTTP 404 thật |
| 14.1 Next.js App Router | ✅ | `await params`, canonical per-page, `next/image`, `next/link` |

**Xung đột đã ghi nhận (§4 MIGRATION.md):**
- Rule 1.5 (không vừa Disallow vừa noindex) vs AC prompt yêu cầu CẢ HAI → giữ both (defense-in-depth), ghi chú trong `robots.ts`.

---

## 8. Việc cần người kiểm tra

### Ưu tiên cao
1. **Postgres + DATABASE_URI**: Chạy Postgres, tạo DB `xeghep`, set `DATABASE_URI` trong `.env`, chạy `npm run db:push` (Payload Drizzle push schema), seed: `npm run seed:admin` / `seed:editor` / `seed:dispatcher`.
2. **Payload Admin** (`/payload-admin`): Sau khi DB up, login bằng seed account, kiểm tra CRUD Collections (Articles, Routes, Bookings, Media, Pages, Redirects, Users) + Globals (CompanySettings, PricingSettings).
3. **Admin SPA** (`/admin`): Login bằng seed account Dispatcher/Admin, kiểm tra toàn bộ feature: Dashboard, Bookings, Routes, Articles, Users, Settings, Help.

### Ưu tiên trung bình
4. **Booking flow**: Đặt xe trên `/dat-xe` → check DB có record → check email/notification (nếu cấu hình).
5. **SEO**: `curl` kiểm tra canonical, title, JSON-LD trên ≥3 trang khác nhau; sitemap chỉ chứa URL 200 indexable.
6. **Media upload**: Upload ảnh trong Payload Admin → verify `/media/[...path]` serve đúng.
7. **Redirects 301**: Tạo redirect trong CMS → verify `/api/v1/redirects` hoạt động.

### Môi trường production
8. Thay `PAYLOAD_SECRET`, `LOOKUP_SECRET`, `IP_SALT` bằng giá trị random mạnh.
9. Set `PAYLOAD_PUBLIC_SERVER_URL=https://xegheplientinh.vn` (hoặc domain thật).
10. Bật HTTPS + HSTS; cấu hình reverse proxy (nginx/caddy) nếu cần.
11. Xác nhận `robots.txt` trả `Disallow` đúng (không có `Disallow: /` ở production).
