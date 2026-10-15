export interface Article {
  slug: string;
  title: string;
  category: "kinh-nghiem" | "tin-tuyen" | "khuyen-mai";
  categoryName: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  excerpt: string;
  content: string;
  tableOfContents: { id: string; text: string }[];
  relatedRouteSlug?: string;
  image: string;
}

export const ARTICLES: Article[] = [
  {
    slug: "kinh-nghiem-dat-xe-ghep-lien-tinh-tiet-kiem",
    title: "Kinh Nghiệm Đặt Xe Ghép Liên Tỉnh Tiết Kiệm, Nhanh Chóng và An Toàn",
    category: "kinh-nghiem",
    categoryName: "Kinh nghiệm đi xe",
    publishedAt: "2026-02-15T08:00:00+07:00",
    updatedAt: "2026-03-20T10:30:00+07:00",
    author: "Ban Biên Tập Xe Ghép Liên Tỉnh",
    excerpt: "Bí quyết đặt xe ghép tiện chuyến Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang đón trả tận nhà, tiết kiệm chi phí và an tâm đổi hủy miễn phí.",
    image: "/photo02.avif",
    tableOfContents: [
      { id: "xe-ghep-la-gi", text: "1. Xe ghép liên tỉnh là gì?" },
      { id: "uu-diem-xe-ghep", text: "2. Ưu điểm nổi bật của xe ghép liên tỉnh" },
      { id: "bang-gia-tham-khao", text: "3. Giá cước các tuyến trọng điểm" },
      { id: "luu-y-khi-dat-xe", text: "4. Lưu ý quan trọng khi đặt chuyến" },
    ],
    content: `
      <p>Trong những năm gần đây, dịch vụ <strong>xe ghép liên tỉnh</strong> đã trở thành xu hướng di chuyển tiện lợi hàng đầu kết nối các tỉnh thành trọng điểm như Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang.</p>
      
      <h2 id="xe-ghep-la-gi">1. Xe ghép liên tỉnh là gì?</h2>
      <p>Xe ghép là hình thức chia sẻ không gian trên cùng một chuyến xe ô tô 4, 5 hoặc 7 chỗ đời mới. Khác với xe khách truyền thống phải ra bến bãi đông đúc, xe ghép đón và trả khách tận nơi tại cửa nhà hoặc địa chỉ yêu cầu.</p>
      <p>Mỗi chuyến xe tại Xe Ghép Liên Tỉnh chỉ nhận giới hạn từ 1 đến 3 khách để đảm bảo không gian rộng rãi, thoáng mát, xe chạy thẳng cao tốc không vòng vèo bắt khách.</p>

      <h2 id="uu-diem-xe-ghep">2. Ưu điểm nổi bật của xe ghép liên tỉnh</h2>
      <ul>
        <li><strong>Chỉ 1–3 khách/chuyến:</strong> Tuyệt đối không nhồi nhét, chỗ ngồi êm ái rộng rãi.</li>
        <li><strong>Xuất phát nhanh chóng:</strong> Xe chạy thẳng đường cao tốc, không bắt khách dọc đường.</li>
        <li><strong>Giá rõ ràng trọn gói:</strong> Đã bao gồm vé cầu đường bến bãi, không có phụ phí ẩn.</li>
        <li><strong>100% xe đời mới:</strong> Điều hòa mát lạnh, sạch sẽ không mùi.</li>
        <li><strong>Đón trả tận nơi 24/7:</strong> Phục vụ 2 chiều cả ngày lẫn đêm.</li>
      </ul>

      <h2 id="bang-gia-tham-khao">3. Giá cước các tuyến trọng điểm</h2>
      <p>Mức giá ghép 1 khách chỉ từ 250k - 600k tùy tuyến. Quý khách vui lòng tham khảo chi tiết tại mục Các tuyến liên tỉnh của chúng tôi.</p>

      <h2 id="luu-y-khi-dat-xe">4. Lưu ý quan trọng khi đặt chuyến</h2>
      <p>Để chuyến đi diễn ra thuận lợi, quý khách nên đặt xe trước 30 phút - 1 tiếng hoặc liên hệ tổng đài 24/7 qua hotline <strong>0962.298.293</strong>.</p>
    `,
    relatedRouteSlug: "hai-phong-ha-noi-noi-bai",
  },
  {
    slug: "bang-gia-xe-ghep-lien-tinh-moi-nhat-2026",
    title: "Bảng Giá Xe Ghép Liên Tỉnh Mới Nhất 2026: 9 Tuyến Trọng Điểm Miền Bắc",
    category: "tin-tuyen",
    categoryName: "Tin tuyến & Báo giá",
    publishedAt: "2026-03-01T09:00:00+07:00",
    updatedAt: "2026-03-25T14:00:00+07:00",
    author: "Phòng Điều Hành Xe Ghép Liên Tỉnh",
    excerpt: "Bảng giá niêm yết 9 tuyến xe ghép liên tỉnh Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang, Hải Dương, Thái Nguyên.",
    image: "/photo01.avif",
    tableOfContents: [
      { id: "tong-quan-bang-gia", text: "1. Bảng giá các tuyến xe ghép chính" },
      { id: "dich-vu-gui-hang", text: "2. Dịch vụ gửi hàng hỏa tốc từ 150k" },
      { id: "chinh-sach-doi-huy", text: "3. Chính sách hoàn tiền và đổi hủy miễn phí" },
    ],
    content: `
      <p>Xe Ghép Liên Tỉnh xin gửi tới quý khách bảng giá niêm yết công khai trên 9 tuyến di chuyển chính, áp dụng cho xe riêng 4, 5 và 7 chỗ đời mới phục vụ 24/7.</p>

      <h2 id="tong-quan-bang-gia">1. Bảng giá các tuyến xe ghép chính</h2>
      <p>Mức giá ghép ghế chỉ từ 250k/khách. Bao xe riêng 4/5 chỗ chỉ từ 400k - 2.200k tùy cự ly lộ trình. Chi tiết niêm yết tại trang Các tuyến liên tỉnh.</p>

      <h2 id="dich-vu-gui-hang">2. Dịch vụ gửi hàng hỏa tốc từ 150k</h2>
      <p>Bên cạnh đưa đón hành khách, chúng tôi cung cấp dịch vụ gửi hàng hóa, bưu phẩm, tài liệu hỏa tốc giá chỉ từ 150k trên tất cả các tuyến đường, giao nhận tận tay người nhận trong ngày.</p>

      <h2 id="chinh-sach-doi-huy">3. Chính sách hoàn tiền và đổi hủy miễn phí</h2>
      <p>Cam kết hoàn tiền 100%, đền 200% nếu xe không đảm bảo chất lượng dịch vụ. Miễn phí đổi hoặc hủy chuyến khi quý khách thay đổi lịch trình.</p>
    `,
    relatedRouteSlug: "hai-phong-bac-ninh-bac-giang",
  },
];
