# 🔍 SEO Frontend Rules — Senior Frontend Guidelines

> **Mục đích:** Bộ quy tắc cho mọi AI agent/developer khi viết code frontend, nhằm website được crawl, index và hiển thị tốt trên công cụ tìm kiếm (ưu tiên Google; có ghi chú riêng cho Bing, Yandex, Baidu và AI crawlers).
>
> **Phạm vi áp dụng:** Mọi tech stack frontend — HTML thuần, React, Next.js, Nuxt, Astro, SvelteKit, Remix/React Router, Angular, Gatsby…
>
> **Phiên bản:** 2.0.0 — cập nhật 2026-10-06

---

## 📖 Cách đọc & áp dụng (DÀNH CHO AI AGENT)

### Ký hiệu mức độ

| Ký hiệu          | Ý nghĩa                                                     | Agent phải                                                   |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| 🔴 **MUST**      | Thiếu/sai gây lỗi crawl, index, duplicate hoặc bug kỹ thuật | Luôn áp dụng                                                 |
| 🟠 **SHOULD**    | Best practice, ảnh hưởng gián tiếp                          | Áp dụng mặc định; bỏ khi xung đột yêu cầu dự án và nêu lý do |
| 🟢 **MAY**       | Tùy loại trang/site                                         | Chỉ làm khi trang liên quan hoặc được yêu cầu                |
| 📏 **Heuristic** | Con số kinh nghiệm, KHÔNG phải quy định của search engine   | Dùng làm mục tiêu; lệch nhẹ không phải lỗi                   |

### Quy trình bắt buộc cho mỗi task

