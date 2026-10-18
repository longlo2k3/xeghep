# Seed đồng bộ từ cơ sở dữ liệu

`src/seed/data/databaseSnapshot.json` là snapshot nội dung công khai từ DB cục bộ: media, tuyến, trang, bài viết, giá sân bay, giá theo km, redirect và hai global settings. 33 bản ghi media dùng 19 tệp nguồn đã theo dõi trong `media/` hoặc `public/`; mỗi bản ghi được tạo lại và quan hệ được ánh xạ sang ID ở DB mới.

- `npm run seed:export-db`: đọc DB hiện tại và cập nhật snapshot. Xem diff trước khi commit; lệnh này không ghi DB.
- `npm run seed`: nhập snapshot vào **DB nội dung trống**, rồi tạo tài khoản admin/editor/dispatcher từ biến môi trường `SEED_*`. Lệnh dừng nếu DB đã có dữ liệu nội dung.
- `npm run seed:snapshot`: chỉ nhập nội dung, không tạo tài khoản.

Các lệnh `seed:legacy:*` dùng dữ liệu mẫu cũ và có thể ghi đè nội dung; chúng không còn là nguồn seed chính. Đơn đặt xe, tài khoản hiện có, mật khẩu và các bảng vận hành không được xuất vào snapshot.

Schema phải được tạo trước khi nhập snapshot. Với DB cục bộ hiện tại, `db:push` còn đề xuất xóa bảng/cột vận hành có dữ liệu; chỉ migration `src/scripts/migrations/2026-10-19-company-banner.sql` đã được áp dụng. Không chấp nhận cảnh báo xóa dữ liệu của `db:push` trên DB đang dùng.
