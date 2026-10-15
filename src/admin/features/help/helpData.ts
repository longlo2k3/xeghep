import {
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  FileText,
  Layers,
  Image,
  ArrowRightLeft,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/admin/types/auth';

export interface SidebarGuideItem {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  section: 'main' | 'operations' | 'content' | 'system';
  sectionName: string;
  roles: Role[];
  badge?: string;
  shortDesc: string;
  purpose: string[];
  howToUse: {
    step: string;
    title: string;
    content: string;
  }[];
  tips: string[];
}

export const SIDEBAR_GUIDES: SidebarGuideItem[] = [
  {
    id: 'dashboard',
    name: 'Tổng quan',
    href: '/dashboard',
    icon: LayoutDashboard,
    section: 'main',
    sectionName: 'Trang chính',
    roles: ['admin', 'editor', 'dispatcher'],
    shortDesc: 'Bảng điều khiển KPI thời gian thực, giám sát toàn diện hoạt động vận hành & kinh doanh.',
    purpose: [
      'Trung tâm điều khiển số liệu KPI thời gian thực của toàn bộ hệ thống xe ghép: tổng đơn hôm nay, đơn chờ duyệt, doanh thu hoàn thành, tỷ lệ lấp đầy ghế.',
      'Hiển thị biểu đồ phân tích xu hướng doanh thu và số lượng chuyến đi theo chu kỳ thời gian (Hôm nay, 7 ngày qua, 30 ngày qua).',
      'Giám sát các tuyến xe chạy nhiều nhất (Top Hot Routes) và danh sách các đơn đặt xe mới nhất cần hành động ngay lập tức.',
      'Cung cấp lối tắt thao tác nhanh (Quick Action) để tạo mới tuyến đường, bài viết hoặc trang chính sách mà không cần chuyển qua nhiều menu.',
    ],
    howToUse: [
      {
        step: '1',
        title: 'Đăng nhập đầu ca & Kiểm tra Đơn chờ duyệt',
        content:
          'Mỗi khi bắt đầu ca trực, nhìn ngay vào thẻ chỉ số màu cam "Đơn chờ duyệt (Pending)". Bấm trực tiếp vào thẻ hoặc nút "Xử lý ngay" để mở danh sách chuyến xe cần gọi điện chốt khách gấp.',
      },
      {
        step: '2',
        title: 'Phân tích Biểu đồ & Giờ cao điểm',
        content:
          'Quan sát biểu đồ phân bố giờ cao điểm (sáng sớm 6h-8h, chiều tối 16h-19h) để chủ động nhắc tài xế chuẩn bị xe và phân bổ tuyến hợp lý.',
      },
      {
        step: '3',
        title: 'Lọc chu kỳ & Báo cáo nhanh',
        content:
          'Chọn bộ lọc thời gian ("Hôm nay", "7 ngày qua", "Tháng này") để đối chiếu doanh thu ước tính và lập báo cáo nhanh cho quản lý.',
      },
      {
        step: '4',
        title: 'Sử dụng phím tắt tìm kiếm',
        content:
          'Nhấn phím Ctrl + K từ bất kỳ đâu trên màn hình để tìm kiếm nhanh đơn hàng, bài viết hoặc mở chức năng khác mà không tốn công điều hướng chuột.',
      },
    ],
    tips: [
      'Thẻ cảnh báo đơn Pending sẽ nhấp nháy khi có đơn mới phát sinh để điều phối viên không bỏ lỡ khách.',
      'Dữ liệu tổng quan được cập nhật tự động định kỳ, bạn có thể bấm nút "Làm mới" trên đầu trang để nạp lại số liệu tức thì.',
    ],
  },
  {
    id: 'bookings',
    name: 'Đơn đặt xe',
    href: '/bookings',
    icon: CalendarCheck,
    section: 'operations',
    sectionName: 'Vận hành xe',
    roles: ['admin', 'dispatcher'],
    badge: 'Ưu tiên',
    shortDesc: 'Trái tim vận hành: Tiếp nhận, gọi điện tư vấn, điều phối tài xế và chốt đơn xe của khách hàng.',
    purpose: [
      'Nơi tiếp nhận và xử lý toàn bộ các yêu cầu đặt xe ghép hoặc bao chuyến của khách hàng gửi từ website.',
      'Quản lý toàn diện vòng đời đơn xe qua 5 trạng thái chuẩn: Chờ duyệt (Pending) ➜ Đã xác nhận (Confirmed) ➜ Đang chạy (In Progress) ➜ Hoàn thành (Completed) / Đã hủy (Cancelled).',
      'Lưu trữ chi tiết thông tin hành khách: Họ tên, số điện thoại, điểm đón tận nơi, điểm trả, ngày giờ xuất phát, loại xe (4 chỗ / 7 chỗ), hình thức (Ghép ghế / Bao xe), ghi chú hành lý và tiền cước.',
      'Hỗ trợ bảo mật thông tin hành khách với tính năng che số điện thoại (Phone Masking) theo phân quyền vai trò.',
    ],
    howToUse: [
      {
        step: '1',
        title: 'Tiếp nhận đơn Chờ duyệt (Pending)',
        content:
          'Đơn mới do khách đặt trên website sẽ xuất hiện ngay ở đầu bảng với nhãn màu cam "Chờ duyệt". Hãy thực hiện "Quy tắc vàng 5 phút": liên hệ khách trong vòng 5-10 phút để tối đa tỷ lệ chốt chuyến.',
      },
      {
        step: '2',
        title: 'Xem chi tiết & Gọi điện xác nhận',
        content:
          'Bấm vào mã đơn hoặc biểu tượng con mắt để mở popup chi tiết: kiểm tra kỹ điểm đón trả, số ghế, hành lý cồng kềnh. Bấm nút gọi điện thoại trực tiếp cho khách để xác nhận điểm hẹn cụ thể và báo giá cước chuẩn.',
      },
      {
        step: '3',
        title: 'Xác nhận đơn (Confirmed)',
        content:
          'Sau khi khách đồng ý và đã gán tài xế nhận cuốc, bấm chuyển trạng thái sang "Đã xác nhận" (Confirmed) để giữ chỗ cho khách.',
      },
      {
        step: '4',
        title: 'Đón khách & Hoàn thành chuyến',
        content:
          'Khi tài xế bắt đầu đón khách, đổi sang "Đang chạy" (In Progress). Sau khi xe trả khách an toàn và thu tiền cước xong, bấm "Hoàn thành" (Completed) để hệ thống ghi nhận doanh thu.',
      },
      {
        step: '5',
        title: 'Xử lý khi khách Hủy chuyến',
        content:
          'Nếu khách đổi lịch hoặc hủy, bấm "Hủy đơn" và bắt buộc chọn/nhập lý do cụ thể (Tránh hủy đơn tùy tiện làm sai lệch dữ liệu thống kê).',
      },
    ],
    tips: [
      'Gõ số điện thoại khách hoặc mã đơn vào ô tìm kiếm để tra cứu thông tin khách quen và lịch sử đặt xe trong vài giây.',
      'Luôn ghi chú thêm vào đơn nếu khách có hành lý cồng kềnh, thú cưng hoặc yêu cầu xuất hóa đơn VAT.',
    ],
  },
  {
    id: 'routes',
    name: 'Tuyến đường & Giá',
    href: '/routes',
    icon: MapPin,
    section: 'operations',
    sectionName: 'Vận hành xe',
    roles: ['admin', 'editor'],
    shortDesc: 'Quản trị lộ trình liên tỉnh, cấu hình 4 hạng vé cước, ghim Banner Top trang chủ & tối ưu SEO.',
    purpose: [
      'Định nghĩa danh mục các lộ trình di chuyển liên tỉnh (như Hải Phòng ⇄ Hà Nội, Hà Nội ⇄ Hạ Long, Nội Bài ⇄ các tỉnh).',
      'Thiết lập bảng giá cước chi tiết theo 4 hạng xe chuẩn: Ghép 1 người, Ghép 2 người, Bao xe 4-5 chỗ, Bao xe 7 chỗ.',
      'Cấu hình hiển thị SEO trang chủ: Ghim tuyến lên "Banner Top" trang chủ, tối ưu thẻ meta, URL slug và các câu hỏi thường gặp (FAQs).',
      'Bảo vệ thứ hạng từ khóa Google với cơ chế tự động cảnh báo tạo chuyển hướng 301 khi thay đổi đường dẫn URL slug.',
    ],
    howToUse: [
      {
        step: '1',
        title: 'Thêm tuyến mới & Đặt tên chuẩn',
        content:
          'Bấm nút "+ Thêm tuyến đường". Điền Điểm xuất phát, Điểm đến, tên hiển thị chuẩn dạng "Điểm đi ⇄ Điểm đến" (VD: Hải Phòng ⇄ Hà Nội). Hệ thống tự sinh URL slug thân thiện SEO.',
      },
      {
        step: '2',
        title: 'Cấu hình 4 hạng vé cước & Giá từ',
        content:
          'Điền giá vé theo từng hạng: Ghép 1 người (vé lẻ), Ghép 2 người (combo), Bao xe 4-5 chỗ (trọn gói), Bao xe 7 chỗ (xe gia đình). Hệ thống tự động tính "Giá từ" thấp nhất để hiển thị ra trang chủ.',
      },
      {
        step: '3',
        title: 'Cài đặt thời hạn áp dụng giá',
        content:
          'Chọn trường "Thời hạn áp dụng giá" (Price Valid Until) để quản lý biểu phí theo mùa vụ hoặc đợt cao điểm lễ tết.',
      },
      {
        step: '4',
        title: 'Bật Ghim Banner Top trang chủ',
        content:
          'Tích chọn "Hiện Banner Top" và điền nhãn ngắn (như "HOT NHẤT", "SÂN BAY") để tuyến xe xuất hiện ngay thanh banner trượt đầu trang chủ người dùng, thu hút lượt đặt tối đa.',
      },
      {
        step: '5',
        title: 'Điểm đón/trả & FAQs câu hỏi thường gặp',
        content:
          'Thêm các điểm đón trả phổ biến và câu hỏi thường gặp để tạo độ uy tín cho tuyến và tối ưu điểm Google Schema SEO.',
      },
    ],
    tips: [
      'Khi chỉnh sửa slug của tuyến đang hoạt động (Active), hệ thống sẽ cảnh báo tự động tạo quy tắc 301 Redirect để không làm mất thứ hạng Google.',
      'Bấm biểu tượng con mắt (Eye) để xem nhanh bảng tóm tắt chi tiết toàn bộ tuyến và bảng giá 4 hạng vé mà không cần vào trang chỉnh sửa.',
    ],
  },
  {
    id: 'articles',
    name: 'Bài viết',
    href: '/articles',
    icon: FileText,
    section: 'content',
    sectionName: 'Nội dung & SEO',
    roles: ['admin', 'editor'],
    shortDesc: 'Xây dựng cẩm nang kinh nghiệm, tin tức khuyến mãi & bài viết chuẩn SEO kéo khách hàng tự nhiên.',
    purpose: [
      'Kênh truyền thông, cẩm nang du lịch và bài viết chuẩn SEO Google giúp website tiếp cận hàng nghìn khách hàng tiềm năng tìm kiếm tự nhiên.',
      'Quản lý kho bài tin tức theo chuyên mục: Tin tức khuyến mãi, Cẩm nang đi xe ghép, Hướng dẫn đón trả sân bay, Kinh nghiệm du lịch liên tỉnh.',
      'Tăng thời gian khách ở lại trang (Time on site) và nâng cao độ uy tín cho thương hiệu nhà xe.',
    ],
    howToUse: [
      {
        step: '1',
        title: 'Tạo bài viết mới',
        content:
          'Bấm nút "+ Thêm bài viết mới". Nhập tiêu đề hấp dẫn, chọn chuyên mục phù hợp (Tin tức / Cẩm nang / Khuyến mãi) và chọn ảnh đại diện Thumbnail từ Thư viện Media.',
      },
      {
        step: '2',
        title: 'Soạn thảo nội dung phong phú',
        content:
          'Sử dụng trình soạn thảo Rich Text để định dạng văn bản: chèn tiêu đề H2/H3, hình ảnh xe thực tế, bảng giá vé tham khảo và danh sách gạch đầu dòng.',
      },
      {
        step: '3',
        title: 'Cấu hình thẻ SEO Google',
        content:
          'Điền Meta Title (dưới 60 ký tự), Meta Description tóm tắt hấp dẫn (dưới 160 ký tự) và từ khóa chính để bài viết dễ đạt Top tìm kiếm Google.',
      },
      {
        step: '4',
        title: 'Lưu nháp hoặc Xuất bản',
        content:
          'Chọn trạng thái "Bản nháp" (Draft) nếu đang trong quá trình biên tập, hoặc chọn "Xuất bản" (Published) để hiển thị công khai ngay lên website khách hàng.',
      },
    ],
    tips: [
      'Nên chèn liên kết nội bộ (Internal link) trỏ trực tiếp về các Tuyến đường liên quan để kích thích khách bấm đặt xe ngay sau khi đọc bài.',
      'Sử dụng các hình ảnh xe đời mới thật từ Thư viện Media để tăng độ tin cậy đối với khách hàng.',
    ],
  },
  {
    id: 'pages',
    name: 'Trang nội dung',
    href: '/pages',
    icon: Layers,
    section: 'content',
    sectionName: 'Nội dung & SEO',
    roles: ['admin', 'editor'],
    shortDesc: 'Quản trị các trang tĩnh & pháp lý: Về chúng tôi, Chính sách bảo mật, Điều khoản sử dụng dịch vụ.',
    purpose: [
      'Quản lý các trang thông tin cốt lõi và pháp lý bắt buộc của doanh nghiệp: "Về chúng tôi", "Chính sách bảo mật", "Điều khoản dịch vụ", "Chính sách hoàn hủy vé & đặt cọc", "Quy định đón trả tận nơi".',
      'Xây dựng uy tín thương hiệu và đáp ứng đầy đủ điều kiện pháp lý khi đăng ký website vận tải với Bộ Công Thương.',
      'Cung cấp thông tin minh bạch, giảm thiểu tranh chấp với khách hàng về tiền cọc và thời gian đón.',
    ],
    howToUse: [
      {
        step: '1',
        title: 'Phân biệt Trang hệ thống & Trang nội dung',
        content:
          'Trang hệ thống (kind=system) được bảo vệ cố định đường dẫn để tích hợp vào menu chính và chân trang (không thể xóa). Trang nội dung (kind=content) cho phép tạo thêm và xóa tự do.',
      },
      {
        step: '2',
        title: 'Tạo mới hoặc Chỉnh sửa trang',
        content:
          'Bấm "+ Tạo trang mới" hoặc bấm nút Sửa trên bảng danh sách. Nhập tiêu đề trang và đường dẫn slug (VD: `chinh-sach-bao-mat`, `ve-chung-toi`).',
      },
      {
        step: '3',
        title: 'Soạn thảo điều khoản rõ ràng',
        content:
          'Trình bày chi tiết quyền lợi hành khách, trách nhiệm của nhà xe và tài xế, quy định về hành lý quá khổ và quy trình xử lý sự cố chậm giờ.',
      },
      {
        step: '4',
        title: 'Xuất bản trang & Gắn vào Footer',
        content:
          'Chuyển trạng thái sang "Xuất bản" và gắn liên kết trang vào Chân trang (Footer) của website để khách hàng dễ dàng tra cứu.',
      },
    ],
    tips: [
      'Các trang chính sách cần được cập nhật thường xuyên khi nhà xe có thay đổi về quy định cọc hoặc phụ phí đón trả.',
      'Đảm bảo các trang chính sách luôn hoạt động và không bị lỗi link 404 để bảo vệ điểm SEO tổng thể.',
    ],
  },
  {
    id: 'media',
    name: 'Thư viện Media',
    href: '/media',
    icon: Image,
    section: 'content',
    sectionName: 'Nội dung & SEO',
    roles: ['admin', 'editor'],
    shortDesc: 'Kho lưu trữ ảnh tập trung: Quản lý ảnh xe, banner quảng cáo, avatar, copy URL nhanh chỉ với 1 cú nhấp.',
    purpose: [
      'Kho lưu trữ tập trung toàn bộ hình ảnh và tài nguyên đồ họa của website: ảnh các dòng xe 4-7 chỗ, ảnh banner quảng cáo, biểu tượng tiện ích, logo đối tác và ảnh bài viết.',
      'Giúp quản lý dung lượng tập trung, tối ưu tốc độ tải trang và tránh tải lên trùng lặp nhiều lần cùng một bức ảnh.',
      'Cho phép xem trước, lấy đường dẫn URL chuẩn và tái sử dụng hình ảnh ở mọi nơi trong hệ thống.',
    ],
    howToUse: [
      {
        step: '1',
        title: 'Tải ảnh mới lên hệ thống',
        content:
          'Bấm nút "Tải lên tệp mới", kéo thả file ảnh từ máy tính hoặc bấm chọn tệp (Hỗ trợ định dạng PNG, JPG, JPEG, WebP; dung lượng tối ưu < 2MB).',
      },
      {
        step: '2',
        title: 'Tìm kiếm & Phân loại ảnh',
        content:
          'Sử dụng ô tìm kiếm theo tên tệp hoặc lọc theo loại để nhanh chóng tìm lại các ảnh xe hoặc banner đã tải lên trước đó.',
      },
      {
        step: '3',
        title: 'Sao chép đường dẫn (Copy URL) 1-Click',
        content:
          'Nhấp vào ảnh bất kỳ để xem kích thước, dung lượng và bấm nút "Sao chép URL" để dán vào bài viết hoặc làm ảnh đại diện tuyến đường.',
      },
      {
        step: '4',
        title: 'Xóa tệp cũ để dọn dẹp bộ nhớ',
        content:
          'Xóa bớt các ảnh banner chương trình khuyến mãi đã hết hạn để tiết kiệm tài nguyên lưu trữ của máy chủ.',
      },
    ],
    tips: [
      'Nên đặt tên file ảnh không dấu, cách nhau bằng dấu gạch ngang (VD: `xe-7-cho-innova-2024.jpg`) để tối ưu SEO hình ảnh Google Images.',
      'Ưu tiên định dạng WebP hoặc JPG nén để website tải nhanh hơn trên điện thoại của khách hàng.',
    ],
  },
  {
    id: 'redirects',
    name: 'Chuyển hướng 301',
    href: '/redirects',
    icon: ArrowRightLeft,
    section: 'content',
    sectionName: 'Nội dung & SEO',
    roles: ['admin', 'editor'],
    shortDesc: 'Bảo vệ thứ hạng SEO: Tự động chuyển hướng link cũ sang link mới, loại bỏ triệt để lỗi 404 không tìm thấy trang.',
    purpose: [
      'Công cụ bảo vệ thứ hạng SEO chuyên sâu cho toàn bộ website.',
      'Khi thay đổi đường dẫn URL của một tuyến xe hoặc bài viết, link cũ đã lưu trên Google sẽ bị lỗi "404 - Không tìm thấy trang". Chuyển hướng 301 (Permanent Redirect) giúp tự động dẫn khách hàng và Google bot từ URL cũ sang URL mới tức thì.',
      'Giữ nguyên 100% điểm chất lượng SEO và không làm gián đoạn trải nghiệm của khách khi truy cập từ liên kết cũ.',
    ],
    howToUse: [
      {
        step: '1',
        title: 'Tạo tự động khi đổi Slug Tuyến đường/Bài viết',
        content:
          'Khi bạn chỉnh sửa URL slug của Tuyến đường hoặc Bài viết đang hoạt động, hệ thống sẽ tự động phát hiện và gợi ý tạo bản ghi chuyển hướng 301.',
      },
      {
        step: '2',
        title: 'Thêm quy tắc chuyển hướng thủ công',
        content:
          'Bấm nút "+ Thêm quy tắc chuyển hướng". Nhập Đường dẫn nguồn (Source URL, VD: `/xe-hai-phong-cu`) và Đường dẫn đích (Target URL, VD: `/routes/hai-phong-ha-noi`).',
      },
      {
        step: '3',
        title: 'Chọn mã chuyển hướng phù hợp',
        content:
          'Chọn mã `301 - Chuyển hướng vĩnh viễn` (Khuyên dùng cho SEO) hoặc `302 - Chuyển hướng tạm thời` nếu chỉ chuyển hướng trong đợt khuyến mãi ngắn ngày.',
      },
      {
        step: '4',
        title: 'Bật / Tắt quy tắc',
        content:
          'Có thể sử dụng công tắc gạt trạng thái để tạm dừng hoặc kích hoạt lại quy tắc chuyển hướng bất kỳ lúc nào.',
      },
    ],
    tips: [
      'Không tạo chuyển hướng vòng tròn (A trỏ tới B, rồi B lại trỏ ngược về A) vì sẽ làm trình duyệt báo lỗi Too Many Redirects.',
      'Sau khi tạo xong, hãy mở trình duyệt ở chế độ ẩn danh và gõ link cũ để kiểm tra xem hệ thống đã chuyển hướng mượt mà sang link mới chưa.',
    ],
  },
  {
    id: 'settings',
    name: 'Cấu hình chung',
    href: '/settings',
    icon: Settings,
    section: 'system',
    sectionName: 'Hệ thống',
    roles: ['admin'],
    shortDesc: 'Dành riêng Admin: Cài đặt thông tin nhà xe, hotline, Zalo đặt xe & bảng giá phụ.',
    purpose: [
      'Trung tâm cài đặt thông tin thương hiệu, thông số vận hành và các chính sách cốt lõi của nhà xe áp dụng trên toàn website.',
      'Quản lý thông tin công ty & Hotline và danh sách cam kết chất lượng dịch vụ (bảng giá phụ nằm ở mục "Bảng giá phụ").',
    ],
    howToUse: [
      {
        step: '1',
        title: 'Thông tin công ty & Hotline tổng đài',
        content:
          'Cập nhật Tên nhà xe, Hotline tổng đài, Số Zalo đặt xe, Địa chỉ văn phòng, Email hỗ trợ. Các số hotline này sẽ tự động liên kết với nút gọi nhanh trên giao diện website khách hàng.',
      },
      {
        step: '2',
        title: 'Quy định vận hành & Cam kết dịch vụ',
        content:
          'Quản lý danh sách cam kết chất lượng dịch vụ (đón đúng giờ, không tăng giá vô cớ...) hiển thị trên website khách hàng.',
      },
      {
        step: '3',
        title: 'Lưu cấu hình hệ thống',
        content:
          'Bấm "Lưu cấu hình" sau mỗi lần chỉnh sửa để hệ thống áp dụng ngay lập tức cho toàn bộ người dùng website.',
      },
    ],
    tips: [
      'Luôn kiểm tra kỹ số điện thoại Hotline và Zalo sau khi thay đổi bằng cách thử bấm nút gọi trên trang chủ khách hàng.',
      'Tính năng này chỉ dành riêng cho tài khoản Quản trị viên (Admin) để đảm bảo an toàn tuyệt đối cho hệ thống.',
    ],
  },
  {
    id: 'users',
    name: 'Quản lý tài khoản',
    href: '/users',
    icon: Users,
    section: 'system',
    sectionName: 'Hệ thống',
    roles: ['admin'],
    shortDesc: 'Dành riêng Admin: Phân quyền nhân sự (Admin, Dispatcher, Editor), cấp mật khẩu & khóa tài khoản.',
    purpose: [
      'Quản trị danh sách nhân sự vận hành hệ thống theo cơ chế phân quyền vai trò (RBAC - Role-Based Access Control).',
      'Đảm bảo an toàn thông tin khách hàng: mỗi nhân viên chỉ truy cập đúng tính năng thuộc phạm vi phụ trách, ngăn ngừa việc nhân viên tự ý sửa giá hoặc cấu hình máy chủ.',
    ],
    howToUse: [
      {
        step: '1',
        title: 'Hiểu rõ 3 nhóm quyền hạn trong hệ thống',
        content:
          '• Quản trị viên (Admin): Toàn quyền truy cập mọi tính năng.\n• Điều phối viên (Dispatcher): Tiếp nhận và xử lý đơn đặt xe, liên hệ khách, xem tổng quan (Bị ẩn cấu hình và quản trị tài khoản).\n• Biên tập viên (Editor): Quản lý bài viết, trang tĩnh, tuyến đường, media, chuyển hướng 301 (Bị ẩn đơn xe khách đặt và cấu hình).',
      },
      {
        step: '2',
        title: 'Thêm tài khoản nhân viên mới',
        content:
          'Bấm "+ Thêm tài khoản mới". Nhập Họ tên, Email công việc, Mật khẩu khởi tạo và chọn đúng Vai trò (Admin / Editor / Dispatcher).',
      },
      {
        step: '3',
        title: 'Khóa tài khoản khẩn cấp',
        content:
          'Khi nhân viên nghỉ việc hoặc thay đổi ca kíp, bấm "Khóa tài khoản" để lập tức thu hồi quyền truy cập mà vẫn giữ nguyên lịch sử làm việc cũ.',
      },
      {
        step: '4',
        title: 'Cấp lại mật khẩu & Cập nhật vai trò',
        content:
          'Bấm biểu tượng chỉnh sửa để đặt lại mật khẩu an toàn hoặc điều chỉnh nâng/hạ quyền khi nhân viên thay đổi vị trí công tác.',
      },
    ],
    tips: [
      'Không chia sẻ chung một tài khoản Admin cho nhiều người để dễ dàng truy vết nhật ký thao tác khi có sự cố.',
      'Khuyến khích nhân viên đặt mật khẩu có độ dài tối thiểu 8 ký tự gồm chữ hoa, chữ thường và số.',
    ],
  },
];

export const ROLE_NAMES: Record<Role, string> = {
  admin: 'Quản trị viên',
  dispatcher: 'Điều phối viên',
  editor: 'Biên tập viên',
};

export const ROLE_BADGE_COLORS: Record<Role, string> = {
  admin: 'bg-rose-50 text-rose-700 border-rose-200',
  dispatcher: 'bg-amber-50 text-amber-700 border-amber-200',
  editor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const WORKFLOW_STEPS = [
  {
    step: '1',
    title: 'Tiếp nhận đơn Chờ duyệt (Pending)',
    desc: 'Đơn mới do khách đặt trên website sẽ xuất hiện tại bảng tổng quan hoặc mục Đơn đặt xe với nhãn màu cam "Chờ duyệt".',
  },
  {
    step: '2',
    title: 'Xem chi tiết & Gọi điện xác nhận',
    desc: 'Bấm vào mã đơn hoặc nút "Xem & Xử lý". Kiểm tra điểm đón trả, số người, hành lý và báo giá cước chính xác.',
  },
  {
    step: '3',
    title: 'Xác nhận đơn (Confirmed)',
    desc: 'Đổi trạng thái thành Đã xác nhận (Confirmed) để giữ chỗ. Khi xe bắt đầu đón khách, đổi sang Đang chạy (In Progress).',
  },
  {
    step: '4',
    title: 'Hoàn thành chuyến hoặc Hủy đơn có lý do',
    desc: 'Sau khi tài xế đón trả khách an toàn và thu tiền cước, đổi sang Hoàn thành (Completed) để ghi nhận doanh thu. Nếu khách đổi ý, bấm Hủy đơn và nhập lý do.',
  },
];
