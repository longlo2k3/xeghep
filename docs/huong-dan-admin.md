# Hướng dẫn sử dụng Admin CMS — Xe Ghép Liên Tỉnh (xeghep24h.vn)

> Tài liệu thao tác chi tiết cho hệ thống quản trị tùy chỉnh tại **`/admin`**.
> Viết theo đúng giao diện thực tế đang chạy (đối chiếu source `src/admin/`), không theo文案 quảng cáo.
> Phiên bản CMS: **v1.2.0**. Cập nhật: 2026-11-09.

---

## Mục lục

1. [Truy cập & đăng nhập](#1-truy-cập--đăng-nhập)
2. [Phân quyền theo vai trò](#2-phân-quyền-theo-vai-trò)
3. [Giao diện chung & phím tắt](#3-giao-diện-chung--phím-tắt)
4. [Tổng quan (Dashboard)](#4-tổng-quan-dashboard)
5. [Đơn đặt xe](#5-đơn-đặt-xe)
6. [Tuyến đường & Giá](#6-tuyến-đường--giá)
7. [Bài viết](#7-bài-viết)
8. [Danh mục bài viết](#8-danh-mục-bài-viết)
9. [Trang nội dung](#9-trang-nội-dung)
10. [Thư viện Media](#10-thư-viện-media)
11. [Chuyển hướng 301 & Giám sát Sitemap](#11-chuyển-hướng-301--giám-sát-sitemap)
12. [Bảng giá phụ & Cước mở rộng](#12-bảng-giá-phụ--cước-mở-rộng)
13. [Cấu hình chung](#13-cấu-hình-chung)
14. [Quản lý tài khoản](#14-quản-lý-tài-khoản)
15. [Cẩm nang & Trợ giúp trong admin](#15-cẩm-nang--trợ-giúp-trong-admin)
16. [Can thiệp dữ liệu nâng cao (Payload gốc)](#16-can-thiệp-dữ-liệu-nâng-cao-payload-gốc)
17. [Quy trình vận hành một ngày](#17-quy-trình-vận-hành-một-ngày)
18. [SEO, cache & thời điểm thay đổi hiển thị](#18-seo-cache--thời-điểm-thay-đổi-hiển-thị)
19. [Phụ lục: URL công khai, trạng thái, sự cố](#19-phụ-lục)

---

## 1. Truy cập & đăng nhập

| Mục | Giá trị |
| --- | --- |
| Địa chỉ admin | `https://xeghep24h.vn/admin` |
| Trang đăng nhập | `https://xeghep24h.vn/admin/login` |
| Tài khoản | Email + mật khẩu do Quản trị viên cấp |
| Phiên đăng nhập | Cookie `cms_admin_token`; tự đưa về `/login` khi hết hạn (401) |

**Các bước đăng nhập**

1. Mở `/admin/login`.
2. Nhập **Địa chỉ Email** và **Mật khẩu** (bấm biểu tượng con mắt để hiện/ẩn mật khẩu).
3. Tích **Ghi nhớ tài khoản** nếu muốn lần sau tự điền email (chỉ lưu email, không lưu mật khẩu).
4. Bấm **Đăng nhập**. Thành công sẽ chuyển tới **Tổng quan** (hoặc trang bạn đang định mở trước đó).

**Lỗi thường gặp**

- `Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại.` → kiểm tra email/mật khẩu; mật khẩu bị xóa trắng sau mỗi lần thất bại, email được giữ.
- Bị đẩy về `/login` liên tục → phiên hết hạn hoặc tài khoản bị đổi mật khẩu/xóa.

> Sau khi đăng nhập, mọi trang đều nằm trong khung `DashboardLayout` (sidebar trái + header trên). Trang không tồn tại trả về màn hình **404 — Trang không tồn tại** kèm nút **Về Bảng điều khiển**. Truy cập trang ngoài quyền hạn trả về **403 — Bạn không có quyền truy cập trang này**.

---

## 2. Phân quyền theo vai trò

Hệ thống có **3 vai trò** (RBAC). Sidebar tự ẩn menu không thuộc quyền; cố tình mở URL vẫn bị chặn bởi `RoleGuard`.

| Vai trò | Nhãn hiển thị | Màu | Phạm vi |
| --- | --- | --- | --- |
| `admin` | Quản trị viên | Hồng (rose) | Toàn quyền mọi phân hệ |
| `editor` | Biên tập viên | Xanh lá (emerald) | Nội dung & SEO: tuyến, bài viết, danh mục, trang, media, redirects |
| `dispatcher` | Điều phối viên | Hổ phách (amber) | Vận hành: đơn đặt xe, bảng giá phụ, tổng quan |

**Ma trận truy cập thực tế** (theo `src/admin/routes/index.tsx`)

| Phân hệ | admin | editor | dispatcher |
| --- | :---: | :---: | :---: |
| Tổng quan | ✅ | ✅ | ✅ |
| Đơn đặt xe | ✅ | ✅* | ✅ |
| Tuyến đường & Giá | ✅ | ✅ | ❌ |
| Bài viết / Danh mục / Trang / Media / Redirects | ✅ | ✅ | ❌ |
| Bảng giá phụ (`/pricing`) | ✅ | ❌ | ✅** |
| Cấu hình chung (`/settings`) | ✅ | ❌ | ❌ |
| Quản lý tài khoản (`/users`) | ✅ | ❌ | ❌ |
| Cẩm nang & Trợ giúp (`/help`) | ✅ | ✅ | ✅ |

\* **Đơn đặt xe với editor:** route guard cho phép editor mở, nhưng sidebar ẩn menu này khỏi editor. Editor xem được đơn nhưng **số điện thoại khách bị che** (`0962***293`). Dispatcher/admin thấy số đầy đủ.

\** **Bảng giá phụ với dispatcher:** dispatcher mở xem được, nhưng thao tác **Lưu** bị backend từ chối (quyền ghi chỉ admin) → báo `Bạn không có quyền truy cập hoặc thực hiện thao tác này.` Muốn sửa giá, dùng tài khoản admin.

---

## 3. Giao diện chung & phím tắt

### Sidebar (thanh trái)

- Thương hiệu: **Xe Ghép Liên Tỉnh / Admin CMS**.
- 4 nhóm: **TRANG CHÍNH**, **VẬN HÀNH XE**, **NỘI DUNG & SEO**, **HỆ THỐNG**.
- 10 menu: Tổng quan · Đơn đặt xe (gắn nhãn **Ưu tiên**) · Tuyến đường & Giá · Bài viết · Danh mục bài viết · Trang nội dung · Thư viện Media · Chuyển hướng 301 · Cấu hình chung · Quản lý tài khoản.
- Cuối sidebar: nút **Hướng dẫn & Trợ giúp** (chip `CMS`) → `/help`, và thẻ người dùng (tên/email + badge vai trò).
- Desktop: sidebar **mở mặc định**, trạng thái nhớ trong `localStorage`. Mobile (<1024px): dạng ngăn kéo, bấm nền tối hoặc `Esc` để đóng.

### Header (thanh trên, dính khi cuộn)

- Nút mở/đóng sidebar.
- Breadcrumb `CMS` + tên trang hiện tại.
- Ô **Tìm kiếm nhanh...** (mở Command Palette).
- Nút **Tạo mới** (admin/editor): xổ xuống **Tuyến đường mới**, **Bài viết mới**, **Trang nội dung mới**.
- Nút **Trợ giúp** → `/help`.
- Nút **Đăng xuất** → hộp thoại xác nhận **Đăng xuất khỏi hệ thống** (confirm **Đăng xuất**, hủy **Ở lại**).

### Phím tắt

| Phím | Tác dụng |
| --- | --- |
| `Ctrl + K` / `Cmd + K` | Mở **Command Palette** (tìm chức năng/trang) |
| `Ctrl + B` / `Cmd + B` | Ẩn/hiện sidebar |
| `Esc` | Đóng palette / modal / ngăn kéo mobile |
| `↑` `↓` + `Enter` | Di chuyển và chọn trong Command Palette |

### Command Palette

Ô tìm: `Tìm kiếm chức năng, đơn đặt xe, tuyến đường, bài viết...`. Ba nhóm: **Thao tác nhanh**, **Trang quản trị**, **Trợ giúp** (14 mục, lọc theo vai trò).

> **Lưu ý:** Palette chỉ **điều hướng** tới trang/chức năng, **không tìm kiếm bản ghi** (không ra đơn hàng/bài viết cụ thể). Muốn tìm đơn → dùng ô tìm trong trang Đơn đặt xe.

### Thông báo đơn mới (chuông)

- Nút **Chuông: Bật / Tắt** ở Tổng quan và Đơn đặt xe.
- Khi bật: có đơn mới sẽ phát **âm báo** (Web Audio), hiện **Notification trình duyệt** `🚖 Có đơn đặt xe mới!` (nếu đã cấp quyền), và toast 10 giây.
- Mặc định **BẬT**; trạng thái nhớ trong `localStorage`. Bật chuông lần đầu sẽ xin quyền Notification.

---

## 4. Tổng quan (Dashboard)

Đường dẫn: `/admin` hoặc `/admin/dashboard`. Vai trò: tất cả.

**Thành phần thực tế**

- Lời chào `Xin chào, {tên}!` + badge vai trò.
- Nút: **Chuông: Bật/Tắt**, **Hướng dẫn người mới** (→ `/help`), **Làm mới**.
- **Banner đơn mới** (hổ phách, nhấp nháy): `🔔 Có đơn đặt xe mới trực tuyến!` — tự ẩn sau 10s.
- **Checklist khởi đầu nhanh** (4 bước theo vai trò, có tiến độ %): thiết lập tuyến → quy trình đơn → đăng bài → cấu hình hotline. Có thể thu gọn / tạm ẩn.
- **4 thẻ KPI** (đếm từ mẫu 100 bản ghi mới nhất):

| Thẻ | Ý nghĩa | Màu |
| --- | --- | --- |
| **Chờ xác nhận** | Đơn mới đang chờ duyệt (ưu tiên số 1) | Hổ phách, chấm ping |
| **Tuyến xe hoạt động** | Tuyến đang mở nhận khách | Xanh |
| **Bài viết xuất bản** | Cẩm nang/tin tức trực tuyến | Xanh lá |
| **Đơn hoàn thành** | Chuyến thành công | Xanh lá |

- **Lối tắt nhanh**: Duyệt đơn đặt xe (kèm số lượng) · Tạo tuyến đường mới · Viết bài mới · Thư viện Media · Cấu hình hệ thống (admin).
- Widget **Đơn đặt xe mới nhất cần xử lý**: 5 đơn Pending gần nhất, nút **Xem & Xử lý** từng dòng, link **Xem tất cả**.
- Widget **Tuyến xe nổi bật (Banner Top)**: các tuyến được ghim, nhãn banner, cự ly, giá, nút sửa nhanh.
- Khối **3 Mẹo Vàng Vận Hành**.

> **Khác biệt cần biết:** Giao diện Tổng quan hiện **không có biểu đồ** và **không có bộ lọc "Hôm nay / 7 ngày / Tháng này"** như文案 trợ giúp nội bộ mô tả. Số liệu là đếm nhanh từ 100 bản ghi mới nhất, tự cập nhật đơn mỗi **15 giây** (tuyến/bài viết chỉ nạp khi bấm Làm mới).

**Mẹo đầu ca:** nhìn thẻ **Chờ xác nhận** → bấm **Duyệt đơn đặt xe** để gọi khách chốt ngay (quy tắc 5 phút).

---

## 5. Đơn đặt xe

Đường dẫn: `/admin/bookings`. Vai trò: admin, dispatcher (editor mở được qua URL, SĐT bị che).

### Danh sách

- 3 thẻ thống kê: **Đơn mới chờ duyệt**, **Đang chạy**, **Hoàn thành hôm nay**.
- Bộ lọc:
  - Trạng thái: `Tất cả trạng thái`, `Chờ duyệt (Pending)`, `Đã xác nhận (Confirmed)`, `Đang chạy (In Progress)`, `Hoàn thành (Completed)`, `Đã hủy (Cancelled)`.
  - Ngày đón (ô chọn ngày) + nút **Xóa ngày**.
  - Ô tìm: `Tìm mã đơn, tên, SĐT, điểm đón/trả...`.
- Cột: Mã đơn · Khách hàng · Số điện thoại · Lộ trình đón trả · Ngày giờ đón · Loại xe · Giá dự tính · Trạng thái · **Chi tiết**.
- Phân trang 10/trang (chọn 10/20/50/100). Nút **Làm mới**, nút Chuông.

**Loại xe hiển thị:** `4 chỗ`, `5 chỗ`, `7 chỗ`, `16 chỗ`, `Gửi hàng`.

**Badge trạng thái** (nhãn khác với nhãn bộ lọc):

| Giá trị | Badge | Màu |
| --- | --- | --- |
| `pending` | Chờ xử lý | Hổ phách |
| `confirmed` | Đã nhận đơn | Xanh da trời |
| `in_progress` | Đang chạy | Xanh da trời |
| `completed` | Hoàn thành | Xanh lá |
| `cancelled` | Đã hủy | Hồng |

### Chi tiết đơn (modal)

Bấm **Chi tiết** → modal `Chi tiết Đơn đặt xe #{mã}`, các khối:

- **Thông tin Khách hàng**: Họ tên, SĐT, ghi chú của khách.
- **Lộ trình & Chuyến đi**: Điểm đón, Điểm trả, Thời gian đón, Loại xe/Dịch vụ (`Chở khách` / `Gửi hàng / Bưu phẩm`), Hình thức/Số khách (`Đi ghép (Tiết kiệm)` / `Bao xe trọn gói`), Chiều sân bay (`Đi sân bay` / `Đón tại sân bay` / `Khứ hồi`).
- **Thông tin Thanh toán**: Giá dự tính, Giá thực tế (final), Hình thức (`Tiền mặt` / `Chuyển khoản`), Đặt cọc trước.
- **Ghi chú điều phối**.
- Footer chỉ có nút **Đóng**.

### Vòng đời đơn & giới hạn giao diện

Quy trình vận hành chuẩn 5 trạng thái:

```
Chờ duyệt (Pending) → Đã xác nhận (Confirmed) → Đang chạy (In Progress)
        → Hoàn thành (Completed)  /  Đã hủy (Cancelled)
```

> **Quan trọng:** Màn hình Đơn đặt xe trong `/admin` hiện thiên về **tiếp nhận – tra cứu – xem chi tiết – gọi khách thủ công** (SĐT hiển thị dạng text). Các nút đổi trạng thái / hủy-kèm-lý-do / gọi trực tiếp được mô tả trong cẩm nang nội bộ **chưa được dựng thành nút bấm** ở giao diện này. Việc cập nhật trạng thái đơn thực hiện ở tầng dữ liệu (xem [mục 16](#16-can-thiệp-dữ-liệu-nâng-cao-payload-gốc)). Mã đơn tự sinh dạng `XG-{YYMMDD}-{6 ký tự}`, không sửa được.

**Bảo mật SĐT:** editor thấy `0962***293` (che giữa); admin/dispatcher thấy đầy đủ để gọi.

**Thời gian thực:** danh sách tự nạp đơn mới mỗi **15s** (khi tab ẩn: 60s; quay lại tab kiểm tra ngay). Đơn mới → chuông + Notification + toast.

---

## 6. Tuyến đường & Giá

Đường dẫn: `/admin/routes`. Vai trò: admin, editor. Đây là phân hệ quan trọng nhất, quyết định giá cước hiển thị ra website.

### 6.1. Danh sách tuyến

- Thống kê nhanh: số tuyến **Active**, **Draft**, **Banner Top**.
- Bộ lọc: **Khu vực** (Tất cả / Hải Phòng / Hà Nội / Hạ Long / Móng Cái / Bắc Ninh – Bắc Giang) và **Trạng thái** (Tất cả / Đang hoạt động / Bản nháp / Lưu trữ / Tạm dừng).
- Ô tìm: `Tìm theo tên tuyến, điểm đi, điểm đến, slug...`.
- Cột: Tên tuyến (kèm nhãn Banner Top) · Điểm đi/đến · Giá từ · Trạng thái · Thao tác.
- Thao tác dòng: **Xem chi tiết** (con mắt) · **Chỉnh sửa** (bút) · **Xóa** (thùng rác, có hộp thoại xác nhận).
- Nút **Thêm tuyến mới**, nút **Làm mới**, công tắc lọc **Hiện Banner Top**.

### 6.2. Form tuyến — 5 tab

Mở **Thêm tuyến mới** hoặc bấm sửa một tuyến. Header dính gồm: nút quay lại, tiêu đề (`Thêm tuyến đường mới` / `Chỉnh sửa tuyến đường` / `Chi tiết tuyến đường`), badge trạng thái, nút ẩn/hiện **xem trước**, và các nút lưu:

- **Lưu nháp** → lưu với trạng thái `draft`.
- **Tạo tuyến đường** (khi thêm) / **Cập nhật tuyến** (khi sửa) → lưu với trạng thái đang chọn.
- Chế độ xem (`/view`): chỉ đọc, có nút **Chỉnh sửa tuyến này** để chuyển sang sửa.

Bên phải là khung **Xem trước** (RoutePreview) cập nhật theo dữ liệu đang nhập.

#### Tab 1 — Thông tin cơ bản

| Trường | Bắt buộc | Ghi chú |
| --- | :---: | --- |
| **Tên tuyến đường** | ✅ | VD: `Hải Phòng ⇄ Hà Nội` |
| **Slug** | ✅ | Tự sinh từ tên; nút **Đồng bộ slug từ tên tuyến** (đũa thần). VD: `hai-phong-ha-noi` |
| **Điểm đi (Origin)** | ✅ | VD: Hải Phòng |
| **Điểm đến (Destination)** | ✅ | VD: Hà Nội |
| Cự ly khoảng cách (km) | — | VD: `120 km` hoặc `105 - 120 km` |
| Thời gian di chuyển ước tính | — | VD: `1 giờ 30 phút` |
| **Mô tả ngắn** | ✅ | Tối đa **300 ký tự** |

URL công khai của tuyến: `https://xeghep24h.vn/tuyen-lien-tinh/{slug}`.

#### Tab 2 — Bảng giá & Vé

Có **2 tab con**:

**A. "Mức giá"** — cấu hình 4 hạng vé (nguồn giá chuẩn, tự chảy ra mọi bảng giá):

| Hạng vé | Ý nghĩa | Bắt buộc |
| --- | --- | --- |
| **Xe ghép 1 người** (`tierShare1`) | Vé lẻ 1 khách | ✅ ít nhất 1 trong 2 hạng đánh dấu * |
| **Xe ghép 2 người** (`tierShare2`) | Combo 2 khách (để trống có thể tự suy từ ghép 1) | — |
| **Bao xe 4-5 chỗ** (`tierCharter45`) | Trọn gói xe 4-5 chỗ | ✅ ít nhất 1 trong 2 hạng đánh dấu * |
| **Bao xe 7 chỗ** (`tierCharter7`) | Xe gia đình 7 chỗ | — |

Mỗi hạng chọn **Loại giá**:

- **Cố định** → nhập `Mức giá cố định (VND)`.
- **Khoảng giá** → nhập `Giá tối thiểu (Từ)` và `Giá tối đa (Đến)`.
- **Giá từ** → nhập `Giá khởi điểm (Từ VND)`, hiển thị "từ …".
- **Thỏa thuận** → không nhập số; khách liên hệ tổng đài (`Liên hệ thỏa thuận`).

Ô **Giá từ ước tính (priceFrom)** tự tính = min nhỏ nhất của các hạng không phải "Thỏa thuận". Nút **Xóa** để bỏ cấu hình một hạng.

> Quy tắc bắt buộc (FR-D05): phải có ít nhất **Xe ghép 1 người** hoặc **Bao xe 4-5 chỗ** hợp lệ, nếu không lưu sẽ báo lỗi.

**B. "HTML, CSS & JS bảng giá"** — bảng giá tùy chỉnh (override):

- Checkbox **Kích hoạt HTML tùy chỉnh cho "Bảng Giá Chi Tiết Tuyến"**.
- 3 ô: **HTML bảng giá**, **CSS bảng giá**, **JavaScript bảng giá**.
- Khi bật + có HTML: trang chi tiết tuyến hiển thị **bảng HTML này thay cho** bảng 4 hạng vé tự động.
- HTML chạy trong **iframe riêng** (không nạp Tailwind của site), `h1/h2` đổi thành `h3`, không chạy JSX/`onClick`; JS thuần không fetch/tài nguyên ngoài.

> **Cạm bẫy hay gặp:** Giá trong bảng HTML tùy chỉnh là **text viết tay**, **không đồng bộ** với 4 hạng "Mức giá". Sửa giá ở "Mức giá" sẽ KHÔNG đổi bảng HTML. Muốn bảng tự khớp giá → tắt checkbox này. (Ví dụ: tuyến Hà Nội ⇄ Ninh Bình đang dùng bảng HTML riêng liệt kê giá theo từng điểm đến.)

#### Tab 3 — Điểm đón/trả & FAQ

- **Điểm đón** / **Điểm trả**: danh sách động, nút **Thêm**, **Xóa** từng dòng. VD: `Bến xe Niệm Nghĩa, Sân bay Cát Bi...`.
- **FAQ**: cặp **Câu hỏi** + **Câu trả lời**, thêm/xóa động. Dòng trống tự bị loại khi lưu.

#### Tab 4 — Ảnh & SEO

- **Ảnh thumbnail đại diện tuyến**: chọn từ Media (nút **Chọn ảnh** / **Gỡ ảnh**). Ảnh này hiện ở card tuyến trang chủ & danh mục.
- **Cấu hình SEO & Chia sẻ MXH**:
  - **Tiêu đề SEO (Meta Title — tối ưu 50–70 ký tự)**; để trống tự lấy theo tên tuyến. Có tùy chọn nối thương hiệu.
  - **Mô tả SEO (Meta Description — tối ưu 120–160 ký tự)**.
  - **Ảnh chia sẻ MXH (OG Image)**: để trống dùng thumbnail.
  - Checkbox **noindex** (loại khỏi sitemap — chỉ dùng khi thật sự muốn ẩn).
  - Khung **SeoPreview** chấm điểm /100, xem trước Google & Facebook/Zalo, chuyển Desktop/Mobile.

#### Tab 5 — Cấu hình

- **Ghim Banner Top trang chủ** (checkbox) + **Nhãn hiển thị Banner** (để trống lấy tên tuyến) + **Thứ tự sắp xếp (sortOrder)**.
- **Khu vực khai thác**: chọn nhiều (Hải Phòng, Hà Nội, Hạ Long, Móng Cái, Bắc Ninh – Bắc Giang) — dùng cho tab lọc khu vực ngoài website.
- **Trạng thái tuyến đường**: `Hoạt động (Active)` / `Bản nháp (Draft)` / `Lưu trữ (Archived)` / `Tạm dừng (Inactive)`.
- **Hạn áp dụng bảng giá (Bắt buộc)** (`priceValidUntil`, ô ngày) — bắt buộc theo quy định dự án.
- **Giờ hoạt động** (VD `24/7`), **Tần suất khai thác chuyến** (VD `30 - 60 phút / chuyến`).

### 6.3. Cảnh báo đổi slug (301)

Khi sửa **slug của tuyến đang Active**, form hiện banner vàng **Cảnh báo tự động tạo chuyển hướng 301**: hệ thống tự tạo redirect 301 từ `/tuyen-lien-tinh/{slug-cũ}` sang slug mới để giữ thứ hạng Google. Không cần tạo tay (vẫn kiểm tra được ở mục Chuyển hướng 301).

### 6.4. Các lỗi validate khi lưu

- `Vui lòng nhập tên tuyến đường.` / `…slug…` / `…điểm đi…` / `…điểm đến…`
- `Vui lòng nhập mô tả ngắn cho tuyến.` / `Mô tả ngắn không được vượt quá 300 ký tự.`
- `Hạn áp dụng bảng giá (priceValidUntil) là trường bắt buộc…`
- `Cần ít nhất một mức giá hợp lệ cho "Xe ghép 1 người" hoặc "Bao xe 4-5 chỗ" (FR-D05).`
- `Vui lòng nhập HTML bảng giá trước khi kích hoạt.`

---

## 7. Bài viết

Đường dẫn: `/admin/articles`. Vai trò: admin, editor.

### Danh sách

- Cột: Ảnh · Tiêu đề (kèm slug) · Slug · Danh mục · Trạng thái · Ngày xuất bản · Cập nhật · Thao tác (sửa/xóa).
- Badge danh mục: **Kinh nghiệm** (sky), **Tin tuyến** (blue), **Khuyến mãi** (amber).
- Bộ lọc: danh mục (Tất cả / Kinh nghiệm / Tin tuyến / Khuyến mãi) + trạng thái (Tất cả / Bản nháp / Đã xuất bản). Ô tìm theo tiêu đề hoặc slug.
- Nút **Viết bài mới**, **Làm mới**. Xóa có xác nhận `Hành động này không thể hoàn tác.`

### Form bài viết — 4 tab

Header dính: **Lưu bản nháp** (`draft`) và **Xuất bản ngay** (`published`), nút **Hủy bỏ**. Trạng thái chỉ đặt qua 2 nút này (không có ô chọn trạng thái).

**Tab "Nội dung"**

| Trường | Bắt buộc | Ghi chú |
| --- | :---: | --- |
| **Tiêu đề bài viết** | ✅ | |
| **Slug (Đường dẫn tĩnh)** | ✅ | Nút **Đồng bộ từ tiêu đề**; URL: `/tin-tuc/{slug}` |
| **Danh mục bài viết** | ✅ | 3 nhóm cố định: `Kinh nghiệm đi xe`, `Tin tuyến & Báo giá` (mặc định), `Khuyến mãi` |
| **Tác giả** | ✅ | Mặc định `Xe Ghép Liên Tỉnh` |
| **Tóm tắt ngắn (Excerpt)** | ✅ | Đếm ký tự trực tiếp, tối đa **300** |
| **Ảnh đại diện (Featured Image)** | ✅ | Chọn từ Media; khuyến nghị 1200×630 / 16:9 |
| **Nội dung bài viết (HTML)** | ✅ | Trình soạn thảo Rich Text (xem dưới) |

**Tab "Ảnh"**: Featured Image + **Ảnh chia sẻ MXH (OG Image)** (mặc định dùng ảnh đại diện).

**Tab "SEO"**: Meta Title (50–70), Meta Description (150–160), checkbox đỏ **noindex** (loại khỏi sitemap), SeoPreview.

**Tab "Cài đặt"**: tóm tắt chỉ đọc (Trạng thái / Tác giả / Danh mục).

**Trình soạn thảo Rich Text** (dùng chung cho bài viết & trang):

- Chuyển chế độ **Trực quan** / **Mã HTML**.
- Toolbar: Bold, Italic, **H2** (tự sinh `id` cho mục lục TOC), H3, đoạn văn, danh sách (UL/OL), trích dẫn, chèn link, **Chèn ảnh** (mở Media Picker, chèn `<figure>` kèm alt/caption), xóa định dạng.
- **Không có**: bảng (table), H1/H4, gạch chân, căn lề. Muốn bảng → viết ở chế độ Mã HTML.

**Đổi slug bài đã xuất bản** → banner vàng cảnh báo tự tạo **Redirect 301** `/tin-tuc/{cũ}` → `/tin-tuc/{mới}` (backend tự tạo, không chặn việc lưu).

> **Lưu ý danh mục:** Ô "Danh mục bài viết" trong form dùng **3 nhóm cố định** nêu trên. Màn hình **Danh mục bài viết** (mục 8) quản lý một thư viện danh mục riêng (`/article-categories`) — hiện chưa nối vào ô chọn của form bài viết.

---

## 8. Danh mục bài viết

Đường dẫn: `/admin/categories`. Vai trò: admin, editor.

- Danh sách: Tên danh mục (kèm mô tả) · Slug · **Số bài** · Cập nhật · Thao tác (sửa/xóa). Nút **Tạo danh mục mới**.
- Form: **Tên danh mục** (bắt buộc, ≤100 ký tự), **Slug** (tự sinh từ tên nếu để trống), **Mô tả** (≤500). Nút **Lưu danh mục**.
- Xóa: hộp thoại **Xóa danh mục**, confirm **Xóa vĩnh viễn**.
- Không có SEO/trạng thái riêng.

---

## 9. Trang nội dung

Đường dẫn: `/admin/pages`. Vai trò: admin, editor. Quản lý trang tĩnh & pháp lý.

### Hai loại trang

| Loại | Badge | Đặc điểm |
| --- | --- | --- |
| **Hệ thống** (`system`) | Xanh | Slug cố định, **không thể xóa**, không tạo mới; layout nằm trong code frontend, chỉ sửa được H1 + SEO |
| **Nội dung** (`content`) | Tím | Tạo/xóa tự do; có trình soạn thảo nội dung chính sách |

**6 slug hệ thống được bảo vệ:** `home`, `gioi-thieu`, `lien-he`, `tuyen-lien-tinh`, `tin-tuc`, `dat-xe`. Trang nội dung ví dụ: `chinh-sach/bao-mat`, `chinh-sach/dam-bao`, `chinh-sach/thanh-toan` (slug có thể chứa `/`).

### Danh sách & form

- Lọc theo **Loại trang** (Tất cả / Trang hệ thống / Trang nội dung) + trạng thái. Nút **Tạo trang mới**.
- Form (không tab):
  - **Tiêu đề trang (H1)** (bắt buộc).
  - **Slug**: trang hệ thống hiển thị `(Cố định - Read Only)`; trang nội dung bắt buộc, có **Đồng bộ từ tiêu đề** khi tạo.
  - **Phân loại trang** (chỉ đọc).
  - **Trạng thái xuất bản**: `Đã xuất bản (Công khai)` / `Bản nháp` (trang mới mặc định xuất bản).
  - **Nội dung chính sách & điều khoản (HTML)** — chỉ trang `content`, bắt buộc.
  - Khối **SEO & Social**: Meta Title (50–70), checkbox **Tự động thêm hậu tố thương hiệu " | Xe Ghép Liên Tỉnh"**, Meta Description (120–160), OG Image (mặc định dùng ảnh OG hệ thống), noindex, SeoPreview.
- Nút lưu: **Lưu bản nháp** / **Xuất bản ngay** / **Hủy bỏ**.
- Xóa: trang hệ thống bị disabled (`Không thể xóa trang hệ thống cốt lõi`); trang nội dung xóa được (có xác nhận).

---

## 10. Thư viện Media

Đường dẫn: `/admin/media`. Vai trò: admin, editor. Kho ảnh tập trung.

### Thư viện

- Nút **Tải ảnh lên**, **Làm mới**. Ô tìm `Tìm theo tên file hoặc Alt text...`.
- Chuyển chế độ xem **Lưới** / **Bảng** (mặc định Lưới, 24 ảnh/trang).
- Mỗi ảnh: xem trước, kích thước, tên file, Alt, dung lượng, định dạng; hover hiện nút **Sao chép URL** / **Xem chi tiết** / **Xóa**.
- **Sao chép URL**: copy URL tuyệt đối, toast `Đã sao chép URL của ảnh "{tên}"!`.

### Chi tiết ảnh (modal)

Tên file, kích thước gốc (px), dung lượng, MIME, **Alt text**, **Chú thích (Caption)**, ngày tạo; các bản tự sinh: **Card (640w)**, **Hero (1600w)**, **OG (1200×630)**; ô URL chỉ đọc + **Sao chép** + mở tab mới.

> Không sửa được Alt/metadata sau khi tải lên (chỉ xem). Không chọn hàng loạt. Muốn đổi Alt → tải lại ảnh mới với Alt đúng rồi thay thế.

### Tải ảnh lên (modal)

- Tiêu đề **Tải ảnh mới lên hệ thống**; kéo thả hoặc click chọn.
- Định dạng: **JPG, PNG, WebP, AVIF**. Bản gốc tự resize tối đa **2400px** (không phóng to) và tạo thêm các bản card/hero/og; ảnh gốc cũng được chuyển WebP.
- **Alt text (Mô tả hình ảnh — Bắt buộc)** ✅ (vì SEO + trợ năng); **Chú thích (Caption — Tùy chọn)**.
- Nút **Tải lên ngay**. Thành công: `Đã tải lên thành công ảnh "{tên}"!`.

### Xóa ảnh

Hộp thoại cảnh báo xóa **vĩnh viễn ảnh gốc + tất cả bản dẫn xuất (card, hero, og)**. Confirm **Xác nhận xóa**.

**Mẹo SEO ảnh:** đặt tên file không dấu, gạch ngang (`xe-7-cho-innova-2024.webp`); ưu tiên WebP/JPG nén; Alt mô tả đúng nội dung ảnh.

---

## 11. Chuyển hướng 301 & Giám sát Sitemap

Đường dẫn: `/admin/redirects`. Vai trò: admin, editor. Gồm **2 tab**.

### Tab "Danh sách Chuyển hướng (N)"

- Bộ lọc **Mã HTTP** (Tất cả / 301 / 302 / 308 / 410) + **Trạng thái** (Tất cả / Đang hoạt động / Tạm dừng). Ô tìm theo URL nguồn/đích. Nút **Làm mới**, **Thêm chuyển hướng**.
- Cột: **Đường dẫn nguồn (From)** · **Đích đến (To)** · **Mã HTTP** · **Nguồn tạo** (`Tự đổi slug` / `Hệ thống (Seed)` / `Thủ công`) · **Trạng thái** · Thao tác (sửa/xóa).
- Badge mã: **301 Permanent** (blue), **302 Temporary** (amber), **308 Permanent** (purple), **410 Gone** (rose).

**Form thêm/sửa chuyển hướng**

| Trường | Ghi chú |
| --- | --- |
| **Đường dẫn nguồn (From URL)** ✅ | VD `/tuyen-xe-cu`; tự chuẩn hóa (thường hóa, thêm `/` đầu, bỏ `/` cuối) |
| **Đường dẫn đích (To URL)** | Bắt buộc trừ khi chọn 410; ô bị khóa nếu 410 |
| **Mã trạng thái (HTTP Status)** | `301 - Chuyển vĩnh viễn`, `302 - Chuyển tạm thời`, `308 - Chuyển vĩnh viễn giữ phương thức`, `410 - Nội dung đã xóa bỏ hoàn toàn` |
| **Đang hoạt động (Kích hoạt)** | Checkbox, mặc định bật |
| Ghi chú (Tùy chọn) | |

- Validate: không để trống nguồn; không trống đích (trừ 410); **nguồn ≠ đích** (tránh vòng lặp).
- Nút **Tạo chuyển hướng** / **Lưu thay đổi**. Thành công: `Lưu cấu hình chuyển hướng thành công!`.

> **Tự động khi đổi slug:** đổi slug tuyến/bài viết/trang đang hoạt động → backend tự tạo bản ghi 301 (nguồn `Tự đổi slug`), nối chuỗi redirect cũ và gỡ vòng lặp. Không cần tạo tay.

### Tab "Giám sát Sitemap (SEO)"

- Thẻ thống kê: **Tổng URL Index**, **Trang Tĩnh & CMS**, **Tuyến đường**, **Bài viết Tin tức**.
- Lọc loại URL (Tất cả / Trang nội dung / Tuyến đường / Bài viết). Ô tìm theo path. Nút **Làm mới Sitemap**.
- Cột: **Đường dẫn (Path URL)** (kèm nút mở URL) · **Loại nội dung** · **Cập nhật lần cuối (lastmod)**.
- **Chỉ đọc** — không có nút regenerate/ping/submit. Dùng để đối chiếu URL nào đang vào sitemap.

---

## 12. Bảng giá phụ & Cước mở rộng

Đường dẫn: `/admin/pricing`. Vai trò: admin, dispatcher (xem); **chỉ admin lưu được**. Gồm **2 tab**.

### Tab "Bảng giá Sân bay Nội Bài (12 quận)"

- Bảng 12 quận Hà Nội: cột **Khu vực / Quận**, **Hà Nội → Sân bay**, **Sân bay → Hà Nội**, **Khứ hồi (2 chiều)** (mỗi ô 3 dòng: `Sedan 5:`, `SUV 7:`, `Van 16:`), **Trạng thái** (`Áp dụng` / `Tạm dừng`), nút **Sửa giá**. Ô tìm theo tên quận.
- Modal **Chỉnh sửa giá cước: {quận}**: 3 nhóm chiều (đi / về / khứ hồi), mỗi nhóm 3 ô `Sedan 5 chỗ` / `SUV 7 chỗ` / `Van 16 chỗ` (VND, bước 10.000, bắt buộc) + checkbox **Kích hoạt áp dụng mức giá cho quận này**. Nút **Lưu thay đổi**.
- Không thêm/xóa quận (12 quận cố định).

### Tab "Bảng giá Đường dài theo km & Chính sách"

- Bảng **4 dải km**: cột **Dải cự ly**, **Sedan 5 chỗ (VND/km)**, **SUV 7 chỗ (VND/km)**, **Van 16 chỗ (VND/km)**, nút **Sửa giá**.
- Modal **Sửa đơn giá: {dải}**: **Tên dải cự ly**, **Cự ly từ (km)**, **Cự ly đến (km, để trống nếu không giới hạn)**, 3 ô đơn giá/km (bước 500). Nút **Lưu đơn giá**. Backend chặn dải chồng lấp/hở (422).
- **4 thẻ chính sách chỉ đọc** (lấy từ global `pricing_settings`): **Giảm giá khứ hồi**, **Chờ miễn phí**, **Phí chờ theo giờ**, **Phụ phí qua đêm**. Muốn sửa các chính sách này → xem [mục 16](#16-can-thiệp-dữ-liệu-nâng-cao-payload-gốc).

---

## 13. Cấu hình chung

Đường dẫn: `/admin/settings`. **Chỉ admin.** Tiêu đề **Cấu hình Hệ thống**, gồm đúng **3 tab**:

### Tab 1 — Thông tin Doanh nghiệp & Thương hiệu

Nút lưu duy nhất: **Lưu cấu hình Doanh nghiệp** (thanh dính đáy). Thành công: `Cập nhật thông tin doanh nghiệp thành công!`. Các thẻ:

1. **Thông tin Doanh nghiệp & Thương hiệu**: Tên đầy đủ công ty (pháp nhân) ✅, Tên thương hiệu ✅, Website chính thức ✅, Mã số thuế/GPKD.
2. **Nhận diện Thương hiệu & SEO**: **Logo thương hiệu** (chọn từ Media; bỏ trống dùng icon xe mặc định), **Ảnh chia sẻ mặc định (OG Image)** (1200×630), **Khoảng giá (priceRange cho schema)**.
3. **Thông tin Liên hệ & Hỗ trợ**:
   - **Hotline hiển thị (có dấu chấm)** ✅ (VD `0962.298.293`).
   - **Hotline số thuần (bấm gọi tel:)** ✅ — phải khớp `^0\d{9}$` (VD `0962298293`).
   - **Email hỗ trợ** ✅.
   - **Đường dẫn Zalo tư vấn** (VD `https://zalo.me/0962298293`), **Tên Fanpage Facebook**, **Đường dẫn Fanpage URL**.
   - **Nhãn số điện thoại phụ** + **Số điện thoại phụ** (VD tổng đài đêm `0858.911.247`).
   - **Địa chỉ văn phòng / trụ sở**.
4. **Banner Đầu trang & Nội dung Chung**: Banner dòng 1/2; **Banner lớn trang chủ** (chọn ảnh / dùng ảnh mặc định); Tiêu đề dòng 1/2, Mô tả banner, Điểm nổi bật 1/2/3, Giờ làm việc, Phạm vi phủ sóng, Mô tả đội xe, Cam kết đặt xe, Tóm tắt dịch vụ.
5. **Cam kết Chất lượng Dịch vụ**: nút **Thêm cam kết**; mỗi mục gồm Tiêu đề ✅, Icon (ShieldCheck/MapPin/Users/BadgePercent/Clock/Award), Mô tả ✅.
6. **Phương thức Thanh toán**: nút **Thêm phương thức**; Tên ✅, Icon (Banknote/CreditCard/Smartphone/QrCode/Wallet/CheckCircle), Mô tả ✅.
7. **Đánh giá của Khách hàng**: nút **Thêm đánh giá**; checkbox **Hiển thị trên web**, Tên khách ✅, Địa phương/Tuyến, Điểm sao (chỉ 5/4/3), Nội dung ✅. Chỉ đánh giá bật hiển thị mới ra website.

> **Dòng chảy ra website:** Hotline số thuần tự sinh link `tel:+84…`, Zalo `https://zalo.me/84…`, SMS; logo/priceRange/areaServed vào schema doanh nghiệp; brand/OG image vào metadata; banner & cam kết vào trang chủ. Đổi số hotline xong nhớ thử nút gọi trên trang chủ.
>
> Nhóm công tắc tracking cũ (GTM/Ads/Pixel) trong Thông tin doanh nghiệp **đã bị ẩn khỏi giao diện** — không còn dùng. Mã theo dõi quản lý ở tab **Custom Code** (bên dưới).

### Tab 2 — Cấu hình Thông báo Email (SMTP)

Gửi email tự động khi có đơn đặt xe mới.

- **Bật/Tắt & Người nhận**:
  - Checkbox **Bật tự động gửi email thông báo khi có đơn đặt xe mới** (mặc định tắt).
  - **Email nhận thông báo** ✅ (khi bật) — nhiều email phân cách bằng `,` hoặc `;`.
  - **Tên người gửi (Sender Name)**, **Email người gửi (From Email — tùy chọn)**.
- **Cấu hình Máy chủ SMTP**:
  - **Máy chủ SMTP (Host)** ✅ (mặc định `smtp.gmail.com`), **Cổng (Port)** ✅ (mặc định `587`).
  - Checkbox **Sử dụng kết nối bảo mật SSL** (tích nếu cổng 465; không tích nếu 587 TLS).
  - **Tài khoản / Email đăng nhập SMTP** ✅, **Mật khẩu SMTP / App Password** ✅ (ô password + con mắt).
- Hộp hướng dẫn lấy **Gmail App Password** (5 bước, link `https://myaccount.google.com/apppasswords`).
- Nút **Gửi email thử nghiệm** (gửi bằng giá trị đang nhập, chưa cần lưu; subject `[KIỂM TRA] …`) và **Lưu cấu hình thông báo**.

> Email đơn mới có subject `[ĐƠN MỚI] {mã} - {tên khách} ({đ đón} → {đ trả})`. Tắt công tắc thì không gửi. Cấu hình Telegram (nếu có) chỉ sửa ở Payload gốc.

### Tab 3 — Custom Code (Head / Body / Footer)

Chèn script/meta/CSS/HTML tùy chỉnh vào **toàn bộ website công khai** mà không sửa source. Đây là nơi gắn **Google Tag Manager, Google Analytics, Google Ads, Facebook/TikTok Pixel, mã xác minh**.

- Cảnh báo **Chỉ dán mã từ nguồn bạn tin cậy** — mã chèn nguyên văn, chạy với quyền website; không áp dụng cho trang quản trị.
- 3 ô (đếm ký tự trực tiếp):
  1. **1. Head — chèn trong `<head>`**: dán mã gốc GTM/Analytics, **giữ nguyên cặp `<script>...</script>`**; không dán React/JSX.
  2. **2. Body start — ngay sau `<body>`**: dán **GTM `<noscript>`**, chat widget, script sớm.
  3. **3. Footer — trước `</body>`**: Pixel, conversion tracking.
- Nút **Lưu Custom Code**. Thành công: `Đã lưu Custom Code. Thay đổi sẽ áp dụng cho các lượt tải trang tiếp theo.`

**Cách gắn GTM đúng (khuyến nghị):**

```html
<!-- Ô 1. Head: giữ nguyên thẻ script -->
<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
```
```html
<!-- Ô 2. Body start: noscript -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

> **Lưu ý kỹ thuật:** Mã Head được chèn bằng `next/script` (`afterInteractive`), dựng lại mọi thẻ script (kể cả lồng nhau). Body/Footer chèn raw. **Không có sanitize** — chỉ dán mã tin cậy. Website đọc global phía server nên snippet không lộ ra API công khai. Thay đổi hiển thị sau **~60 giây** (cache ISR). Sự kiện **bấm gọi điện / Zalo** cấu hình trong **GTM** bằng trigger `Click URL` (không có công tắc riêng trong admin). Xem thêm `docs/custom-code.md`.

> **Không có tab "Cấu hình Giá chung" trong Settings.** Form giá chung (`pricing_settings`) đã được gỡ khỏi giao diện này; xem [mục 16](#16-can-thiệp-dữ-liệu-nâng-cao-payload-gốc) để chỉnh.

---

## 14. Quản lý tài khoản

Đường dẫn: `/admin/users`. **Chỉ admin.**

- Danh sách: **Tài khoản Email** (avatar, badge **Bạn** cho chính mình, ID) · **Họ và tên** · **Vai trò** (Admin/Editor/Dispatcher) · **Ngày tạo** · Thao tác (sửa/xóa).
- Lọc vai trò (Tất cả / Admin / Editor / Dispatcher), ô tìm email/họ tên, nút **Làm mới**, **Thêm tài khoản**.

**Form thêm/sửa**

| Trường | Ghi chú |
| --- | --- |
| **Địa chỉ Email** | Bắt buộc; **không đổi được khi sửa** (định danh đăng nhập) |
| **Họ và tên** | |
| **Mật khẩu** / **Mật khẩu mới** | Bắt buộc khi tạo; **tối thiểu 6 ký tự** (chỉ kiểm tra lúc tạo); để trống khi sửa = giữ nguyên |
| **Vai trò & Quyền hạn** | `Admin (Quản trị viên toàn quyền)` / `Editor (Biên tập viên nội dung, SEO, tuyến xe)` / `Dispatcher (Điều phối viên đơn xe & tài xế)` |

- Nút **Tạo tài khoản** / **Lưu thay đổi**. Thành công: `Lưu tài khoản quản trị thành công!`.
- **Xóa**: không tự xóa được chính mình (`Bạn không thể tự xóa tài khoản của chính mình.`); xóa người khác có xác nhận **Xác nhận xóa tài khoản quản trị**.

> **Không có công tắc "Khóa tài khoản"** trong giao diện này (khác文案 trợ giúp). Muốn vô hiệu hóa tạm thời → đổi mật khẩu hoặc xóa tài khoản (cân nhắc). Mật khẩu tối thiểu thực tế là **6**, không phải 8.

---

## 15. Cẩm nang & Trợ giúp trong admin

Đường dẫn: `/admin/help`. Tất cả vai trò. URL điều hướng bằng tab: `/help?tab=…&item=…`.

- Tiêu đề **Cẩm nang Hướng dẫn & Trợ giúp Vận hành CMS**; nút **Xem danh sách đặt xe**, **Phím tắt (Ctrl+K)**.
- 5 tab: **9 Chức năng Sidebar**, **Quy trình Xử lý đơn**, **Tuyến xe & Giá**, **Phím tắt & Mẹo**, **Hỗ trợ**.
- Tab sidebar: lọc theo nhóm (Vận hành / Nội dung & SEO / Hệ thống), chọn chức năng → panel phải gồm **Mở trang**, **Phân quyền vai trò**, **DÙNG LÀM GÌ?**, **DÙNG NHƯ THẾ NÀO?**, **MẸO HAY & LƯU Ý**.
- Tab Hỗ trợ: hotline **0962.298.293**, email **xegheplientinhvip@gmail.com**, phiên bản **v1.2.0**.

> Cẩm nang nội bộ viết theo hướng "quy trình chuẩn", một số mô tả (biểu đồ dashboard, nút đổi trạng thái đơn, khóa tài khoản…) **chưa có trong giao diện thực tế**. Tài liệu này (bạn đang đọc) mô tả đúng những gì bấm được.

---

## 16. Can thiệp dữ liệu nâng cao (Payload gốc)

Ngoài admin tùy chỉnh `/admin`, hệ thống còn **Payload CMS gốc** tại **`/payload-admin`** (tài khoản admin). Dùng khi cần thao tác chưa dựng trong `/admin`:

| Việc | Nơi thực hiện |
| --- | --- |
| Đổi **trạng thái đơn đặt xe** (Pending → Confirmed → …) | Payload gốc → collection Bookings (quyền ghi admin/dispatcher) |
| Sửa **global `pricing_settings`** (hạn áp dụng giá chung, chờ miễn phí, phí chờ/giờ, giảm khứ hồi, phụ phí đêm, gửi hàng…) | Payload gốc → Globals → Pricing Settings |
| Sửa `areaServed`, `mapEmbedUrl`, tọa độ, Telegram notification | Payload gốc → Globals |
| Can thiệp sâu bản ghi Media/ Routes/ Articles/ Pages | Payload gốc |

> `priceValidUntil` của global `pricing_settings` là **giá trị dự phòng** cho tuyến nào để trống hạn áp dụng giá. Mỗi tuyến vẫn nên tự đặt hạn riêng ở tab Cấu hình.

---

## 17. Quy trình vận hành một ngày

**Đầu ca (dispatcher/admin)**

1. Mở **Tổng quan**, bật **Chuông**.
2. Nhìn thẻ **Chờ xác nhận** → **Duyệt đơn đặt xe**.
3. Với mỗi đơn Pending: mở **Chi tiết**, kiểm tra đón/trả/giờ/loại xe/hành lý, **gọi khách trong 5–10 phút** để chốt (SĐT đầy đủ với dispatcher/admin).
4. Ghi nhận điều phối; cập nhật trạng thái ở tầng dữ liệu khi chuyến tiến triển (mục 16).

**Nội dung & SEO (editor/admin)**

1. **Tuyến đường & Giá**: cập nhật cước 4 hạng vé; tuyến nào cần bảng riêng thì dùng HTML tùy chỉnh (nhớ giá viết tay không tự đồng bộ).
2. Ghim **Banner Top** cho tuyến chiến dịch + nhãn ngắn.
3. **Bài viết**: đăng cẩm nang/khuyến mãi, chèn link nội bộ về tuyến, đặt Meta Title/Description, ảnh OG.
4. **Media**: tải ảnh mới với Alt chuẩn; xóa ảnh chiến dịch hết hạn.
5. Đổi slug → kiểm tra **Chuyển hướng 301** đã tự tạo.

**Quản trị (admin)**

1. **Cấu hình chung**: cập nhật hotline/Zalo/banner/cam kết; kiểm tra SMTP bằng **Gửi email thử nghiệm**; gắn mã theo dõi ở **Custom Code**.
2. **Bảng giá phụ**: chỉnh giá sân bay/đường dài khi có biến động.
3. **Quản lý tài khoản**: cấp/thu hồi quyền nhân sự.

---

## 18. SEO, cache & thời điểm thay đổi hiển thị

- **Cache ISR ~60 giây**: sửa nội dung trong admin (tuyến, bài viết, trang, custom code, company settings) thường hiển thị ngoài website sau **tối đa ~60s**. Nếu cần thấy ngay, tải lại trang ở chế độ ẩn danh sau 1 phút.
- **Canonical & slug**: mỗi tuyến/bài viết/trang có slug riêng → URL công khai riêng. Đổi slug tuyến/bài đang hoạt động tự sinh **301**.
- **noindex**: chỉ tích khi thật sự muốn loại trang khỏi Google & sitemap (mặc định không tích).
- **Ảnh**: luôn có **Alt** (bắt buộc khi upload); ảnh OG khuyến nghị **1200×630**; ảnh LCP/hero không lazy.
- **Schema**: giá/đánh giá trong schema lấy từ dữ liệu thật (4 hạng vé, đánh giá bật hiển thị) — không bịa. `priceValidUntil` phải có thật.
- **GTM/Analytics**: gắn ở Custom Code Head + noscript Body start; chuyển đổi gọi/Zalo cấu hình trong GTM bằng Click URL trigger.
- **Sitemap**: theo dõi ở tab Giám sát Sitemap; chỉ URL canonical, đã xuất bản, không noindex mới vào sitemap.

---

## 19. Phụ lục

### A. Ánh xạ URL công khai

| Nội dung | URL website |
| --- | --- |
| Trang chủ | `https://xeghep24h.vn/` |
| Danh sách tuyến | `/tuyen-lien-tinh` |
| Chi tiết tuyến | `/tuyen-lien-tinh/{slug}` |
| Danh sách bài viết | `/tin-tuc` |
| Chi tiết bài viết | `/tin-tuc/{slug}` |
| Đặt xe | `/dat-xe` (thành công: `/dat-xe/thanh-cong`) |
| Giới thiệu / Liên hệ | `/gioi-thieu` · `/lien-he` |
| Chính sách | `/chinh-sach/bao-mat` · `/chinh-sach/dam-bao` · `/chinh-sach/thanh-toan` |
| Ảnh media | `/media/{đường-dẫn}` |
| Admin tùy chỉnh | `/admin` |
| Payload gốc | `/payload-admin` |

### B. Bảng trạng thái

| Đối tượng | Giá trị | Nhãn |
| --- | --- | --- |
| Tuyến | `active` / `draft` / `archived` / `inactive` | Hoạt động / Bản nháp / Lưu trữ / Tạm dừng |
| Bài viết & Trang | `draft` / `published` (+`archived` bài viết) | Bản nháp / Đã xuất bản / Lưu trữ |
| Đơn đặt xe | `pending` / `confirmed` / `in_progress` / `completed` / `cancelled` | Chờ xử lý / Đã nhận đơn / Đang chạy / Hoàn thành / Đã hủy |
| Redirect | `301` / `302` / `308` / `410` | Vĩnh viễn / Tạm thời / Vĩnh viễn giữ method / Đã xóa bỏ |

### C. Khắc phục sự cố nhanh

| Hiện tượng | Nguyên nhân / cách xử lý |
| --- | --- |
| Lưu báo `Bạn không có quyền…` | Tài khoản không đủ quyền ghi (vd dispatcher sửa bảng giá, editor mở settings) → dùng admin |
| Sửa xong website chưa đổi | Đợi ~60s cache; thử ẩn danh; kiểm tra đã bấm Lưu chưa |
| Bảng giá tuyến không khớp "Mức giá" | Tuyến đang bật **HTML tùy chỉnh** (giá viết tay) → tắt checkbox hoặc sửa HTML |
| Không lưu được tuyến | Thiếu `priceValidUntil`, thiếu mô tả, hoặc chưa có hạng ghép 1 / bao xe 4-5 hợp lệ |
| GTM không chạy | Dán đúng Head (giữ thẻ script) + noscript Body start; kiểm tra CSP cho phép `googletagmanager.com`; đợi 60s |
| Email không gửi | Chưa bật công tắc; sai SMTP/App Password; bấm **Gửi email thử nghiệm** để chẩn đoán |
| SĐT khách hiện `0962***293` | Đăng nhập vai trò **editor** (bị che) → dùng dispatcher/admin |
| Không tìm thấy menu | Menu ẩn theo vai trò; hoặc dùng Command Palette `Ctrl+K` |
| Đơn mới không kêu | Chuông đang Tắt; hoặc chưa cấp quyền Notification trình duyệt |

### D. Phím tắt & liên hệ

- `Ctrl+K` Command Palette · `Ctrl+B` Sidebar · `Esc` Đóng.
- Hỗ trợ kỹ thuật: **0962.298.293** · **xegheplientinhvip@gmail.com**.
- Tài liệu liên quan trong repo: `docs/custom-code.md` (mã theo dõi), `docs/seed-snapshot.md` (dữ liệu mẫu).

---

*Tài liệu phản ánh giao diện `/admin` tại thời điểm 2026-11-09. Khi source `src/admin/` thay đổi, cập nhật lại tài liệu này cho khớp.*