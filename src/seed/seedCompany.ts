import { loadEnv } from "payload/node";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");

/**
 * Seed global `company_settings` — thông tin công ty từ TestSEO (spec 4.2.10 / T048).
 * Nguồn: `TestSEO/src/data/company-info.ts`. Chạy: `npm run seed:company`.
 * Idempotent: update global (chỉ một doc). Derived (hotlineHref/zaloHref/…)
 * tính lúc đọc — không lưu DB (FR-D10).
 */

export const SEED_COMPANY = {
  identity: {
    companyName: "Xe Ghép Liên Tỉnh",
    brandName: "Xe Ghép Liên Tỉnh",
    website: "https://xegheplientinh.vn",
  },
  contact: {
    hotline: "0962.298.293",
    hotlineRaw: "0962298293",
    secondaryPhone: { label: "Tổng đài lưu đêm", number: "0858.911.247" },
    email: "xegheplientinhvip@gmail.com",
    zaloUrl: "https://zalo.me/0962298293",
    fanpageName: "Xe Ghép Bắc Giang - Bắc Ninh - Hải Phòng",
    fanpageUrl: "https://www.facebook.com/xeghepbacgiangbacninhhaiphong",
  },
  location: {
    address: "Hải Phòng",
    latitude: 20.8449115,
    longitude: 106.6880842,
  },
  banner: {
    topBannerLine1: "XE GHÉP: MÓNG CÁI - HẠ LONG - HẢI PHÒNG - BẮC NINH - BẮC GIANG - HÀ NỘI",
    topBannerLine2: "ĐẶT XE LIÊN HỆ NGAY: 0962.298.293",
    coverage: "Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh – Bắc Giang – Hà Nội",
    workingHours: "Phục vụ 24/7 (Cả ngày lẫn đêm, các ngày lễ tết)",
    fleetDescription:
      "100% xe riêng đời mới 4, 5, 7 chỗ, điều hòa mát lạnh, sạch sẽ, bảo dưỡng định kỳ",
    bookingPromise:
      "Giá rõ ràng đã bao gồm cầu đường bến bãi – Đưa đón tận nhà – Miễn phí hủy chuyến",
    summary:
      "Dịch vụ xe ghép, xe tiện chuyến Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang. Xe chạy thẳng, nhanh, giá rõ ràng, đón trả tận nơi, phục vụ 24/7.",
  },
  brandSeo: {
    areaServed: [
      { type: "City" as const, name: "Hải Phòng" },
      { type: "City" as const, name: "Hà Nội" },
      { type: "AdministrativeArea" as const, name: "Quảng Ninh" },
      { type: "AdministrativeArea" as const, name: "Bắc Ninh" },
      { type: "AdministrativeArea" as const, name: "Bắc Giang" },
    ],
    priceRange: "₫",
  },
  commitments: [
    {
      title: "Cam kết hoàn tiền 100%",
      description:
        "Chúng tôi cam kết 100% hoàn tiền nếu xe không đảm bảo chất lượng chuyến đi của quý khách.",
      iconName: "ShieldCheck" as const,
    },
    {
      title: "Đưa đón tận nhà",
      description:
        "Phục vụ đưa đón tận nhà cả 2 chiều, tối ưu lộ trình và giảm tối đa chi phí đi lại cho khách hàng.",
      iconName: "MapPin" as const,
    },
    {
      title: "Lái xe dày dạn kinh nghiệm",
      description:
        "Đội ngũ lái xe chuyên nghiệp, nhiệt tình, nhiều năm kinh nghiệm lái xe đường trường an toàn.",
      iconName: "Users" as const,
    },
    {
      title: "Mức giá tốt nhất",
      description:
        "Luôn cam kết với mức giá tốt nhất cho khách hàng, minh bạch không phát sinh phụ phí vô lý.",
      iconName: "BadgePercent" as const,
    },
    {
      title: "Miễn phí hủy chuyến",
      description:
        "Miễn phí hủy chuyến khi khách hàng có sự thay đổi lộ trình hoặc công việc phát sinh đột xuất.",
      iconName: "Clock" as const,
    },
    {
      title: "Đền 200% chất lượng dịch vụ",
      description:
        "Chính sách hoàn lại tiền 100% và đền 200% nếu dịch vụ không đúng như cam kết và thỏa thuận.",
      iconName: "Award" as const,
    },
  ],
  paymentMethods: [
    {
      title: "Tiền mặt trực tiếp",
      description:
        "Thanh toán bằng tiền mặt cho tài xế sau khi chuyến đi hoàn thành an toàn.",
      iconName: "Banknote" as const,
    },
    {
      title: "Chuyển khoản trực tuyến",
      description:
        "Chuyển khoản qua Internet Banking / quét mã QR sau chuyến đi hoặc khi đặt cọc bao xe.",
      iconName: "CreditCard" as const,
    },
  ],
  testimonials: [
    {
      author: "Anh Nguyễn Tuấn Anh",
      location: "Bắc Ninh",
      content:
        "Đi từ KCN Quế Võ về Hải Phòng công tác thường xuyên, giá ghép chỉ 400k - 500k mà xe đón tận sảnh, chỉ 1-2 khách trên xe rất thoáng đãng.",
      rating: 5,
      avatarText: "TA",
      isVisible: true,
    },
    {
      author: "Chị Hoàng Mai Lan",
      location: "Móng Cái, Quảng Ninh",
      content:
        "Tuyến Móng Cái đi Hà Nội chạy cao tốc rất nhanh, tài xế lái cẩn thận, xe 7 chỗ sạch sẽ. Gửi hàng bưu phẩm cũng rất uy tín chỉ từ 150k.",
      rating: 5,
      avatarText: "ML",
      isVisible: true,
    },
    {
      author: "Bác Lê Văn Thắng",
      location: "Hạ Long, Quảng Ninh",
      content:
        "Bao xe 5 chỗ sang Bắc Giang ăn cưới trọn gói 900k, xe riêng đời mới, bác tài nhiệt tình chu đáo, đúng giờ.",
      rating: 5,
      avatarText: "VT",
      isVisible: true,
    },
    {
      author: "Chị Đỗ Thu Trang",
      location: "Hà Nội",
      content:
        "Đặt xe đi sân bay Nội Bài và Hải Phòng được tổng đài hỗ trợ nhanh chóng, cam kết hoàn tiền và xe riêng không mùi làm tôi rất an tâm.",
      rating: 5,
      avatarText: "TT",
      isVisible: true,
    },
  ],
};

const invokedAsScript = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("/seedCompany.ts");

if (invokedAsScript) {
  const payload = await getPayload({ config });

  const doc = await payload.updateGlobal({
    slug: "company_settings",
    data: SEED_COMPANY,
    overrideAccess: true,
  });

  if (doc.identity?.companyName !== SEED_COMPANY.identity.companyName) {
    throw new Error("Lệch companyName sau seed company_settings.");
  }

  payload.logger.info(
    `Seed company_settings: ${doc.commitments?.length ?? 0} cam kết, ${doc.testimonials?.length ?? 0} đánh giá, hotline=${doc.contact?.hotline}.`,
  );
  await payload.destroy();
  process.exit(0);
}