1. **Phát hiện stack và rendering mode** (SSR / SSG / ISR / CSR) trước khi viết code. Đọc `package.json`, cấu hình framework.
2. **Dùng API SEO có sẵn của framework** (metadata API, sitemap, robots, image, font). KHÔNG tự viết lại thứ framework đã làm sẵn.
3. **Theo convention của dự án** nếu dự án đã có cách làm. Chỉ đề xuất đổi khi cách hiện tại gây lỗi 🔴.
4. **Không bịa dữ liệu**: rating, review, giá, tác giả, ngày tháng trong schema/meta PHẢI lấy từ nguồn thật hiển thị trên trang.
5. **Verify sau khi sửa** bằng các lệnh ở [mục 15](#15-seo-testing--validation).
6. Khi rule mâu thuẫn với yêu cầu người dùng, làm theo người dùng và ghi chú rủi ro SEO ngắn gọn.

### KHÔNG BAO GIỜ làm

- ❌ Cloaking (nội dung khác nhau cho bot và người dùng), hidden text nhồi từ khóa, link ẩn.
- ❌ Bịa structured data (review/rating giả, giá không khớp trang).
- ❌ Để `noindex` lọt vào production, hoặc `Disallow: /` ngoài môi trường staging.
- ❌ Đặt canonical ở layout gốc rồi để mọi trang kế thừa.
- ❌ Dùng `onClick` + `router.push` thay cho `<a href>` cho điều hướng.

---

## 📑 Mục lục

1. [Head & Meta Tags](#1-head--meta-tags)
2. [Open Graph & Social Meta](#2-open-graph--social-meta)
3. [Semantic HTML & Heading](#3-semantic-html--heading)
4. [URL Structure & Routing](#4-url-structure--routing)
5. [Hình ảnh & Media](#5-hình-ảnh--media)
6. [Performance & Core Web Vitals](#6-performance--core-web-vitals)
7. [Structured Data](#7-structured-data-schemaorg)
8. [Internal Linking & Navigation](#8-internal-linking--navigation)
9. [Crawlability & Indexability](#9-crawlability--indexability)
10. [Mobile & Responsive](#10-mobile--responsive)
11. [Accessibility → SEO](#11-accessibility--seo)
12. [Internationalization](#12-internationalization-i18n)
13. [Security](#13-security)
14. [Framework-Specific Rules](#14-framework-specific-rules)
15. [SEO Testing & Validation](#15-seo-testing--validation)
16. [Monitoring](#16-monitoring-liên-tục)

---

## 1. Head & Meta Tags

### 1.1. Title tag — 🔴 MUST có và unique

```html
<title>{Chủ đề chính} - {Ý phụ} | {Tên thương hiệu}</title>
```

| Quy tắc         | Chi tiết                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 🔴 Có `<title>` | Mỗi trang indexable có title **duy nhất**, mô tả đúng nội dung                                            |
| 📏 Độ dài       | ~50–60 ký tự. Google cắt theo độ rộng pixel (~600px desktop), tiếng Việt có dấu rộng hơn nên nên ngắn hơn |
| 🟠 Từ khóa      | Đặt ý chính ở đầu, viết tự nhiên, không nhồi từ khóa                                                      |
| 🟠 Brand        | Đặt cuối, sau separator (`                                                                                | `, `-`, `–`). Không dùng `\_` |
| ℹ️ Lưu ý        | Google có thể tự viết lại title; title tốt vẫn là input quan trọng nhất                                   |

### 1.2. Meta description — 🟠 SHOULD

```html
<meta
  name="description"
  content="Mô tả ngắn gọn, bổ sung thông tin cho title, có lời kêu gọi hành động."
/>
```

- Meta description **KHÔNG phải ranking factor**; nó ảnh hưởng CTR vì Google thường dùng làm snippet.
- 📏 ~120–155 ký tự. Unique cho mỗi trang. Bổ sung thông tin cho title, không lặp lại title.
- Trang không có description thì Google tự trích từ nội dung; chấp nhận được cho trang phụ (tag, filter).

### 1.3. Canonical URL — 🔴 MUST

```html
<link rel="canonical" href="https://example.com/duong-dan-chinh-thuc" />
```

- Mọi trang indexable có **self-referencing canonical**, là **absolute URL** có `https://`.
- Canonical PHẢI nằm trong **HTML server-rendered** (raw HTML), không chỉ chèn bằng JS.
- **Mỗi trang tự sinh canonical từ URL của chính nó.** Không đặt canonical cố định ở layout gốc (xem lỗi kế thừa ở [14.1](#141-nextjs-app-router)).
- Pagination: canonical trỏ về **chính trang đó**, KHÔNG trỏ về trang 1.
- URL có query params (`?sort=`, `?utm_`, `?ref=`): canonical về URL sạch. Ngoại lệ: tham số tạo ra nội dung khác biệt có chủ đích (ví dụ `?page=2`, landing filter có giá trị tìm kiếm).
- Phải **khớp** với `og:url`, `<loc>` trong sitemap và hreflang.
- Canonical là gợi ý (hint), không phải lệnh. Đừng dùng thay cho redirect 301.

### 1.4. Charset & Viewport — 🔴 MUST

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

- `<meta charset>` đặt **đầu tiên trong `<head>`**, nằm trong **1024 byte đầu** của document (theo HTML spec).
- KHÔNG dùng `maximum-scale=1` hoặc `user-scalable=no` (chặn zoom, hại accessibility).

### 1.5. Robots meta & X-Robots-Tag

```html
<!-- Mặc định KHÔNG cần thêm gì: Google tự hiểu là index, follow -->
<!-- Chỉ thêm khi muốn LOẠI trang khỏi index: -->
<meta name="robots" content="noindex" />
```

| Giá trị                      | Khi nào dùng                                                    |
| ---------------------------- | --------------------------------------------------------------- |
| `noindex`                    | Trang admin, thank-you, kết quả search nội bộ, trang preview    |
| `noindex, nofollow`          | Trang không muốn index và không muốn truyền link (hiếm khi cần) |
| `nosnippet`, `max-snippet:N` | Khi cần giới hạn nội dung hiển thị trong kết quả                |

Quy tắc:

- 🔴 **KHÔNG** vừa `Disallow` trong robots.txt vừa `noindex` cho cùng URL: bot không crawl được thì không thấy `noindex`. Chọn một: `noindex` (cho crawl, loại khỏi index) hoặc `Disallow` (tiết kiệm crawl budget).
- 🔴 Môi trường staging/preview: bảo vệ bằng **authentication** (HTTP Basic/SSO), không chỉ `noindex`. Agent PHẢI đảm bảo `noindex` được bật theo biến môi trường và **không lọt lên production**.
- 🟠 **KHÔNG** `noindex` pagination từ trang 2 trở đi (xem [8.4](#84-pagination)).
- 🟠 File không phải HTML (PDF, ảnh): dùng HTTP header `X-Robots-Tag: noindex`.

### 1.6. Điều khiển snippet/preview — 🟢 MAY

```html
<meta
  name="robots"
  content="max-image-preview:large, max-snippet:-1, max-video-preview:-1"
/>
```

- Đây là điều khiển **độ dài snippet và kích thước ảnh preview**, KHÔNG liên quan rich results.
- `max-image-preview:large` giúp ảnh lớn hiển thị ở Discover và kết quả tìm kiếm.
- Nếu trang đã có robots meta ở 1.5, **gộp chung một thẻ**, không tạo nhiều thẻ `robots`.
- Cân nhắc với chủ site: giới hạn snippet cũng ảnh hưởng cách nội dung xuất hiện trong các tính năng AI của tìm kiếm.

### 1.7. `lang`, theme-color, favicon

```html
<html lang="vi">
  <meta name="theme-color" content="#ffffff" />

  <link rel="icon" href="/favicon.ico" sizes="48x48" />
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <!-- 180×180 -->
</html>
```

- 🔴 `<html lang="xx">` đúng ngôn ngữ nội dung thực tế.
- 🟠 Favicon cho Google SERP phải là **bội số của 48px** (48×48, 96×96…), URL ổn định, không bị robots.txt chặn.

---

## 2. Open Graph & Social Meta

> Open Graph không phải ranking factor, nhưng quyết định hiển thị khi chia sẻ (Facebook, Zalo, LinkedIn, Messenger…). Zalo và Facebook **cache** OG tag; sau khi sửa phải dùng debugger để làm mới.

### 2.1. Open Graph — 🟠 SHOULD

```html
<meta property="og:type" content="website" />
<!-- "article" cho bài viết -->
<meta property="og:title" content="Tiêu đề khi chia sẻ" />
<meta property="og:description" content="Mô tả khi chia sẻ" />
<meta property="og:image" content="https://example.com/og/trang.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Mô tả ảnh" />
<meta property="og:url" content="https://example.com/trang-hien-tai" />
<meta property="og:site_name" content="Tên Website" />
<meta property="og:locale" content="vi_VN" />
```

| Quy tắc           | Chi tiết                                                |
| ----------------- | ------------------------------------------------------- |
| `og:image`        | Tối thiểu 1200×630px (tỉ lệ 1.91:1), URL **tuyệt đối**  |
| 📏 Dung lượng ảnh | Nên < 300KB để nền tảng tải nhanh và không bị bỏ qua    |
| `og:url`          | Absolute URL, **khớp canonical**                        |
| `og:title`        | Có thể khác `<title>`: ngắn gọn, hấp dẫn hơn cho social |

### 2.2. Twitter/X Card — 🟢 MAY

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@username" />
<!-- nếu có -->
```

- X **fallback về Open Graph** cho title, description, image, nên chỉ cần `twitter:card`. Chỉ thêm `twitter:title/description/image` khi muốn nội dung khác OG.

### 2.3. Article meta — 🟢 MAY (trang bài viết)

```html
<meta property="article:published_time" content="2026-01-15T08:00:00+07:00" />
<meta property="article:modified_time" content="2026-03-20T10:30:00+07:00" />
<meta property="article:author" content="https://example.com/author/tac-gia" />
<meta property="article:section" content="Công nghệ" />
<meta property="article:tag" content="SEO" />
```

---

## 3. Semantic HTML & Heading

### 3.1. Cấu trúc trang — 🟠 SHOULD

```html
<body>
  <a href="#main-content" class="skip-link">Bỏ qua điều hướng</a>
  <header><nav aria-label="Main navigation">…</nav></header>

  <main id="main-content">
    <article>
      <h1>Tiêu đề chính</h1>
      <section>
        <h2>Tiêu đề phụ</h2>
        <p>Nội dung…</p>
      </section>
    </article>
    <aside aria-label="Bài viết liên quan">…</aside>
  </main>

  <footer><nav aria-label="Footer navigation">…</nav></footer>
</body>
```

### 3.2. Quy tắc heading

| Quy tắc                             | Mức | Chi tiết                                                                                                                 |
| ----------------------------------- | --- | ------------------------------------------------------------------------------------------------------------------------ |
| Mỗi trang có H1 mô tả đúng nội dung | 🟠  | Nên có **một H1** rõ ràng. Google KHÔNG phạt nhiều H1; đây là best practice về cấu trúc và a11y, không phải ranking rule |
| Thứ tự tuần tự H1 → H2 → H3         | 🟠  | Không nhảy cấp (H1 → H4) vì hại screen reader và khả năng hiểu cấu trúc                                                  |
| Không dùng heading để chỉnh style   | 🟠  | Dùng CSS cho cỡ chữ                                                                                                      |
| Heading trong component lặp (card)  | 🟠  | Chọn level theo ngữ cảnh trang, không cố định `h3`                                                                       |

### 3.3. Thẻ semantic

| Thẻ                            | Dùng khi                                                 |
| ------------------------------ | -------------------------------------------------------- |
| `<main>`                       | Nội dung chính, **1 thẻ** mỗi trang                      |
| `<nav>`                        | Điều hướng; thêm `aria-label` khi có nhiều `<nav>`       |
| `<article>`                    | Nội dung độc lập (bài viết, sản phẩm, comment)           |
| `<section>`                    | Nhóm theo chủ đề, nên có heading                         |
| `<aside>`                      | Nội dung liên quan gián tiếp                             |
| `<figure>` + `<figcaption>`    | Ảnh/biểu đồ/code có chú thích                            |
| `<time datetime="2026-03-20">` | Ngày tháng, `datetime` theo ISO 8601                     |
| `<strong>`, `<em>`             | Nhấn mạnh có nghĩa; không dùng `<b>`, `<i>` để trang trí |

### 3.4. Không làm

- ❌ `<div>`/`<span>` thay cho thẻ semantic khi có thẻ phù hợp.
- ❌ `<br>` để tạo khoảng cách; `<table>` để dàn layout.
- ❌ Ẩn nội dung bằng CSS để nhồi từ khóa. (Nội dung trong tab/accordion hiển thị khi tương tác là bình thường và vẫn được index.)

---

## 4. URL Structure & Routing

### 4.1. Quy tắc URL

| Quy tắc                             | Tốt                      | Xấu                                                         |
| ----------------------------------- | ------------------------ | ----------------------------------------------------------- |
| 🔴 Một nội dung = một URL canonical | `/san-pham/ao-thun`      | cùng nội dung ở `/San-Pham/Ao-Thun` và `/san-pham/ao-thun/` |
| 🟠 Dấu gạch ngang, chữ thường       | `/bai-viet/seo-frontend` | `/Bai_Viet/SEO_Frontend`                                    |
| 🟠 Có nghĩa, ngắn                   | `/blog/toi-uu-seo`       | `/blog/post?id=12345`                                       |
| 🟠 Không extension                  | `/gioi-thieu`            | `/gioi-thieu.html`                                          |
| 📏 Độ sâu                           | ≤ 3–5 cấp                | `/a/b/c/d/e/f/bai-viet`                                     |
| 🟠 Hạn chế query param              | `/san-pham/ao-thun-nam`  | `/san-pham?id=123&ref=abc`                                  |

### 4.2. Slug tiếng Việt — 🟠 SHOULD

Slug **bỏ dấu**, `đ → d`:

```ts
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
// slugify('Tối ưu SEO cho Frontend') → 'toi-uu-seo-cho-frontend'
```

### 4.3. Trailing slash — 🔴 chọn 1 và nhất quán

Chỉ một dạng trả 200, dạng còn lại **301/308 redirect** về dạng đã chọn. Cấu hình bằng option của framework (`trailingSlash` trong Next.js/Astro/SvelteKit/Nuxt).

### 4.4. Redirect & status code

| Tình huống                          | Code                                     |
| ----------------------------------- | ---------------------------------------- |
| URL đổi vĩnh viễn                   | **301** (hoặc **308** giữ nguyên method) |
| Chuyển hướng tạm (A/B, maintenance) | **302** / **307**                        |
| Trang đã gỡ vĩnh viễn               | **410** (hoặc 404)                       |
| Trang không tồn tại                 | **404** (không trả 200 — soft 404)       |
| Bảo trì tạm thời toàn site          | **503** + `Retry-After`                  |

- 🔴 HTTP → HTTPS và www ↔ non-www: redirect vĩnh viễn, và **gộp về một bước** (`http://www.x.com` → `https://x.com` trong 1 hop).
- 🔴 Không chain redirect (A → B → C). Cập nhật link nội bộ trỏ thẳng đích.

---

## 5. Hình ảnh & Media

### 5.1. Thẻ `<img>` — 🔴 MUST

```html
<img
  src="/images/ao-thun-nam-trang.webp"
  alt="Áo thun nam cotton màu trắng, cổ tròn"
  width="800"
  height="600"
  loading="lazy"
  decoding="async"
/>
```

| Attribute              | Quy tắc                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `alt`                  | 🔴 Mô tả **nội dung ảnh** một cách tự nhiên, không nhồi từ khóa. Ảnh trang trí: `alt=""`                                                   |
| `width` + `height`     | 🔴 Luôn có (kích thước intrinsic) để tránh layout shift. Browser tự tính `aspect-ratio` từ hai attribute này, không cần `attr()` trong CSS |
| `loading="lazy"`       | 🔴 Cho ảnh **dưới màn hình đầu**. KHÔNG dùng cho ảnh LCP/above-the-fold                                                                    |
| `fetchpriority="high"` | 🔴 Chỉ cho **ảnh LCP**                                                                                                                     |
| `decoding="async"`     | 🟠 Mặc định cho ảnh không phải LCP                                                                                                         |

### 5.2. Ảnh LCP / hero — 🔴 MUST

```html
<head>
  <!-- Ảnh responsive: dùng imagesrcset/imagesizes để preload đúng kích thước -->
  <link
    rel="preload"
    as="image"
    fetchpriority="high"
    href="/img/hero-1200.webp"
    imagesrcset="/img/hero-600.webp 600w, /img/hero-1200.webp 1200w, /img/hero-1920.webp 1920w"
    imagesizes="100vw"
  />
</head>
<body>
  <img
    src="/img/hero-1200.webp"
    srcset="
      /img/hero-600.webp   600w,
      /img/hero-1200.webp 1200w,
      /img/hero-1920.webp 1920w
    "
    sizes="100vw"
    width="1920"
    height="1080"
    alt="Mô tả banner"
    fetchpriority="high"
    decoding="async"
  />
  <!-- KHÔNG có loading="lazy" -->
</body>
```

- Chỉ preload **một** ảnh LCP. Preload quá nhiều tài nguyên làm chậm LCP.
- Với framework có component ảnh, dùng prop dành cho ảnh LCP (`priority`/`preload` tùy phiên bản; kiểm tra docs).

### 5.3. Responsive images — 🟠 SHOULD

```html
<picture>
  <source
    type="image/avif"
    srcset="/img/p-400.avif 400w, /img/p-800.avif 800w"
    sizes="(max-width: 640px) 100vw, 50vw"
  />
  <source
    type="image/webp"
    srcset="/img/p-400.webp 400w, /img/p-800.webp 800w"
    sizes="(max-width: 640px) 100vw, 50vw"
  />
  <img
    src="/img/p-800.jpg"
    alt="Mô tả sản phẩm"
    width="800"
    height="600"
    loading="lazy"
    decoding="async"
  />
</picture>
```

### 5.4. Tối ưu file ảnh

| Quy tắc       | Chi tiết                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| 🟠 Format     | AVIF > WebP > JPEG/PNG (luôn có fallback). SVG cho icon/logo                                           |
| 🟠 Tên file   | Có nghĩa: `ao-thun-nam-trang.webp`, không `IMG_2026.webp`                                              |
| 📏 Dung lượng | Hero < ~200KB, content < ~100KB, thumbnail < ~30KB                                                     |
| 🟠 Kích thước | Phục vụ đúng kích thước hiển thị qua `srcset`, không scale bằng CSS                                    |
| 🟠 Image URL  | Crawlable, không bị robots.txt chặn, nằm trong HTML (không chỉ `background-image` cho ảnh có nội dung) |

### 5.5. Video & Embed

```html
<video
  poster="/img/video-thumb.webp"
  width="1280"
  height="720"
  preload="metadata"
  controls
>
  <source src="/video/demo.mp4" type="video/mp4" />
  <track
    kind="captions"
    src="/captions/vi.vtt"
    srclang="vi"
    label="Tiếng Việt"
  />
</video>
```

- 🟠 Luôn có `poster`, `<track>` phụ đề, `preload="metadata"`.
- 🟢 Thêm `VideoObject` schema nếu video là nội dung chính của trang.
- 🟠 `<iframe>` below-the-fold: `loading="lazy"`, có `width`/`height`. Embed nặng (YouTube) dùng **facade** (ảnh + nút play, chỉ tải iframe khi click).

---

## 6. Performance & Core Web Vitals

### 6.1. Mục tiêu

| Metric  | Good    | Ý nghĩa                                         |
| ------- | ------- | ----------------------------------------------- |
| **LCP** | ≤ 2.5s  | Phần tử lớn nhất trong viewport render xong     |
| **INP** | ≤ 200ms | Độ trễ phản hồi tương tác (thay FID từ 03/2024) |
| **CLS** | ≤ 0.1   | Dịch chuyển layout ngoài ý muốn                 |

- Ngưỡng được đánh giá trên **field data (người dùng thật), percentile thứ 75**, chia theo mobile/desktop. Nguồn: CrUX, Search Console, PageSpeed Insights.
- **Lab data (Lighthouse) chỉ là proxy**: Lighthouse không đo INP trực tiếp (dùng Total Blocking Time thay thế). Không thể xác nhận CWV "Good" trước khi deploy, chỉ có thể kiểm tra lab và theo dõi field sau khi deploy.
- Mobile-first: ưu tiên tối ưu cho **mobile**.

### 6.2. Tối ưu LCP — 🔴 MUST cho ảnh/phần tử LCP

LCP = TTFB + load delay + load time + render delay. Xác định phần nào chậm rồi mới tối ưu.

| Kỹ thuật                     | Chi tiết                                                                                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 SSR/SSG cho trang cần SEO | HTML đã chứa nội dung ngay từ response đầu                                                                                                                                  |
| 🔴 Ảnh LCP                   | Không lazy, có `fetchpriority="high"`, preload khi phần tử LCP được phát hiện muộn (xem 5.2)                                                                                |
| 🟠 TTFB                      | CDN, cache HTML khi có thể (SSG/ISR), nén Brotli/gzip, HTTP/2 hoặc HTTP/3                                                                                                   |
| 🟠 CSS                       | Inline critical CSS nhỏ, phần còn lại tải không chặn render                                                                                                                 |
| 🟠 JS                        | Mọi script không critical dùng `defer`/`async` hoặc dynamic `import()`                                                                                                      |
| 🟠 Font                      | `font-display: swap` (hoặc `optional`), preload tối đa 1–2 font chính, **subset đúng ngôn ngữ** (cần `vietnamese` cho tiếng Việt, thiếu subset sẽ fallback font và gây CLS) |

```html
<link
  rel="preload"
  as="font"
  type="font/woff2"
  href="/fonts/main.woff2"
  crossorigin
/>
```

### 6.3. Tối ưu INP — 🟠 SHOULD

| Kỹ thuật                 | Chi tiết                                                                                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chia long task (> 50ms)  | `scheduler.yield()` khi có, fallback `setTimeout`                                                                                                                           |
| Giảm JS gửi xuống client | Server Components, code splitting, lazy load component chưa cần                                                                                                             |
| Debounce/throttle        | Input, scroll, resize                                                                                                                                                       |
| Event delegation         | Thay vì gắn listener cho từng phần tử                                                                                                                                       |
| Việc nặng                | Đẩy sang Web Worker                                                                                                                                                         |
| Tránh forced reflow      | Không đọc layout ngay sau khi ghi                                                                                                                                           |
| **Third-party scripts**  | GTM, chat widget, pixel là nguyên nhân INP/LCP phổ biến. Tải sau tương tác/idle (`next/script` với `strategy="lazyOnload"`, hoặc Partytown), định kỳ rà soát tag không dùng |

```js
// Chia task dài, nhường main thread
async function processItems(items) {
  for (const item of items) {
    handle(item);
    if (globalThis.scheduler?.yield) await scheduler.yield();
    else await new Promise((r) => setTimeout(r, 0));
  }
}
```

### 6.4. Tối ưu CLS — 🔴 MUST

```css
/* 1. Media luôn có kích thước (width/height attribute + CSS bên dưới) */
img,
video,
iframe {
  max-width: 100%;
  height: auto;
}

/* 2. Reserve chỗ cho nội dung chèn động (quảng cáo, banner, embed) */
.ad-slot {
  min-height: 250px;
}

/* 3. Fallback font khớp metrics: override áp dụng lên FALLBACK, không phải web font */
@font-face {
  font-family: "CustomFont";
  src: url("/fonts/custom.woff2") format("woff2");
  font-display: swap;
}
@font-face {
  font-family: "CustomFont Fallback";
  src: local("Arial");
  size-adjust: 105%;
  ascent-override: 90%;
  descent-override: 20%;
  line-gap-override: 0%;
}
body {
  font-family: "CustomFont", "CustomFont Fallback", sans-serif;
}
```

- Giá trị `size-adjust`/`*-override` phải **tính theo từng font** (dùng công cụ như Fontaine, Capsize; `next/font` và `@nuxt/fonts` tự làm).
- Nội dung chèn phía trên nội dung đang xem (banner cookie, thông báo) phải dùng vị trí cố định/overlay hoặc chỗ đã reserve.
- Danh sách dài/infinite scroll: `content-visibility: auto` kèm `contain-intrinsic-size`.

### 6.5. Resource hints — 🟠 SHOULD

```html
<head>
  <link rel="preconnect" href="https://cdn.example.com" crossorigin />
  <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
  <link
    rel="preload"
    as="font"
    type="font/woff2"
    href="/fonts/main.woff2"
    crossorigin
  />
  <link rel="modulepreload" href="/js/app.mjs" />
</head>
<body>
  <script src="/js/app.js" defer></script>
  <script src="/js/analytics.js" async></script>
</body>
```

- `preconnect` chỉ cho origin **thật sự dùng sớm** (tối đa vài origin), `dns-prefetch` cho origin phụ.
- `preload` chỉ cho tài nguyên critical; thừa preload làm giảm hiệu quả.
- Cache tài nguyên có hash bằng `Cache-Control: public, max-age=31536000, immutable`; HTML dùng cache ngắn hoặc revalidate.
- Tránh `unload` handler và `Cache-Control: no-store` không cần thiết vì làm mất back/forward cache (bfcache).

---

## 7. Structured Data (Schema.org)

### 7.1. Quy tắc chung

- 🔴 Dùng **JSON-LD** trong `<script type="application/ld+json">`.
- 🔴 Dữ liệu trong schema PHẢI **khớp nội dung hiển thị** trên trang. Cấm bịa rating/review/giá.
- 🟠 Chỉ thêm schema khi **phù hợp với loại trang**, không ép mỗi trang một schema.
- 🟠 Validate bằng [Rich Results Test](https://search.google.com/test/rich-results) (cho feature có rich result) và [Schema Markup Validator](https://validator.schema.org) (cú pháp schema.org chung).
- 🟠 Khi có nhiều entity, dùng `@graph` + `@id` để liên kết (Organization ↔ WebSite ↔ WebPage ↔ Article).
- 🟠 Structured data trong React/Next: escape `<` để tránh XSS.

```tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
```

### 7.2. Loại schema nên dùng

#### Organization + WebSite (trang chủ) — 🟠

`WebSite` còn dùng để Google xác định **tên site** (site name). Không cần `SearchAction`: sitelinks search box đã bị Google gỡ từ 11/2024.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#org",
      "name": "Tên Công Ty",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png",
      "sameAs": [
        "https://www.facebook.com/company",
        "https://www.linkedin.com/company/company"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "url": "https://example.com",
      "name": "Tên Website",
      "alternateName": "Tên viết tắt",
      "publisher": { "@id": "https://example.com/#org" }
    }
  ]
}
```

#### Article (trang bài viết) — 🟠

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Tiêu đề bài viết",
  "image": [
    "https://example.com/img/16x9.jpg",
    "https://example.com/img/4x3.jpg",
    "https://example.com/img/1x1.jpg"
  ],
  "datePublished": "2026-01-15T08:00:00+07:00",
  "dateModified": "2026-03-20T10:30:00+07:00",
  "author": {
    "@type": "Person",
    "name": "Tên Tác Giả",
    "url": "https://example.com/author/tac-gia"
  },
  "publisher": { "@id": "https://example.com/#org" },
  "mainEntityOfPage": "https://example.com/bai-viet/tieu-de"
}
```

- Tác giả và ngày xuất bản/cập nhật phải **hiển thị trên trang** và khớp schema.

#### BreadcrumbList — 🟠 (chọn JSON-LD, KHÔNG dùng thêm microdata)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Trang chủ",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://example.com/blog"
    },
    { "@type": "ListItem", "position": 3, "name": "Tiêu đề bài viết" }
  ]
}
```

#### Product (e-commerce) — 🟠

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Tên Sản Phẩm",
  "image": ["https://example.com/product.jpg"],
  "description": "Mô tả sản phẩm",
  "brand": { "@type": "Brand", "name": "Tên Thương Hiệu" },
  "sku": "SKU-12345",
  "offers": {
    "@type": "Offer",
    "price": "299000",
    "priceCurrency": "VND",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/san-pham/ten-san-pham"
  }
}
```

- `price`, `availability` lấy **động** từ dữ liệu thật, không hardcode.
- `aggregateRating`/`review` chỉ thêm khi trang **hiển thị đánh giá thật** của khách hàng. Không tự chấm điểm cho chính doanh nghiệp.
- `priceValidUntil` chỉ thêm khi có thật và phải cập nhật.

#### LocalBusiness — 🟢

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Tên Cửa Hàng",
  "image": "https://example.com/storefront.jpg",
  "url": "https://example.com",
  "telephone": "+84-28-0000-0000",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Đường ABC",
    "addressLocality": "Quận 1",
    "addressRegion": "TP. Hồ Chí Minh",
    "addressCountry": "VN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 10.7769,
    "longitude": 106.7009
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    }
  ]
}
```

### 7.3. Không dùng làm mục tiêu SEO

| Schema                     | Tình trạng                                                                                                                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FAQPage`                  | **Google đã ngừng hiển thị FAQ rich results từ 07/05/2026.** Không thêm vào chỉ để lấy rich result. Markup có sẵn không gây hại; nếu trang có FAQ thật, hiển thị nội dung cho người dùng là đủ |
| `HowTo`                    | Rich result đã bị gỡ                                                                                                                                                                           |
| `WebSite` + `SearchAction` | Sitelinks search box đã bị gỡ (11/2024)                                                                                                                                                        |

> Google thay đổi/khai tử feature thường xuyên. Trước khi thêm schema chỉ để lấy rich result, **kiểm tra danh sách feature còn hỗ trợ** tại Google Search Central (Search Gallery).

---

## 8. Internal Linking & Navigation

### 8.1. Link crawlable — 🔴 MUST

Google chỉ theo dõi link là `<a href="URL">` với URL thật.

```tsx
// ❌ KHÔNG crawl được
<div onClick={() => router.push('/blog/seo')}>Bài viết SEO</div>
<a href="#" onClick={go}>Bài viết SEO</a>
<a href="javascript:go()">Bài viết SEO</a>
// URL dạng hash: example.com/#/blog/seo

// ✅ Crawl được
<Link href="/blog/seo">Hướng dẫn SEO Frontend</Link>   // Next.js
<a href="/blog/seo">Hướng dẫn SEO Frontend</a>
```

- Dùng `<Link>`/`<NuxtLink>`/`<RouterLink>` của framework (render ra `<a href>`) cho điều hướng nội bộ.
- Dùng `<button>` cho hành động (mở modal, submit), `<a>` cho điều hướng.
- Routing dùng **History API** (path thật), không hash routing.

### 8.2. Quy tắc link

| Quy tắc                              | Mức | Chi tiết                                                                                                                                                                          |
| ------------------------------------ | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anchor text mô tả                    | 🟠  | Tránh "Xem thêm", "Tại đây", "Click here" khi đứng một mình                                                                                                                       |
| Link hỏng                            | 🔴  | Không để link nội bộ trả 404. Kiểm tra định kỳ                                                                                                                                    |
| Trang mồ côi                         | 🟠  | Mọi trang quan trọng có ít nhất một link nội bộ trỏ tới                                                                                                                           |
| 📏 Độ sâu                            |     | Trang quan trọng nên trong ≤ 3 click từ trang chủ                                                                                                                                 |
| Link trả phí/quảng cáo               | 🔴  | `rel="sponsored"`                                                                                                                                                                 |
| Link người dùng tạo (comment, forum) | 🔴  | `rel="ugc"`                                                                                                                                                                       |
| Link ngoài không tin cậy             | 🟠  | `rel="nofollow"`                                                                                                                                                                  |
| `target="_blank"`                    | 🟠  | Trình duyệt hiện đại đã ngầm `noopener`. Thêm `rel="noopener"` cho an toàn với trình duyệt cũ; chỉ thêm `noreferrer` khi thật sự cần ẩn referrer (nó sẽ mất referrer attribution) |

### 8.3. Breadcrumb — 🟠 SHOULD (trang có cấp bậc, bỏ qua trang chủ)

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Trang chủ</a></li>
    <li><a href="/blog">Blog</a></li>
    <li aria-current="page">Bài viết hiện tại</li>
  </ol>
</nav>
```

HTML breadcrumb **kèm JSON-LD BreadcrumbList** ở mục 7.2 (không thêm microdata cho cùng breadcrumb).

### 8.4. Pagination

- 🔴 Mỗi trang phân trang có **URL riêng** và nối nhau bằng `<a href>` thật (`/blog?page=2` hoặc `/blog/page/2`).
- 🔴 **Self-canonical** cho từng trang. KHÔNG canonical về trang 1.
- 🟠 Mỗi trang indexable, title khác nhau ("Blog — Trang 2 | Brand"). Không `noindex` mặc định.
- 🟠 "Load more"/infinite scroll PHẢI có URL phân trang tương ứng để bot truy cập được, vì nội dung chỉ tải sau click/scroll sẽ không được index.
- `rel="prev"`/`rel="next"` Google không dùng; để tùy chọn.

### 8.5. Faceted navigation / filter (e-commerce) — 🟠

- Quyết định theo **giá trị tìm kiếm**: tổ hợp filter có nhu cầu tìm kiếm (ví dụ "áo thun nam trắng") → URL sạch, indexable, canonical riêng, nằm trong sitemap. Tổ hợp còn lại (sort, giá, nhiều filter) → canonical về trang gốc hoặc `noindex`, hoặc chặn crawl bằng robots.txt (chọn một, đừng kết hợp `Disallow` với `noindex`).
- Tham số theo dõi (`utm_*`, `ref`) không được tạo URL indexable.

---

## 9. Crawlability & Indexability

### 9.1. robots.txt — 🔴 MUST

```txt
# https://example.com/robots.txt
User-agent: *
Disallow: /admin/
Disallow: /private/
Disallow: /cart
Disallow: /checkout

Sitemap: https://example.com/sitemap.xml
```

- 🔴 **KHÔNG chặn** CSS, JS, ảnh, font, `/_next/`, `/_nuxt/`, hay endpoint dữ liệu (`/api/`, `*.json`) mà trang cần để render. Chặn các tài nguyên này làm Google render sai trang.
- 🔴 `robots.txt` **không ngăn index**: URL bị chặn vẫn có thể xuất hiện trong kết quả nếu có link trỏ tới. Để loại khỏi index dùng `noindex` (và đừng `Disallow` URL đó).
- 🔴 Production không được có `Disallow: /`. Staging thì dùng authentication.
- 🟠 Mặc định cho phép crawl (`Allow: /` là thừa). Chỉ `Disallow` thứ thật sự không cần crawl.
- 🟢 **AI crawlers**: quyết định chặn/cho phép (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `CCBot`, `Google-Extended`…) là **quyết định của chủ site**; agent không tự chặn. Lưu ý `Google-Extended` không ảnh hưởng thứ hạng Google Search.

### 9.2. XML Sitemap — 🔴 MUST

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://example.com/blog/seo-frontend</loc>
    <lastmod>2026-03-15</lastmod>
    <image:image>
      <image:loc>https://example.com/images/seo-frontend.webp</image:loc>
    </image:image>
  </url>
</urlset>
```

| Quy tắc                        | Chi tiết                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| 🔴 Tự động sinh                | Từ routing/CMS, không hardcode                                                        |
| 🔴 Chỉ URL tốt                 | Chỉ URL **canonical, trả 200, indexable**. Không redirect, không `noindex`, không 404 |
| 🟠 `lastmod`                   | Chỉ cập nhật khi nội dung **thực sự thay đổi**                                        |
| 🟠 Bỏ `changefreq`, `priority` | Google bỏ qua cả hai                                                                  |
| 🟠 Image sitemap               | Chỉ cần `image:loc` (các tag `title`/`caption` đã bị deprecate)                       |
| 📏 Giới hạn                    | Tối đa 50,000 URL hoặc 50MB (chưa nén) mỗi file; site lớn dùng sitemap index          |
| 🟠 Đăng ký                     | Search Console + Bing Webmaster Tools; khai báo `Sitemap:` trong robots.txt           |
| 🟢 IndexNow                    | Bing, Yandex hỗ trợ giao thức IndexNow để báo URL mới/đổi                             |

### 9.3. Trang 404 & lỗi — 🔴 MUST

- Trang không tồn tại PHẢI trả HTTP **404** (không trả 200 — soft 404). Với SSR dùng API của framework (`notFound()` Next.js, `error({ statusCode: 404 })` Nuxt…).
- Trang 404 tùy chỉnh gợi ý điều hướng (trang chủ, tìm kiếm, link phổ biến).
- Lỗi server: **5xx**; bảo trì: **503** + `Retry-After`. Không trả 200 kèm "Đã xảy ra lỗi".

### 9.4. JavaScript SEO — 🔴 MUST

- Nội dung chính, `<title>`, meta, canonical, JSON-LD phải có trong **HTML trả về từ server** (hoặc ít nhất render được ổn định bởi Googlebot). Kiểm tra bằng `curl` (xem 15.3).
- Nội dung chỉ xuất hiện sau **click, hover, scroll event** sẽ không được index; ưu tiên có trong DOM ban đầu (accordion/tab ẩn bằng CSS thì vẫn index được).
- Dữ liệu fetch phía client lúc render phải nằm trong endpoint không bị robots.txt chặn.
- Không dựa vào `#fragment` để phân biệt nội dung.
- Với Googlebot, tránh yêu cầu quyền (camera, location, cookie) hoặc chờ tương tác để hiển thị nội dung.

### 9.5. HTML Sitemap — 🟢 MAY

Trang `/sitemap` dạng danh sách link có cấu trúc, hữu ích cho site lớn và người dùng.

---

## 10. Mobile & Responsive

Google dùng **mobile-first indexing**: phiên bản mobile là phiên bản được index.

| Quy tắc             | Mức | Chi tiết                                                                                |
| ------------------- | --- | --------------------------------------------------------------------------------------- |
| Responsive, 1 URL   | 🔴  | Một URL cho mọi thiết bị; tránh `m.example.com`                                         |
| Nội dung ngang bằng | 🔴  | Mobile phải có **cùng nội dung chính, meta, structured data** như desktop               |
| Viewport            | 🔴  | Xem 1.4                                                                                 |
| Không scroll ngang  | 🟠  | Nội dung vừa viewport                                                                   |
| Interstitial        | 🟠  | Không popup che toàn bộ nội dung khi vào trang (banner cookie/pháp lý hợp lệ được miễn) |
| 📏 Touch target     | 🟠  | ~48×48px, khoảng cách ~8px (WCAG 2.2 AA tối thiểu 24×24px)                              |
| 📏 Font             | 🟠  | Body ≥ 16px; input ≥ 16px để iOS không tự zoom                                          |

```css
/* Chỉ áp cho control độc lập, KHÔNG áp cho mọi a/input (làm hỏng link inline, checkbox, radio) */
.btn,
.nav-link,
.icon-button {
  min-height: 48px;
  min-width: 48px;
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}
```

---

## 11. Accessibility → SEO

> a11y **không phải ranking factor trực tiếp**. Lợi ích SEO là gián tiếp: HTML semantic giúp crawler hiểu cấu trúc, UX tốt giữ chân người dùng. Làm a11y vì người dùng, không vì điểm xếp hạng.

| Quy tắc                                        | Mức |
| ---------------------------------------------- | --- |
| `alt` cho ảnh (decorative: `alt=""`)           | 🔴  |
| `<html lang>` đúng                             | 🔴  |
| Form: mọi input có `<label>` hoặc `aria-label` | 🟠  |
| Contrast ≥ 4.5:1 (text), ≥ 3:1 (text lớn)      | 🟠  |
| Focus visible cho mọi phần tử tương tác        | 🟠  |
| Dùng HTML native trước, ARIA khi cần           | 🟠  |
| Skip link đầu `<body>`                         | 🟠  |

```html
<a href="#main-content" class="skip-link"
  >Bỏ qua điều hướng, đến nội dung chính</a
>
<main id="main-content" tabindex="-1">…</main>

<style>
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    padding: 8px 16px;
    background: #005fcc;
    color: #fff;
    z-index: 100;
  }
  .skip-link:focus {
    top: 0;
  }
</style>
```

---

## 12. Internationalization (i18n)

### 12.1. Hreflang — 🔴 khi site có nhiều phiên bản ngôn ngữ

```html
<link rel="alternate" hreflang="vi" href="https://example.com/vi/bai-viet" />
<link rel="alternate" hreflang="en" href="https://example.com/en/article" />
<link
  rel="alternate"
  hreflang="x-default"
  href="https://example.com/en/article"
/>
```

| Quy tắc        | Chi tiết                                                          |
| -------------- | ----------------------------------------------------------------- |
| Đối xứng       | A trỏ B thì B phải trỏ lại A                                      |
| Self-reference | Mỗi trang có hreflang trỏ về **chính nó**                         |
| `x-default`    | Trang mặc định khi không khớp ngôn ngữ                            |
| URL            | Absolute, **khớp canonical** của từng phiên bản                   |
| Mã             | ngôn ngữ ISO 639-1 (`vi`, `en`), tùy chọn vùng (`en-US`, `pt-BR`) |
| Vị trí         | `<head>`, HTTP header hoặc sitemap (chọn một cách)                |

### 12.2. Quy tắc nội dung đa ngôn ngữ

- 🔴 Mỗi ngôn ngữ có **URL riêng** (`/vi/`, `/en/` hoặc subdomain/ccTLD).
- 🔴 KHÔNG đổi ngôn ngữ chỉ bằng cookie/JS, và KHÔNG auto-redirect theo IP/`Accept-Language` chặn bot vào các phiên bản khác. Chỉ gợi ý (banner) cho người dùng.
- 🟠 `<html lang>` khớp ngôn ngữ trang; Bing còn dựa nhiều vào `lang` và nội dung hơn là hreflang.
- 🟠 Dịch cả title, description, alt, URL slug, structured data.

---

## 13. Security

> Security headers **không phải tín hiệu SEO**, nhưng site bị hack/mixed content sẽ bị cảnh báo và mất traffic.

### 13.1. HTTPS — 🔴 MUST

- Toàn site HTTPS (tín hiệu nhẹ về ranking), redirect HTTP → HTTPS bằng 301/308.
- Không mixed content (mọi tài nguyên tải qua HTTPS).

### 13.2. Headers — 🟠 SHOULD

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

- Chỉ thêm `preload` cho HSTS khi chắc chắn mọi subdomain đều HTTPS (khó rút lại).
- `X-Frame-Options`/`frame-ancestors`: chặn embed trừ khi site cần cho phép nhúng.
- **CSP**: xây dựng theo nhu cầu thực tế của site (font, analytics, CDN ảnh, inline style/script bằng nonce/hash). Một CSP quá chặt kiểu `default-src 'self'` sẽ làm hỏng inline critical CSS, Google Fonts, analytics và ảnh CDN; `'unsafe-inline'` cho script làm CSP mất tác dụng. Thử ở chế độ `Content-Security-Policy-Report-Only` trước.

---

## 14. Framework-Specific Rules

### 14.1. Next.js (App Router)

```tsx
// app/layout.tsx — KHÔNG đặt `alternates.canonical` ở đây (sẽ bị kế thừa cho mọi trang)
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: { template: "%s | Brand Name", default: "Brand Name — Mô tả ngắn" },
  description: "Mô tả website",
  openGraph: { type: "website", locale: "vi_VN", siteName: "Brand Name" },
};
```

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // params là Promise: PHẢI await
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` }, // mỗi trang tự khai báo
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: post.image, width: 1200, height: 630 }],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound(); // trả HTTP 404 thật
  return (
    <article>
      <h1>{post.title}</h1>
      {/* … */}
    </article>
  );
}
```

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  return [
    { url: "https://example.com/", lastModified: new Date() },
    ...posts.map((p) => ({
      url: `https://example.com/blog/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
```

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";
  return isProd
    ? {
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin/", "/private/"],
        },
        sitemap: "https://example.com/sitemap.xml",
      }
    : { rules: { userAgent: "*", disallow: "/" } }; // chỉ cho môi trường không phải production
}
```

| Quy tắc                                                                                            | Mức |
| -------------------------------------------------------------------------------------------------- | --- |
| `await params`/`searchParams` trong `generateMetadata` và page                                     | 🔴  |
| Canonical theo từng page, không đặt ở root layout                                                  | 🔴  |
| `notFound()` cho dữ liệu không tồn tại                                                             | 🔴  |
| Dùng `metadata`/`generateMetadata`, `sitemap.ts`, `robots.ts`                                      | 🟠  |
| `next/image` (đặt prop LCP đúng theo phiên bản), `next/font` (tự có fallback metrics), `next/link` | 🟠  |
| `generateStaticParams` cho route động cần SSG; ISR bằng `revalidate`                               | 🟠  |
| Server Components mặc định, `'use client'` khi cần                                                 | 🟠  |
| JSON-LD qua component `JsonLd` (mục 7.1)                                                           | 🟠  |

### 14.2. Nuxt 3/4

```vue
<script setup lang="ts">
const route = useRoute();
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`);
if (!post.value)
  throw createError({ statusCode: 404, statusMessage: "Not Found" });

useSeoMeta({
  title: post.value.title,
  description: post.value.excerpt,
  ogTitle: post.value.title,
  ogDescription: post.value.excerpt,
  ogImage: post.value.image,
  ogType: "article",
  twitterCard: "summary_large_image",
});
useHead({
  link: [
    { rel: "canonical", href: `https://example.com/blog/${route.params.slug}` },
  ],
});
</script>
```

- 🔴 Giữ `ssr: true` cho trang cần SEO. 🟠 Dùng `useSeoMeta` (type-safe), `NuxtLink`, `NuxtImg`, `routeRules` cho prerender/ISR. Có thể dùng module Nuxt SEO (sitemap, robots, schema) thay vì tự viết.

### 14.3. Astro

```astro
---
// src/pages/blog/[slug].astro
import { getCollection, render } from 'astro:content';
import Layout from '../../layouts/Layout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);   // Astro cũ: await post.render()
const canonical = new URL(Astro.url.pathname, Astro.site).href;
---
<Layout title={post.data.title} description={post.data.excerpt} canonical={canonical}>
  <article>
    <h1>{post.data.title}</h1>
    <Content />
  </article>
</Layout>
```

- 🟠 Cấu hình `site` trong `astro.config`, dùng `@astrojs/sitemap`, `astro:assets` cho ảnh, hydrate bằng `client:*` chỉ khi cần, static mặc định.

### 14.4. SvelteKit, Remix/React Router, Angular, Gatsby

| Framework                                    | Metadata                                                                | Lưu ý SEO                                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **SvelteKit**                                | `<svelte:head>` trong `+page.svelte` (title, meta, canonical)           | SSR mặc định; `export const prerender = true` cho trang tĩnh; sitemap/robots qua `+server.ts`; cấu hình `trailingSlash` |
| **Remix / React Router v7 (framework mode)** | export `meta()` (trả mảng descriptor) và `links()` (canonical) từ route | Dùng loader trả `Response` 404 (`throw data(null, { status: 404 })`) cho trang không tồn tại; `<Link>` cho điều hướng   |
| **Angular**                                  | `Title` và `Meta` service của `@angular/platform-browser`               | Bật SSR/prerender (`@angular/ssr`) cho trang cần SEO; CSR thuần rất khó SEO; dùng `routerLink` (render `<a href>`)      |
| **Gatsby**                                   | `export const Head = () => <>…</>` (Head API)                           | Dự án mới nên cân nhắc Next.js/Astro; dự án cũ vẫn tuân thủ các rule chung                                              |

### 14.5. SPA thuần (React/Vue CSR)

> ⚠️ SPA CSR phụ thuộc Google render JS: chậm hơn, tốn crawl budget và kém ổn định. **Ưu tiên SSR/SSG** (Next.js, Nuxt, Astro, SvelteKit, Remix).

| Giải pháp            | Chi tiết                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 SSR/SSG           | Giải pháp đúng cho trang cần SEO                                                                                                               |
| 🟠 Prerender         | Cho trang tĩnh nhỏ, bằng build-time prerender (Vite plugin SSG, `vite-ssg`…). Rendertron đã ngừng duy trì, `react-snap` ít cập nhật            |
| ⚠️ Dynamic rendering | Google coi là **workaround**, không khuyến nghị lâu dài; dễ lệch nội dung thành cloaking                                                       |
| Meta tags            | React 19 hỗ trợ `<title>`/`<meta>`/`<link>` trực tiếp trong component; hoặc `react-helmet-async`. Vue: `@unhead/vue` (kế nhiệm `@vueuse/head`) |
| 🔴 Link & routing    | `<a href>` thật + History API (xem 8.1)                                                                                                        |
| 🔴 404               | Server phải trả 404 thật cho URL không tồn tại (không fallback `index.html` với 200 cho mọi URL)                                               |

---

## 15. SEO Testing & Validation

### 15.1. Checklist trước khi merge/deploy

**Kiểm tra bằng lab/CI (🔴 MUST):**

- [ ] Mỗi trang indexable có `<title>` unique, description có ý nghĩa, **self-canonical absolute**
- [ ] Canonical **không bị kế thừa sai** (kiểm tra ≥ 3 trang khác nhau)
- [ ] Không có `noindex` ngoài ý muốn; không `Disallow: /` ở production
- [ ] Nội dung chính, title, canonical, JSON-LD có trong **raw HTML** (`curl`)
- [ ] Trang không tồn tại trả **HTTP 404**
- [ ] Ảnh có `alt`, `width`, `height`; ảnh LCP **không lazy**, có `fetchpriority="high"`
- [ ] Link điều hướng là `<a href>`; không link nội bộ 404; không redirect chain
- [ ] Sitemap chỉ chứa URL canonical 200 indexable; robots.txt khai báo sitemap
- [ ] Structured data hợp lệ và khớp nội dung hiển thị
- [ ] HTTPS, không mixed content; `<html lang>` đúng
- [ ] Lighthouse SEO ≥ 95 (📏), Accessibility ≥ 90–95 (📏), Performance mobile ≥ 90 (📏)

**Theo dõi sau khi deploy (field):** CWV (LCP/INP/CLS) đạt Good ở percentile 75 trong Search Console/CrUX → xem [mục 16](#16-monitoring-liên-tục).

### 15.2. Công cụ

| Công cụ                                             | Mục đích                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| Google Search Console → **URL Inspection**          | Xem HTML đã render, canonical Google chọn, trạng thái index      |
| Search Console: Indexing, Core Web Vitals, Sitemaps | Giám sát index và CWV (field data)                               |
| PageSpeed Insights                                  | Lab + field (CrUX)                                               |
| Lighthouse / Chrome DevTools (kể cả device mode)    | Audit SEO, Performance, a11y; thay Mobile-Friendly Test đã bị gỡ |
| Rich Results Test, Schema Markup Validator          | Structured data                                                  |
| Bing Webmaster Tools                                | Index/crawl trên Bing; hỗ trợ IndexNow                           |
| Screaming Frog, `linkinator`                        | Crawl site, tìm link hỏng, redirect chain                        |
| Facebook Sharing Debugger                           | Kiểm tra/làm mới OG (cũng hữu ích cho Messenger)                 |
| Zalo                                                | Dán link vào chat Zalo để kiểm tra preview và cache OG           |
| WAVE, axe DevTools                                  | Accessibility                                                    |

### 15.3. Lệnh kiểm tra nhanh

```bash
# Raw HTML có title, canonical, description, H1, JSON-LD không?
curl -s https://example.com/blog/bai-viet | grep -Ei '<title|rel="canonical"|name="description"|<h1|application/ld\+json'

# Status code và header (kiểm tra 404 thật, X-Robots-Tag, redirect)
curl -sI https://example.com/trang-khong-ton-tai | head -n 5
curl -sIL http://example.com | grep -Ei '^(HTTP|location)'     # redirect chain

# Link hỏng nội bộ
npx linkinator https://example.com --recurse --skip "^(?!https://example.com)"
```

### 15.4. Tự động hóa bằng CI (Lighthouse CI)

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run start",
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/blog/bai-viet-mau"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:seo": ["error", { "minScore": 0.95 }],
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "categories:accessibility": ["warn", { "minScore": 0.95 }],
        "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 200 }]
      }
    }
  }
}
```

> Điểm Lighthouse SEO 100 **không** có nghĩa SEO tốt: nó chỉ kiểm tra các điều kiện cơ bản. Vẫn phải kiểm tra thủ công canonical, indexability, nội dung render và structured data.

---

## 16. Monitoring liên tục

- [ ] **Hàng tuần:** Core Web Vitals (field), Indexing issues, Crawl stats trong Search Console
- [ ] **Hàng tuần:** Xếp hạng từ khóa chính
- [ ] **Hàng tháng:** Link hỏng, structured data errors, trang bị loại khỏi index bất ngờ
- [ ] **Sau mỗi release lớn:** Kiểm tra lại canonical, robots, sitemap, `noindex`
- [ ] **Định kỳ:** Rà soát tài liệu Google Search Central để cập nhật feature bị gỡ/thay đổi
- [ ] A/B test title + description cho trang quan trọng (chỉ đổi từng thay đổi một)

---

## 📋 Tóm tắt ưu tiên

| Ưu tiên     | Hạng mục                                                                                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 Critical | Nội dung có trong HTML server-render, canonical đúng, không `noindex`/`Disallow` nhầm, status code đúng (200/301/404), link `<a href>`, sitemap sạch, HTTPS, mobile parity, ảnh LCP + CLS |
| 🟠 High     | Title/description unique, Core Web Vitals (field), structured data đúng loại và đúng dữ liệu, alt text, hreflang (nếu đa ngôn ngữ), pagination indexable                                  |
| 🟡 Medium   | Open Graph, internal linking, breadcrumb, semantic HTML                                                                                                                                   |
| 🟢 Optional | Skip link, HTML sitemap, IndexNow, kiểm soát AI crawler, security headers (không phải SEO)                                                                                                |

---

## 📝 Changelog

**2.0.0 (2026-10-06)** — Rà soát toàn bộ:

- Thêm hệ thống mức độ MUST/SHOULD/MAY/Heuristic và quy trình cho agent.
- Sửa: charset (1024 byte), canonical bị kế thừa ở root layout, `params` Promise (Next.js), pagination không `noindex`, mô tả `max-snippet`, ranking claim của meta description/a11y/H1, favicon 48px, CSP, font fallback, `aspect-ratio: attr()`, Astro `render`/`getStaticPaths`.
- Gỡ/lỗi thời: FAQPage rich results (đã ngừng 05/2026), SearchAction, `changefreq`/`priority`, Mobile-Friendly Test, Flash, dynamic rendering/Rendertron.
- Thêm: link crawlable, JS SEO, faceted navigation, slug tiếng Việt, subset font, third-party scripts, TTFB/bfcache, AI crawlers, IndexNow, `@graph`, lệnh kiểm tra, Lighthouse CI, thêm SvelteKit/Remix/Angular/Gatsby.

**1.0.0 (2026-10-06)** — Bản đầu tiên.
