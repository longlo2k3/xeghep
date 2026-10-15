export interface Commitment {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface Testimonial {
  id: string;
  author: string;
  location: string;
  content: string;
  rating: number;
  avatarText: string;
}

export const COMPANY_INFO = {
  name: "Xe Ghép Liên Tỉnh",
  brandName: "Xe Ghép Liên Tỉnh",
  hotline: "0962.298.293",
  hotlineRaw: "0962298293",
  hotlineHref: "tel:0962298293",
  zaloHref: "https://zalo.me/0962298293",
  smsHref: "sms:0962298293",
  email: "xegheplientinhvip@gmail.com",
  website: "https://xegheplientinh.vn",
  domainName: "xegheplientinh.vn",
  fanpage: "Xe Ghép Bắc Giang - Bắc Ninh - Hải Phòng",
  fanpageUrl: "https://www.facebook.com/xeghepbacgiangbacninhhaiphong",
  topBannerLine1:
    "XE GHÉP: MÓNG CÁI - HẠ LONG - HẢI PHÒNG - BẮC NINH - BẮC GIANG - HÀ NỘI",
  topBannerLine2: "ĐẶT XE LIÊN HỆ NGAY: 0962.298.293",
  coverage: "Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh – Bắc Giang – Hà Nội",
  workingHours: "Phục vụ 24/7 (Cả ngày lẫn đêm, các ngày lễ tết)",
  fleetDescription:
    "100% xe riêng đời mới 4, 5, 7 chỗ, điều hòa mát lạnh, sạch sẽ, bảo dưỡng định kỳ",
  bookingPromise:
    "Giá rõ ràng đã bao gồm cầu đường bến bãi – Đưa đón tận nhà – Miễn phí hủy chuyến",
  summary:
    "Dịch vụ xe ghép, xe tiện chuyến Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang. Xe chạy thẳng, nhanh, giá rõ ràng, đón trả tận nơi, phục vụ 24/7.",
};

export const SIX_COMMITMENTS: Commitment[] = [
  {
    id: "cam-ket-hoan-tien",
    title: "Cam kết hoàn tiền 100%",
    description:
      "Chúng tôi cam kết 100% hoàn tiền nếu xe không đảm bảo chất lượng chuyến đi của quý khách.",
    iconName: "ShieldCheck",
  },
  {
    id: "cam-ket-don-tan-nha",
    title: "Đưa đón tận nhà",
    description:
      "Phục vụ đưa đón tận nhà cả 2 chiều, tối ưu lộ trình và giảm tối đa chi phí đi lại cho khách hàng.",
    iconName: "MapPin",
  },
  {
    id: "cam-ket-lai-xe-chuyen-nghiep",
    title: "Lái xe dày dạn kinh nghiệm",
    description:
      "Đội ngũ lái xe chuyên nghiệp, nhiệt tình, nhiều năm kinh nghiệm lái xe đường trường an toàn.",
    iconName: "Users",
  },
  {
    id: "cam-ket-gia-tot-nhat",
    title: "Mức giá tốt nhất",
    description:
      "Luôn cam kết với mức giá tốt nhất cho khách hàng, minh bạch không phát sinh phụ phí vô lý.",
    iconName: "BadgePercent",
  },
  {
    id: "cam-ket-mien-phi-huy",
    title: "Miễn phí hủy chuyến",
    description:
      "Miễn phí hủy chuyến khi khách hàng có sự thay đổi lộ trình hoặc công việc phát sinh đột xuất.",
    iconName: "Clock",
  },
  {
    id: "cam-ket-den-200",
    title: "Đền 200% chất lượng dịch vụ",
    description:
      "Chính sách hoàn lại tiền 100% và đền 200% nếu dịch vụ không đúng như cam kết và thỏa thuận.",
    iconName: "Award",
  },
];

export const FIVE_COMMITMENTS = SIX_COMMITMENTS;

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "tien-mat",
    title: "Tiền mặt trực tiếp",
    description:
      "Thanh toán bằng tiền mặt cho tài xế sau khi chuyến đi hoàn thành an toàn.",
    iconName: "Banknote",
  },
  {
    id: "chuyen-khoan",
    title: "Chuyển khoản trực tuyến",
    description:
      "Chuyển khoản qua Internet Banking / quét mã QR sau chuyến đi hoặc khi đặt cọc bao xe.",
    iconName: "CreditCard",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "review-1",
    author: "Anh Nguyễn Tuấn Anh",
    location: "Bắc Ninh",
    content:
      "Đi từ KCN Quế Võ về Hải Phòng công tác thường xuyên, giá ghép chỉ 400k - 500k mà xe đón tận sảnh, chỉ 1-2 khách trên xe rất thoáng đãng.",
    rating: 5,
    avatarText: "TA",
  },
  {
    id: "review-2",
    author: "Chị Hoàng Mai Lan",
    location: "Móng Cái, Quảng Ninh",
    content:
      "Tuyến Móng Cái đi Hà Nội chạy cao tốc rất nhanh, tài xế lái cẩn thận, xe 7 chỗ sạch sẽ. Gửi hàng bưu phẩm cũng rất uy tín chỉ từ 150k.",
    rating: 5,
    avatarText: "ML",
  },
  {
    id: "review-3",
    author: "Bác Lê Văn Thắng",
    location: "Hạ Long, Quảng Ninh",
    content:
      "Bao xe 5 chỗ sang Bắc Giang ăn cưới trọn gói 900k, xe riêng đời mới, bác tài nhiệt tình chu đáo, đúng giờ.",
    rating: 5,
    avatarText: "VT",
  },
  {
    id: "review-4",
    author: "Chị Đỗ Thu Trang",
    location: "Hà Nội",
    content:
      "Đặt xe đi sân bay Nội Bài và Hải Phòng được tổng đài hỗ trợ nhanh chóng, cam kết hoàn tiền và xe riêng không mùi làm tôi rất an tâm.",
    rating: 5,
    avatarText: "TT",
  },
];
